from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.photo import Photo


class PhotoRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        owner_id: int,
        category_id: int,
        description: str,
        location_text: str,
        taken_year: int,
        taken_month: int | None,
        taken_day: int | None,
        file_reference: str,
    ) -> Photo:
        photo = Photo(
            owner_id=owner_id,
            category_id=category_id,
            description=description,
            location_text=location_text,
            taken_year=taken_year,
            taken_month=taken_month,
            taken_day=taken_day,
            file_reference=file_reference,
        )
        self.db.add(photo)
        self.db.commit()
        self.db.refresh(photo)
        return photo

    def list_by_owner(self, *, owner_id: int) -> list[Photo]:
        statement = (
            select(Photo)
            .options(joinedload(Photo.category))
            .where(Photo.owner_id == owner_id)
            .order_by(Photo.created_at.desc(), Photo.id.desc())
        )
        return list(self.db.scalars(statement).unique())

    def get_by_id_and_owner(self, *, photo_id: int, owner_id: int) -> Photo | None:
        statement = (
            select(Photo)
            .options(joinedload(Photo.category))
            .where(
                Photo.id == photo_id,
                Photo.owner_id == owner_id,
            )
        )
        return self.db.scalar(statement)

    def update_metadata(
        self,
        photo: Photo,
        *,
        category_id: int,
        description: str,
        location_text: str,
        taken_year: int,
        taken_month: int | None,
        taken_day: int | None,
    ) -> Photo:
        photo.category_id = category_id
        photo.description = description
        photo.location_text = location_text
        photo.taken_year = taken_year
        photo.taken_month = taken_month
        photo.taken_day = taken_day

        self.db.add(photo)
        self.db.commit()
        self.db.refresh(photo)
        return photo

    def delete(self, photo: Photo) -> None:
        self.db.delete(photo)
        self.db.commit()
