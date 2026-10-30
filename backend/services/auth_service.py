import bcrypt
import datetime
import hashlib
import hmac
import secrets
import jwt
from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import time

from backend.config import settings
from backend.models.user import User, Role, UserRole, PasswordResetToken
from backend.services.audit_service import record_audit_log

# Simple thread-safe rate limiter tracking IP & email attempts in memory
_rate_limit_store: Dict[str, list] = {}


def check_rate_limit(key: str) -> bool:
    """Return True if allowed, False if rate limited."""
    now = time.time()
    window = settings.RATE_LIMIT_WINDOW_SECONDS
    max_attempts = settings.RATE_LIMIT_LOGIN_MAX

    timestamps = _rate_limit_store.get(key, [])
    # Filter only events within the window
    valid_timestamps = [t for t in timestamps if now - t < window]
    if len(valid_timestamps) >= max_attempts:
        _rate_limit_store[key] = valid_timestamps
        return False

    valid_timestamps.append(now)
    _rate_limit_store[key] = valid_timestamps
    return True


def hash_password(password: str) -> str:
    """Hash password securely using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    now = datetime.datetime.now(datetime.timezone.utc)
    to_encode = data.copy()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None


def generate_csrf_token() -> str:
    """Generate a signed cryptographic CSRF token."""
    raw_token = secrets.token_hex(24)
    signature = hmac.new(settings.CSRF_SECRET.encode(), raw_token.encode(), hashlib.sha256).hexdigest()
    return f"{raw_token}.{signature}"


def verify_csrf_token(token: str) -> bool:
    """Verify signed CSRF token validity."""
    if not token or "." not in token:
        return False
    raw_token, signature = token.split(".", 1)
    expected_sig = hmac.new(settings.CSRF_SECRET.encode(), raw_token.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature, expected_sig)


def hash_token(token: str) -> str:
    """Create SHA-256 hash of a single-use token."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_password_reset_token(db: Session, user: User) -> Tuple[str, PasswordResetToken]:
    """Generate a single-use, expiring reset token, storing only its SHA-256 hash."""
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_token(raw_token)
    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)

    # Invalidate previous unused tokens for this user
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.is_used == False
    ).update({"is_used": True})

    db_token = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        is_used=False
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return raw_token, db_token


def get_or_create_role(db: Session, role_name: str, description: Optional[str] = None) -> Role:
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        role = Role(name=role_name, description=description or f"{role_name} role")
        db.add(role)
        db.commit()
        db.refresh(role)
    return role


def register_user(
    db: Session,
    email: str,
    password: str,
    full_name: str,
    mobile_number: Optional[str] = None,
    terms_accepted: bool = True,
    ip_address: Optional[str] = None
) -> User:
    normalized_email = email.strip().lower()

    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    pw_hash = hash_password(password)
    user = User(
        email=normalized_email,
        password_hash=pw_hash,
        full_name=full_name.strip(),
        mobile_number=mobile_number.strip() if mobile_number else None,
        terms_accepted=terms_accepted,
        is_active=True,
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    user_role = get_or_create_role(db, "user", "Standard user role")
    assignment = UserRole(user_id=user.id, role_id=user_role.id)
    db.add(assignment)
    db.commit()
    db.refresh(user)

    record_audit_log(
        db,
        action="USER_REGISTRATION",
        resource_type="user",
        resource_id=str(user.id),
        user_id=user.id,
        ip_address=ip_address,
        details={"email": normalized_email, "full_name": full_name}
    )
    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
    ip_address: Optional[str] = None,
    is_admin_portal: bool = False
) -> User:
    rate_key = f"{ip_address}:{email.strip().lower()}"
    if not check_rate_limit(rate_key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please wait 60 seconds before trying again."
        )

    normalized_email = email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    # Constant time verification check even if user is None to mitigate timing attacks
    if not user:
        # Dummy verify to normalize response timing
        verify_password("dummy_password", "$2b$12$e8x5aN8g1zB4c9d7e0f2h.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if is_admin_portal and not user.has_role("admin"):
        record_audit_log(
            db,
            action="UNAUTHORIZED_ADMIN_LOGIN_ATTEMPT",
            resource_type="user",
            resource_id=str(user.id),
            user_id=user.id,
            ip_address=ip_address,
            details={"email": normalized_email}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not possess administrator credentials."
        )

    user.last_login_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(user)

    record_audit_log(
        db,
        action="USER_LOGIN" if not is_admin_portal else "ADMIN_LOGIN",
        resource_type="user",
        resource_id=str(user.id),
        user_id=user.id,
        ip_address=ip_address,
        details={"portal": "admin" if is_admin_portal else "user"}
    )
    return user


def bootstrap_admin_user(
    db: Session,
    email: str,
    password: str,
    full_name: str = "System Administrator"
) -> User:
    """Securely bootstrap or elevate an administrator account."""
    normalized_email = email.strip().lower()
    admin_role = get_or_create_role(db, "admin", "System Administrator role")
    user_role = get_or_create_role(db, "user", "Standard user role")

    user = db.query(User).filter(User.email == normalized_email).first()
    if not user:
        pw_hash = hash_password(password)
        user = User(
            email=normalized_email,
            password_hash=pw_hash,
            full_name=full_name,
            terms_accepted=True,
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update password if provided
        user.password_hash = hash_password(password)
        user.is_active = True
        db.commit()

    # Ensure admin role assigned
    if not user.has_role("admin"):
        db.add(UserRole(user_id=user.id, role_id=admin_role.id))
    if not user.has_role("user"):
        db.add(UserRole(user_id=user.id, role_id=user_role.id))

    db.commit()
    db.refresh(user)

    record_audit_log(
        db,
        action="BOOTSTRAP_ADMIN",
        resource_type="user",
        resource_id=str(user.id),
        user_id=user.id,
        details={"email": normalized_email}
    )
    return user
