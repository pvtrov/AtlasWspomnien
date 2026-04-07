from datetime import datetime
import unicodedata

from sqlalchemy import case, func, literal, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.photo import Photo
from app.models.photo_category import PhotoCategory
from app.models.user import User
from app.schemas.photo import PhotoListFilters, parse_partial_date_bound

POLISH_ASCII_TRANSLATION = str.maketrans(
    {
        "ą": "a",
        "ć": "c",
        "ę": "e",
        "ł": "l",
        "ń": "n",
        "ó": "o",
        "ś": "s",
        "ź": "z",
        "ż": "z",
    }
)


class PhotoRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(
        self,
        *,
        owner_id: int,
        category_id: int,
        description: str,
        display_name: str | None,
        location_text: str,
        latitude: float | None,
        longitude: float | None,
        taken_year: int,
        taken_month: int | None,
        taken_day: int | None,
        file_reference: str,
    ) -> Photo:
        photo = Photo(
            owner_id=owner_id,
            category_id=category_id,
            description=description,
            display_name=display_name,
            location_text=location_text,
            latitude=latitude,
            longitude=longitude,
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

    def list_all(self) -> list[Photo]:
        statement = (
            select(Photo)
            .options(joinedload(Photo.category))
            .order_by(Photo.created_at.desc(), Photo.id.desc())
        )
        return list(self.db.scalars(statement).unique())

    def list_recent_for_administrator(
        self,
        *,
        previous_successful_login_at: datetime,
        last_successful_login_at: datetime,
    ) -> list[Photo]:
        effective_activity_at = func.coalesce(Photo.updated_at, Photo.created_at)
        statement = (
            select(Photo)
            .join(Photo.owner)
            .options(joinedload(Photo.category), joinedload(Photo.owner))
            .where(
                effective_activity_at > previous_successful_login_at,
                effective_activity_at <= last_successful_login_at,
            )
            .order_by(effective_activity_at.desc(), Photo.id.desc())
        )
        return list(self.db.scalars(statement).unique())

    def list_shared(self, *, filters: PhotoListFilters) -> list[Photo]:
        statement = select(Photo).options(joinedload(Photo.category)).join(Photo.category)

        if filters.query is not None:
            pattern = self._normalized_pattern(filters.query)
            statement = statement.where(
                or_(
                    self._normalized_text(Photo.description).like(pattern),
                    self._normalized_text(func.coalesce(Photo.display_name, literal(""))).like(pattern),
                    self._normalized_text(Photo.location_text).like(pattern),
                    self._normalized_text(PhotoCategory.slug).like(pattern),
                    self._normalized_text(PhotoCategory.name).like(pattern),
                )
            )

        if filters.category is not None:
            statement = statement.where(PhotoCategory.slug == filters.category)

        if filters.location is not None:
            for token in self._search_tokens(filters.location):
                statement = statement.where(
                    self._normalized_text(Photo.location_text).like(
                        self._normalized_pattern(token)
                    )
                )

        if filters.taken_year is not None:
            statement = statement.where(Photo.taken_year == filters.taken_year)

        if filters.taken_month is not None:
            statement = statement.where(Photo.taken_month == filters.taken_month)

        lower_bound = parse_partial_date_bound(filters.date_from, is_upper=False)
        upper_bound = parse_partial_date_bound(filters.date_to, is_upper=True)

        photo_lower_bound = self._photo_lower_bound()
        photo_upper_bound = self._photo_upper_bound()

        if lower_bound is not None:
            statement = statement.where(photo_lower_bound >= self._date_key(*lower_bound))

        if upper_bound is not None:
            statement = statement.where(photo_upper_bound <= self._date_key(*upper_bound))

        statement = statement.order_by(Photo.created_at.desc(), Photo.id.desc())
        return list(self.db.scalars(statement).unique())

    def get_by_id(self, *, photo_id: int) -> Photo | None:
        statement = (
            select(Photo)
            .options(joinedload(Photo.category))
            .where(Photo.id == photo_id)
        )
        return self.db.scalar(statement)

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
        display_name: str | None,
        location_text: str,
        latitude: float | None,
        longitude: float | None,
        taken_year: int,
        taken_month: int | None,
        taken_day: int | None,
    ) -> Photo:
        photo.category_id = category_id
        photo.description = description
        photo.display_name = display_name
        photo.location_text = location_text
        photo.latitude = latitude
        photo.longitude = longitude
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

    def _photo_lower_bound(self):
        return self._date_key_expression(
            year=Photo.taken_year,
            month=func.coalesce(Photo.taken_month, literal(1)),
            day=func.coalesce(Photo.taken_day, literal(1)),
        )

    def _photo_upper_bound(self):
        month = func.coalesce(Photo.taken_month, literal(12))
        day = case(
            (Photo.taken_day.is_not(None), Photo.taken_day),
            (Photo.taken_month.is_(None), literal(31)),
            (month.in_([1, 3, 5, 7, 8, 10, 12]), literal(31)),
            (month.in_([4, 6, 9, 11]), literal(30)),
            (
                func.mod(Photo.taken_year, 400) == 0,
                literal(29),
            ),
            (
                func.mod(Photo.taken_year, 100) == 0,
                literal(28),
            ),
            (
                func.mod(Photo.taken_year, 4) == 0,
                literal(29),
            ),
            else_=literal(28),
        )
        return self._date_key_expression(
            year=Photo.taken_year,
            month=month,
            day=day,
        )

    def _date_key(self, year: int, month: int, day: int) -> int:
        return (year * 10000) + (month * 100) + day

    def _date_key_expression(self, *, year, month, day):
        return (year * 10000) + (month * 100) + day

    def _normalized_pattern(self, value: str) -> str:
        return f"%{self._normalize_search_value(value)}%"

    def _normalized_text(self, value):
        return func.unaccent(func.lower(value))

    def _search_tokens(self, value: str) -> list[str]:
        return [token for token in self._normalize_search_value(value).split() if token]

    def _normalize_search_value(self, value: str) -> str:
        normalized = unicodedata.normalize("NFKD", value.lower().translate(POLISH_ASCII_TRANSLATION))
        return "".join(character for character in normalized if not unicodedata.combining(character))
