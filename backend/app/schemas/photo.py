import calendar
from datetime import datetime
import re

from pydantic import BaseModel, ConfigDict, Field, model_validator


class PhotoCategoryRead(BaseModel):
    id: int
    slug: str
    name: str
    parent_id: int | None

    model_config = ConfigDict(from_attributes=True)


class PhotoCreate(BaseModel):
    category_slug: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)
    display_name: str | None = Field(default=None, max_length=255)
    location_text: str = Field(min_length=1, max_length=255)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    taken_year: int = Field(ge=1, le=9999)
    taken_month: int | None = Field(default=None, ge=1, le=12)
    taken_day: int | None = Field(default=None, ge=1, le=31)
    file_reference: str | None = Field(default=None, min_length=1, max_length=500)

    @model_validator(mode="after")
    def validate_partial_date(self) -> "PhotoCreate":
        if self.taken_day is not None and self.taken_month is None:
            raise ValueError("taken_day requires taken_month.")
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("latitude and longitude must both be provided together.")

        return self


class PhotoRead(BaseModel):
    id: int
    owner_id: int
    owner_username: str
    category_id: int
    description: str
    display_name: str | None
    location_text: str
    latitude: float | None
    longitude: float | None
    taken_year: int
    taken_month: int | None
    taken_day: int | None
    category: PhotoCategoryRead
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PhotoCreateResponse(BaseModel):
    photo: PhotoRead


class PhotoUpdate(BaseModel):
    category_slug: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)
    display_name: str | None = Field(default=None, max_length=255)
    location_text: str = Field(min_length=1, max_length=255)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    taken_year: int = Field(ge=1, le=9999)
    taken_month: int | None = Field(default=None, ge=1, le=12)
    taken_day: int | None = Field(default=None, ge=1, le=31)

    @model_validator(mode="after")
    def validate_partial_date(self) -> "PhotoUpdate":
        if self.taken_day is not None and self.taken_month is None:
            raise ValueError("taken_day requires taken_month.")
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("latitude and longitude must both be provided together.")

        return self


class PhotoResponse(BaseModel):
    photo: PhotoRead


class PhotoListResponse(BaseModel):
    photos: list[PhotoRead]


class AdminRecentPhotoRead(BaseModel):
    id: int
    owner_id: int
    owner_username: str
    category_id: int
    description: str
    display_name: str | None
    location_text: str
    latitude: float | None
    longitude: float | None
    taken_year: int
    taken_month: int | None
    taken_day: int | None
    category: PhotoCategoryRead
    created_at: datetime
    updated_at: datetime
    effective_activity_at: datetime


class AdminRecentPhotoListResponse(BaseModel):
    has_previous_successful_login: bool
    previous_successful_login_at: datetime | None
    last_successful_login_at: datetime | None
    photos: list[AdminRecentPhotoRead]


PARTIAL_DATE_PATTERN = re.compile(r"^(?P<year>\d{4})(?:-(?P<month>\d{2})(?:-(?P<day>\d{2}))?)?$")


class PhotoListFilters(BaseModel):
    query: str | None = Field(default=None, max_length=255)
    category: str | None = Field(default=None, max_length=100)
    location: str | None = Field(default=None, max_length=255)
    taken_year: int | None = Field(default=None, ge=1, le=9999)
    taken_month: int | None = Field(default=None, ge=1, le=12)
    date_from: str | None = Field(default=None, max_length=10)
    date_to: str | None = Field(default=None, max_length=10)

    @model_validator(mode="after")
    def validate_filters(self) -> "PhotoListFilters":
        self.query = normalize_optional_text(self.query)
        self.category = normalize_optional_text(self.category)
        self.location = normalize_optional_text(self.location)
        self.date_from = normalize_optional_text(self.date_from)
        self.date_to = normalize_optional_text(self.date_to)

        if self.taken_month is not None and self.taken_year is None:
            raise ValueError("taken_month requires taken_year.")

        lower_bound = parse_partial_date_bound(self.date_from, is_upper=False)
        upper_bound = parse_partial_date_bound(self.date_to, is_upper=True)

        if lower_bound is not None and upper_bound is not None and lower_bound > upper_bound:
            raise ValueError("date_from must be earlier than or equal to date_to.")

        return self


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = value.strip()
    return normalized or None


def parse_partial_date_bound(value: str | None, *, is_upper: bool) -> tuple[int, int, int] | None:
    if value is None:
        return None

    match = PARTIAL_DATE_PATTERN.fullmatch(value)
    if match is None:
        raise ValueError("Date filters must use YYYY, YYYY-MM, or YYYY-MM-DD format.")

    year = int(match.group("year"))
    month_group = match.group("month")
    day_group = match.group("day")

    if month_group is None:
        return (year, 12, 31) if is_upper else (year, 1, 1)

    month = int(month_group)
    if day_group is None:
        day = calendar.monthrange(year, month)[1] if is_upper else 1
        return (year, month, day)

    day = int(day_group)
    try:
        calendar.weekday(year, month, day)
    except ValueError as exc:
        raise ValueError("Date filters must use valid calendar dates.") from exc

    return (year, month, day)
