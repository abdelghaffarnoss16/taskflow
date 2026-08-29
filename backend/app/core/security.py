"""
Security utilities: password hashing and JWT token creation/verification.

- Passwords are hashed with bcrypt (via passlib) — plaintext passwords are
  never stored anywhere.
- JWTs are signed with SECRET_KEY using the algorithm configured in
  Settings (default HS256).
"""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password for safe storage."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plaintext password against its stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict[str, Any]) -> str:
    """
    Create a signed JWT access token.

    The token payload includes an expiration claim ("exp") based on
    ACCESS_TOKEN_EXPIRE_MINUTES from settings.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any] | None:
    """
    Decode and verify a JWT access token.

    Returns the decoded payload, or None if the token is invalid or expired.
    """
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
