from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.photo_category import PhotoCategory


class PhotoCategoryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_slug(self, slug: str) -> PhotoCategory | None:
        statement = select(PhotoCategory).where(PhotoCategory.slug == slug)
        return self.db.scalar(statement)
