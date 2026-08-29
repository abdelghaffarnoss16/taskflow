"""Authentication routes: register and login."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.database.session import get_db
from app.schemas.user import Token, UserLogin, UserRegister, UserResponse
from app.services.auth_service import authenticate_user, create_user_token, register_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account and return a JWT access token."""
    try:
        user = register_user(db, payload)
    except ValueError as exc:
        logger.warning(f"Registration failed for {payload.email}: {exc}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    token = create_user_token(user)
    logger.info(f"New user registered: {user.email} (id={user.id})")
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT access token."""
    user = authenticate_user(db, payload)
    if not user:
        logger.warning(f"Failed login attempt for {payload.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_user_token(user)
    logger.info(f"User logged in: {user.email} (id={user.id})")
    return Token(access_token=token, user=UserResponse.model_validate(user))
