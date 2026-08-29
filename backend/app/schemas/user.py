"""Pydantic schemas for User-related requests and responses."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    """Payload for POST /api/auth/register"""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


class UserLogin(BaseModel):
    """Payload for POST /api/auth/login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Public-facing representation of a user (never includes the password)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str | None
    created_at: datetime


class Token(BaseModel):
    """JWT access token response returned after successful login/registration."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
