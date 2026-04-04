from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import CurrentCreator
from app.core.config import settings
from app.dependencies import get_db
from app.repositories.photo_category_repository import PhotoCategoryRepository
from app.repositories.photo_repository import PhotoRepository
from app.schemas.photo import PhotoCreate, PhotoCreateResponse
from app.services.photo_storage import PhotoStorageService


router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]


def parse_photo_create(
    category_slug: Annotated[str, Form()],
    description: Annotated[str, Form()],
    location_text: Annotated[str, Form()],
    taken_year: Annotated[int, Form()],
    taken_month: Annotated[int | None, Form()] = None,
    taken_day: Annotated[int | None, Form()] = None,
) -> PhotoCreate:
    try:
        return PhotoCreate(
            category_slug=category_slug,
            description=description,
            location_text=location_text,
            taken_year=taken_year,
            taken_month=taken_month,
            taken_day=taken_day,
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.errors(),
        ) from exc


@router.post(
    "",
    response_model=PhotoCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_photo(
    payload: Annotated[PhotoCreate, Depends(parse_photo_create)],
    file: Annotated[UploadFile, File()],
    current_user: CurrentCreator,
    db: DbSession,
) -> PhotoCreateResponse:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is required.",
        )

    category = PhotoCategoryRepository(db).get_by_slug(payload.category_slug.strip())
    if category is None:
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
            taken_year=payload.taken_year,
            taken_month=payload.taken_month,
            taken_day=payload.taken_day,
            file_reference=file_reference,
        )
    except SQLAlchemyError as exc:
        db.rollback()
        storage_service.delete_photo(file_reference)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Photo upload failed.",
        ) from exc

    photo.category = category
    return PhotoCreateResponse(photo=photo)
