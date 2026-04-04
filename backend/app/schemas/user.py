from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.user import UserRole


class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    role: UserRole = UserRole.CREATOR


class UserRead(BaseModel):
    id: int
    email: str
    username: str
    role: UserRole
    is_blocked: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    user: UserRead


class UserListResponse(BaseModel):
    users: list[UserRead]
