import logging
import mimetypes
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import (
    CurrentActivePhotoManager,
    CurrentPhotoManager,
    CurrentPhotoViewer,
)
from app.core.config import settings
from app.dependencies import get_db
from app.models.photo import Photo
from app.models.user import UserRole
from app.repositories.photo_category_repository import PhotoCategoryRepository
from app.repositories.photo_repository import PhotoRepository
from app.schemas.photo import (
    PhotoCreate,
    PhotoCreateResponse,
    PhotoListResponse,
    PhotoResponse,
    PhotoUpdate,
)
from app.services.photo_storage import PhotoStorageService


router = APIRouter()
owned_photos_router = APIRouter()
logger = logging.getLogger(__name__)

DbSession = Annotated[Session, Depends(get_db)]


def parse_photo_create(
    category_slug: Annotated[str, Form()],
    location_text: Annotated[str, Form()],
    taken_year: Annotated[int, Form()],
    latitude: Annotated[float | None, Form()] = None,
    longitude: Annotated[float | None, Form()] = None,
    description: Annotated[str, Form()] = "",
    taken_month: Annotated[int | None, Form()] = None,
    taken_day: Annotated[int | None, Form()] = None,
) -> PhotoCreate:
    try:
        return PhotoCreate(
            category_slug=category_slug,
            description=description,
            location_text=location_text,
            latitude=latitude,
            longitude=longitude,
            taken_year=taken_year,
            taken_month=taken_month,
            taken_day=taken_day,
        )
    except ValidationError as exc:
        logger.warning(
            "Photo upload form validation failed: category_slug=%r location_text=%r latitude=%r longitude=%r taken_year=%r taken_month=%r taken_day=%r errors=%s",
            category_slug,
            location_text,
            latitude,
            longitude,
            taken_year,
            taken_month,
            taken_day,
            exc.errors(),
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.errors(),
        ) from exc


def get_owned_photo_or_404(
    *,
    db: Session,
    photo_id: int,
    owner_id: int,
) -> Photo:
    photo = PhotoRepository(db).get_by_id_and_owner(
        photo_id=photo_id,
        owner_id=owner_id,
    )
    if photo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found.",
        )

    return photo


def get_visible_photo_or_404(
    *,
    db: Session,
    photo_id: int,
    current_user_id: int,
    current_user_role: UserRole,
) -> Photo:
    repository = PhotoRepository(db)

    if current_user_role == UserRole.ADMINISTRATOR:
        photo = repository.get_by_id(photo_id=photo_id)
    else:
        photo = repository.get_by_id_and_owner(
            photo_id=photo_id,
            owner_id=current_user_id,
        )

    if photo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found.",
        )

    return photo


def get_photo_or_404(
    *,
    db: Session,
    photo_id: int,
) -> Photo:
    photo = PhotoRepository(db).get_by_id(photo_id=photo_id)
    if photo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found.",
        )

    return photo


@router.post(
    "",
    response_model=PhotoCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_photo(
    payload: Annotated[PhotoCreate, Depends(parse_photo_create)],
    file: Annotated[UploadFile, File()],
    current_user: CurrentActivePhotoManager,
    db: DbSession,
) -> PhotoCreateResponse:
    if not file.filename:
        logger.warning(
            "Photo upload rejected because the uploaded file name is missing for owner_id=%s",
            current_user.id,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is required.",
        )

    logger.info(
        "Photo upload requested: owner_id=%s filename=%r category_slug=%r location_text=%r latitude=%r longitude=%r taken_year=%r taken_month=%r taken_day=%r description_length=%s",
        current_user.id,
        file.filename,
        payload.category_slug,
        payload.location_text,
        payload.latitude,
        payload.longitude,
        payload.taken_year,
        payload.taken_month,
        payload.taken_day,
        len(payload.description),
    )

    category = PhotoCategoryRepository(db).get_by_slug(payload.category_slug.strip())
    if category is None:
        logger.warning(
            "Photo upload rejected because category_slug=%r is unknown for owner_id=%s",
            payload.category_slug,
            current_user.id,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unknown photo category.",
        )

    storage_service = PhotoStorageService(settings.photo_storage_dir)
    file_reference = storage_service.save_photo(
        owner_id=current_user.id,
        upload_file=file,
    )

    try:
        photo = PhotoRepository(db).create(
            owner_id=current_user.id,
            category_id=category.id,
            description=payload.description.strip(),
            location_text=payload.location_text.strip(),
            latitude=payload.latitude,
            longitude=payload.longitude,
            taken_year=payload.taken_year,
            taken_month=payload.taken_month,
            taken_day=payload.taken_day,
            file_reference=file_reference,
        )
    except SQLAlchemyError as exc:
        db.rollback()
        storage_service.delete_photo(file_reference)
        logger.exception(
            "Photo upload failed during persistence: owner_id=%s file_reference=%r filename=%r",
            current_user.id,
            file_reference,
            file.filename,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Photo upload failed.",
        ) from exc

    photo.category = category
    logger.info(
        "Photo upload succeeded: owner_id=%s photo_id=%s category_slug=%r file_reference=%r",
        current_user.id,
        photo.id,
        category.slug,
        file_reference,
    )
    return PhotoCreateResponse(photo=photo)


@router.get("", response_model=PhotoListResponse)
def list_shared_photos(db: DbSession) -> PhotoListResponse:
    photos = PhotoRepository(db).list_all()
    return PhotoListResponse(photos=photos)


@owned_photos_router.get("/{user_id}/photos", response_model=PhotoListResponse)
def list_owned_photos(
    user_id: int,
    current_user: CurrentPhotoViewer,
    db: DbSession,
) -> PhotoListResponse:
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own photos.",
        )

    photos = PhotoRepository(db).list_by_owner(owner_id=current_user.id)
    return PhotoListResponse(photos=photos)


@router.patch("/{photo_id}", response_model=PhotoResponse)
def update_creator_photo(
    photo_id: int,
    payload: PhotoUpdate,
    current_user: CurrentActivePhotoManager,
    db: DbSession,
) -> PhotoResponse:
    photo = get_owned_photo_or_404(
        db=db,
        photo_id=photo_id,
        owner_id=current_user.id,
    )

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
        latitude=payload.latitude,
        longitude=payload.longitude,
        taken_year=payload.taken_year,
        taken_month=payload.taken_month,
        taken_day=payload.taken_day,
    )
    updated_photo.category = category
    return PhotoResponse(photo=updated_photo)


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_creator_photo(
    photo_id: int,
    current_user: CurrentPhotoManager,
    db: DbSession,
) -> None:
    photo = get_owned_photo_or_404(
        db=db,
        photo_id=photo_id,
        owner_id=current_user.id,
    )
    file_reference = photo.file_reference

    PhotoRepository(db).delete(photo)

    if file_reference:
        PhotoStorageService(settings.photo_storage_dir).delete_photo(file_reference)


@router.get("/{photo_id}", response_model=PhotoResponse)
def get_shared_photo(
    photo_id: int,
    db: DbSession,
) -> PhotoResponse:
    photo = get_photo_or_404(
        db=db,
        photo_id=photo_id,
    )
    return PhotoResponse(photo=photo)


@router.get("/{photo_id}/image")
def get_shared_photo_image(
    photo_id: int,
    db: DbSession,
) -> FileResponse:
    photo = get_photo_or_404(
        db=db,
        photo_id=photo_id,
    )

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
