from pydantic import BaseModel, ConfigDict, Field

from app.models.user import UserRole


class AuthUserRead(BaseModel):
    id: int
    email: str
    username: str
    role: UserRole
    is_blocked: bool

    model_config = ConfigDict(from_attributes=True)


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=8, max_length=255)


class RegisterResponse(BaseModel):
    user: AuthUserRead


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=8, max_length=255)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserRead


class CurrentUserResponse(BaseModel):
    user: AuthUserRead
