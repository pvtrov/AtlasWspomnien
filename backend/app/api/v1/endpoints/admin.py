import mimetypes
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import CurrentAdministrator
from app.core.config import settings
from app.dependencies import get_db
from app.models.user import UserRole
from app.repositories.photo_category_repository import PhotoCategoryRepository
from app.repositories.photo_repository import PhotoRepository
from app.repositories.user_repository import UserRepository
from app.schemas.photo import PhotoResponse, PhotoUpdate
from app.schemas.user import UserListResponse, UserResponse
from app.services.photo_storage import PhotoStorageService


router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]


def get_photo_or_404(*, db: Session, photo_id: int):
    photo = PhotoRepository(db).get_by_id(photo_id=photo_id)
    if photo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found.",
        )
    return photo


@router.get("/users", response_model=UserListResponse)
def list_users(
    current_user: CurrentAdministrator,
    db: DbSession,
) -> UserListResponse:
    del current_user
    users = UserRepository(db).list_all()
    return UserListResponse(users=users)


@router.patch("/users/{user_id}/block", response_model=UserResponse)
def block_creator(
    user_id: int,
    current_user: CurrentAdministrator,
    db: DbSession,
) -> UserResponse:
    del current_user
    repository = UserRepository(db)
    user = repository.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.role != UserRole.CREATOR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only creators can be blocked.",
        )

    blocked_user = repository.set_blocked_state(user, is_blocked=True)
    return UserResponse(user=blocked_user)


@router.patch("/users/{user_id}/promote", response_model=UserResponse)
def promote_user_to_administrator(
    user_id: int,
    current_user: CurrentAdministrator,
    db: DbSession,
) -> UserResponse:
    del current_user
    repository = UserRepository(db)
    user = repository.get_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    promoted_user = repository.set_role(user, role=UserRole.ADMINISTRATOR)
    return UserResponse(user=promoted_user)


@router.patch("/photos/{photo_id}", response_model=PhotoResponse)
def update_photo_metadata(
    photo_id: int,
    payload: PhotoUpdate,
    current_user: CurrentAdministrator,
    db: DbSession,
) -> PhotoResponse:
    del current_user
    photo = get_photo_or_404(db=db, photo_id=photo_id)

    category = PhotoCategoryRepository(db).get_by_slug(payload.category_slug.strip())
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown photo category.",
        )

    updated_photo = PhotoRepository(db).update_metadata(
        photo,
        category_id=category.id,
        description=payload.description.strip(),
        location_text=payload.location_text.strip(),
        taken_year=payload.taken_year,
        taken_month=payload.taken_month,
        taken_day=payload.taken_day,
    )
    updated_photo.category = category
    return PhotoResponse(photo=updated_photo)


@router.delete("/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(
    photo_id: int,
    current_user: CurrentAdministrator,
    db: DbSession,
) -> None:
    del current_user
    photo = get_photo_or_404(db=db, photo_id=photo_id)
    file_reference = photo.file_reference

    PhotoRepository(db).delete(photo)

    if file_reference:
        PhotoStorageService(settings.photo_storage_dir).delete_photo(file_reference)


@router.get("/photos/{photo_id}/image")
def get_photo_image(
    photo_id: int,
    current_user: CurrentAdministrator,
    db: DbSession,
) -> FileResponse:
    del current_user
    photo = get_photo_or_404(db=db, photo_id=photo_id)

    if not photo.file_reference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo file not found.",
        )

    storage_service = PhotoStorageService(settings.photo_storage_dir)
    photo_path = storage_service.resolve_photo_path(photo.file_reference)

    if not photo_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo file not found.",
        )

    media_type = mimetypes.guess_type(photo_path.name)[0] or "application/octet-stream"
    return FileResponse(photo_path, media_type=media_type)
