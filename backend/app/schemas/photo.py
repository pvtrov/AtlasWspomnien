from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class PhotoCategoryRead(BaseModel):
    id: int
    slug: str
    name: str
    parent_id: int | None

    model_config = ConfigDict(from_attributes=True)


class PhotoCreate(BaseModel):
    category_slug: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=2000)
    location_text: str = Field(min_length=1, max_length=255)
    taken_year: int = Field(ge=1, le=9999)
    taken_month: int | None = Field(default=None, ge=1, le=12)
    taken_day: int | None = Field(default=None, ge=1, le=31)
    file_reference: str | None = Field(default=None, min_length=1, max_length=500)

    @model_validator(mode="after")
    def validate_partial_date(self) -> "PhotoCreate":
        if self.taken_day is not None and self.taken_month is None:
            raise ValueError("taken_day requires taken_month.")

        return self


class PhotoRead(BaseModel):
    id: int
    owner_id: int
    category_id: int
    description: str
    location_text: str
    taken_year: int
    taken_month: int | None
    taken_day: int | None
    file_reference: str | None
    category: PhotoCategoryRead
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PhotoCreateResponse(BaseModel):
    photo: PhotoRead
