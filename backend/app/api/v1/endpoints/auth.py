from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.user import User
from app.models.user import UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.security.passwords import hash_password, verify_password
from app.security.tokens import create_access_token, decode_access_token


router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)

DbSession = Annotated[Session, Depends(get_db)]
BearerCredentials = Annotated[
    HTTPAuthorizationCredentials | None,
    Depends(bearer_scheme),
]


def get_current_user(
    db: DbSession,
    credentials: BearerCredentials,
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )

    try:
        payload = decode_access_token(credentials.credentials)
        subject = payload.get("sub")
        user_id = int(subject) if subject is not None else None
    except (ValueError, TypeError, jwt.InvalidTokenError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        ) from exc

    user = UserRepository(db).get_by_id(user_id) if user_id is not None else None

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
        )

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_photo_manager(current_user: CurrentUser) -> User:
    if current_user.role not in {UserRole.CREATOR, UserRole.ADMINISTRATOR}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators and administrators can manage photos.",
        )

    return current_user


CurrentPhotoManager = Annotated[User, Depends(require_photo_manager)]


def require_active_photo_manager(current_user: CurrentPhotoManager) -> User:
    if current_user.role == UserRole.CREATOR and current_user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Blocked creators cannot upload or edit photos.",
        )

    return current_user


CurrentActivePhotoManager = Annotated[User, Depends(require_active_photo_manager)]


def require_photo_viewer(current_user: CurrentUser) -> User:
    if current_user.role not in {UserRole.CREATOR, UserRole.ADMINISTRATOR}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators and administrators can access photos.",
        )

    return current_user


CurrentPhotoViewer = Annotated[User, Depends(require_photo_viewer)]


def require_administrator(current_user: CurrentUser) -> User:
    if current_user.role != UserRole.ADMINISTRATOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access moderation routes.",
        )

    return current_user


CurrentAdministrator = Annotated[User, Depends(require_administrator)]


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_creator(payload: RegisterRequest, db: DbSession) -> RegisterResponse:
    repository = UserRepository(db)
    normalized_email = payload.email.strip().lower()
    normalized_username = payload.username.strip()

    if repository.get_by_email(normalized_email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or username is already in use.",
        )

    if repository.get_by_username(normalized_username) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or username is already in use.",
        )

    user = repository.create_creator(
        email=normalized_email,
        username=normalized_username,
        password_hash=hash_password(payload.password),
    )
    return RegisterResponse(user=user)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: DbSession) -> LoginResponse:
    repository = UserRepository(db)
    user = repository.get_by_email(payload.email.strip().lower())

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    user = repository.record_successful_login(user)
    access_token = create_access_token(subject=str(user.id))

    return LoginResponse(
        access_token=access_token,
        user=user,
    )


@router.get("/me", response_model=CurrentUserResponse)
def read_current_user(current_user: CurrentUser) -> CurrentUserResponse:
    return CurrentUserResponse(user=current_user)
