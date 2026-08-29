"""Business logic for user registration and authentication."""
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserLogin, UserRegister


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def register_user(db: Session, payload: UserRegister) -> User:
    """
    Create a new user with a securely hashed password.

    Raises ValueError if the email is already registered — the route layer
    translates this into an HTTP 400 response.
    """
    existing_user = get_user_by_email(db, payload.email)
    if existing_user:
        raise ValueError("Email is already registered")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, payload: UserLogin) -> User | None:
    """Verify credentials and return the User if valid, otherwise None."""
    user = get_user_by_email(db, payload.email)
    if not user:
        return None
    if not verify_password(payload.password, user.hashed_password):
        return None
    return user


def create_user_token(user: User) -> str:
    """Create a JWT access token for a given user."""
    return create_access_token(data={"sub": str(user.id)})
