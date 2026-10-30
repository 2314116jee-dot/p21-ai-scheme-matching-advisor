from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from typing import Dict, Any

from backend.database import get_db
from backend.config import settings
from backend.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    AdminLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AuthResponse,
    UserResponse,
)
from backend.services.auth_service import (
    register_user,
    authenticate_user,
    create_access_token,
    generate_csrf_token,
    generate_password_reset_token,
    hash_token,
    hash_password,
)
from backend.services.audit_service import record_audit_log
from backend.api.deps import get_current_user
from backend.models.user import User, PasswordResetToken
import datetime

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _set_auth_cookie(response: Response, token: str, remember_me: bool = False):
    max_age = 7 * 86400 if remember_me else settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key="p21_access_token",
        value=token,
        max_age=max_age,
        expires=max_age,
        path="/",
        domain=None,
        secure=settings.COOKIE_SECURE,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
    )


def _format_user_response(user: User) -> UserResponse:
    roles = [ur.role.name for ur in user.roles if ur.role]
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        mobile_number=user.mobile_number,
        is_active=user.is_active,
        is_verified=user.is_verified,
        roles=roles,
        has_profile=user.profile is not None,
        created_at=user.created_at,
    )


@router.get("/csrf-token")
def get_csrf():
    """Retrieve a new signed CSRF token for state-changing requests."""
    return {"csrf_token": generate_csrf_token()}


@router.post("/register", response_model=AuthResponse)
def register(
    payload: UserRegisterRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "127.0.0.1"
    user = register_user(
        db=db,
        email=payload.email,
        password=payload.password,
        full_name=payload.full_name,
        mobile_number=payload.mobile_number,
        terms_accepted=payload.terms_accepted,
        ip_address=client_ip
    )

    token = create_access_token({"sub": str(user.id), "email": user.email})
    _set_auth_cookie(response, token)
    csrf_tok = generate_csrf_token()

    return AuthResponse(
        user=_format_user_response(user),
        csrf_token=csrf_tok,
        message="Registration successful. Welcome to P21."
    )


@router.post("/login", response_model=AuthResponse)
def login(
    payload: UserLoginRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "127.0.0.1"
    user = authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password,
        ip_address=client_ip,
        is_admin_portal=False
    )

    token = create_access_token(
        {"sub": str(user.id), "email": user.email},
        expires_delta=datetime.timedelta(days=7) if payload.remember_me else None
    )
    _set_auth_cookie(response, token, remember_me=bool(payload.remember_me))
    csrf_tok = generate_csrf_token()

    return AuthResponse(
        user=_format_user_response(user),
        csrf_token=csrf_tok,
        message="Signed in successfully."
    )


@router.post("/admin-login", response_model=AuthResponse)
def admin_login(
    payload: AdminLoginRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "127.0.0.1"
    user = authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password,
        ip_address=client_ip,
        is_admin_portal=True
    )

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": "admin"})
    _set_auth_cookie(response, token)
    csrf_tok = generate_csrf_token()

    return AuthResponse(
        user=_format_user_response(user),
        csrf_token=csrf_tok,
        message="Administrator authentication verified."
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    return _format_user_response(current_user)


@router.post("/logout")
def logout(response: Response, current_user: User = Depends(get_current_user)):
    response.delete_cookie(
        key="p21_access_token",
        path="/",
        domain=None,
        secure=settings.COOKIE_SECURE,
        httponly=True,
        samesite=settings.COOKIE_SAMESITE,
    )
    return {"message": "Logged out successfully."}


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    # Safe response that does not leak email existence
    user = db.query(User).filter(User.email == payload.email).first()
    if user and user.is_active:
        raw_token, _ = generate_password_reset_token(db, user)
        # In local development mode without SMTP mail server, log safely or provide procedure
        return {
            "message": "If this email is registered, password reset instructions have been generated.",
            "dev_recovery_token": raw_token if settings.ENVIRONMENT == "development" else None
        }
    return {
        "message": "If this email is registered, password reset instructions have been generated.",
        "dev_recovery_token": None
    }


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "127.0.0.1"
    tok_hash = hash_token(payload.token)
    db_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == tok_hash,
        PasswordResetToken.is_used == False,
        PasswordResetToken.expires_at > datetime.datetime.now(datetime.timezone.utc)
    ).first()

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The password reset token is invalid or has expired."
        )

    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account unavailable.")

    user.password_hash = hash_password(payload.new_password)
    db_token.is_used = True
    db.commit()

    record_audit_log(
        db,
        action="PASSWORD_RESET_COMPLETED",
        resource_type="user",
        resource_id=str(user.id),
        user_id=user.id,
        ip_address=client_ip
    )
    return {"message": "Your password has been successfully reset. You may now sign in."}
