# P21 Security Architecture & Policy

This document details the security model, risk mitigations, authentication mechanisms, data isolation policies, and administration controls implemented in **P21: AI Scheme-Matching Advisor for Indian Entrepreneurs**.

---

## 1. Threat Model & Design Principles

P21 is designed as a locally hosted, production-grade application handling sensitive entrepreneurial personal and financial data. The architecture adheres to the following principles:

1. **Defense in Depth**: Security controls are enforced at network, transport, application, and database tiers.
2. **Authoritative Backend Security**: The backend independently verifies authentication, authorization, and tenant isolation on every single request. Frontend UI visibility is never considered an access barrier.
3. **Zero Plaintext Credentials**: Passwords, tokens, and raw reset keys are never stored in plaintext, logged, or returned in API responses.
4. **Deterministic Auditing**: All administrative actions (user deactivations, scheme verifications, system bootstraps) create immutable audit logs with timestamps and IP records.

---

## 2. Authentication & Session Security

### 2.1 Password Hashing & Handling
- **Algorithm**: `bcrypt` with automatic salt generation and work factor 12 (`passlib.context.CryptContext(schemes=["bcrypt"])`).
- **Policy**: Minimum 8 characters. Plaintext passwords exist only in ephemeral request memory during authentication or hashing and are immediately discarded.
- **No OTP/SMS Dependency**: P21 eliminates insecure SMS-based OTP workflows. Contact mobile numbers are stored purely as optional contact attributes and are strictly forbidden from being used as authentication or recovery factors.

### 2.2 Server-Side Sessions & Cookie Security
- Authentication tokens are generated as signed JSON Web Tokens (JWT) using `HS256` signed by `SECRET_KEY` (minimum 64-char cryptographically random secret).
- Tokens are delivered via an `HTTP-only` cookie (`p21_session`), preventing access from malicious JavaScript or XSS vectors.
- Cookie parameters:
  - `HttpOnly = true`: Immune to `document.cookie` DOM access.
  - `SameSite = Lax`: Prevents unauthorized cross-site requests while supporting normal top-level navigation.
  - `Secure`: Dynamically configurable (`COOKIE_SECURE=false` for local `http://` demonstration; `COOKIE_SECURE=true` in TLS/HTTPS environments).
  - `Path = /`: Accessible across application endpoints.
- Expiring session lifetimes: 12 hours for standard sessions; 7 days for explicitly flagged "Remember Me" sessions.

### 2.3 CSRF (Cross-Site Request Forgery) Protection
- State-changing HTTP methods (`POST`, `PUT`, `DELETE`, `PATCH`) require double-submit verification.
- The server generates an HMAC-SHA256 signed CSRF token using `CSRF_SECRET`.
- The client reads the CSRF token from the login/registration response payload and includes it in the `X-CSRF-Token` header.
- Endpoint validation verifies the token signature and expiration, thwarting cross-origin request attempts.

### 2.4 Rate Limiting & Brute-Force Defense
- An in-memory sliding-window rate limiter protects authentication routes (`/api/auth/login` and `/api/auth/admin-login`).
- Configured by default to 5 failed attempts per 60 seconds per IP address.
- Returns HTTP `429 Too Many Requests` with a `Retry-After` header when thresholds are breached.
- Login failures return a generic error message (*"Invalid email or password"*) that does not leak whether the email address exists in the system.

---

## 3. Authorization & Tenant Isolation

### 3.1 Separate Portals, Unified Enforcement
- **User Portal**: Endpoints under `/api/profile`, `/api/assessments`, `/api/saved`, `/api/checklist` require an active user session.
- **Admin Portal**: Endpoints under `/api/admin/*` require verified membership in the `admin` role (`require_admin` dependency).
- The portal distinction is enforced by backend database role queries (`Role` -> `UserRole` -> `User`).
- Submitting `role=admin` or attempting to register as an administrator is rejected by the API schema.

### 3.2 Tenant Isolation (IDOR Defense)
- Insecure Direct Object References (IDOR) are prevented by scoping queries to `current_user.id`.
- Example: Fetching or updating user profiles, assessment history, saved schemes, and document checklists explicitly binds `user_id == current_user.id`. Users cannot view or mutate another applicant's data even if they know the resource ID.

---

## 4. Password Recovery Policy (No OTP)

In compliance with project specifications, P21 implements a secure, token-hash-based recovery system with an administrative development fallback:

1. **Standard Cryptographic Token Flow**:
   - The user requests a reset via `/api/auth/forgot-password`.
   - The server creates a cryptographically random 32-byte hexadecimal token (`secrets.token_urlsafe(32)`).
   - Only the SHA-256 hash of the token (`hashlib.sha256(token).hexdigest()`) is stored in the `password_reset_tokens` table.
   - The token has a strict 1-hour expiration window (`expires_at`) and is permanently invalidated (`used=True`) upon first use.
   - The raw token is returned only in local development responses or emailed when an SMTP server is active; it is never logged to disk or permanent tables.

2. **Administrator-Assisted Development Recovery Procedure**:
   - When no local email transport is active, an administrator can generate an expiring password reset token for the user via the Admin User Management panel (`POST /api/admin/users/{user_id}/reset-token`).
   - The administrator securely communicates the one-time reset link (`/auth/reset-password?token=...`) to the user.
   - The user sets a new password, triggering cryptographic re-hashing and immediate token invalidation.

---

## 5. Database & Query Safety

### 5.1 Parameterized SQL Queries
- All database interactions utilize SQLAlchemy ORM with bound parameters.
- Raw SQL concatenation is strictly prohibited, providing complete immunity against SQL injection attacks.

### 5.2 Constraint Enforcement
- Relational integrity is enforced at the database level using PostgreSQL foreign keys with `ON DELETE CASCADE` where appropriate.
- Email uniqueness is guaranteed via a PostgreSQL unique index (`ix_users_email`).

---

## 6. Audit Logging & Administrative Accountability

The `audit_logs` table records significant administrative actions:
- Administrator bootstrap events (`BOOTSTRAP_ADMIN`)
- User activation and suspension (`ADMIN_UPDATE_USER_STATUS`)
- Scheme verification status transitions (`ADMIN_UPDATE_SCHEME_STATUS`)
- Administrative password reset token generation (`ADMIN_GENERATE_RESET_TOKEN`)

Each audit record captures:
- `user_id`: Administrator who performed the action
- `action`: Specific action code
- `resource_type` and `resource_id`: Affected entity
- `ip_address`: Originating network address
- `details`: JSON payload containing justification or change summary
- `created_at`: UTC timestamp

---

## 7. Operational Security & Secrets Management

1. **Environment Separation**:
   - Secrets are loaded exclusively via environment variables (`.env`) through `pydantic-settings`.
   - No hardcoded keys or default administrative passwords exist in source code.
   - `scripts/setup.ps1` auto-generates unique 64-character secrets for `SECRET_KEY` and `CSRF_SECRET` on first run.

2. **Database Backup & Restoration**:
   - Automated backup script `scripts/backup-db.ps1` creates atomic SQL dumps into `backups/`.
   - Restore script `scripts/restore-db.ps1` provides interactive confirmation prompts before applying schema restoration.
