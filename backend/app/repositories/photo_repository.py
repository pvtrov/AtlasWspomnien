from sqlalchemy.orm import Session

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
