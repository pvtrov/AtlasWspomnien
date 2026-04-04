from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.models.photo import Photo
from app.models.photo_category import PhotoCategory
from app.schemas.photo import PhotoCreate, PhotoRead, PhotoUpdate


def test_photo_create_accepts_full_metadata() -> None:
    payload = PhotoCreate(
        category_slug="ulica",
        description="Historic bridge during winter.",
        location_text="River Crossing",
        taken_year=1972,
        taken_month=1,
        taken_day=8,
        file_reference="photos/bridge-1972.jpg",
    )

    assert payload.category_slug == "ulica"
    assert payload.description == "Historic bridge during winter."
    assert payload.location_text == "River Crossing"
    assert payload.taken_year == 1972
    assert payload.taken_month == 1
    assert payload.taken_day == 8
    assert payload.file_reference == "photos/bridge-1972.jpg"


def test_photo_create_accepts_year_only_date() -> None:
    payload = PhotoCreate(
        category_slug="park",
        description="Panorama of the district.",
        location_text="North District",
        taken_year=1950,
    )

    assert payload.taken_year == 1950
    assert payload.taken_month is None
    assert payload.taken_day is None
    assert payload.file_reference is None


def test_photo_create_allows_empty_description() -> None:
    payload = PhotoCreate(
        category_slug="park",
        description="",
        location_text="North District",
        taken_year=1950,
    )

    assert payload.description == ""


def test_photo_update_allows_empty_description() -> None:
    payload = PhotoUpdate(
        category_slug="budynek",
        description="",
        location_text="Central Parish",
        taken_year=1961,
    )

    assert payload.description == ""


def test_photo_create_rejects_day_without_month() -> None:
    with pytest.raises(ValidationError) as exc_info:
        PhotoCreate(
            category_slug="budynek",
            description="Church tower close-up.",
            location_text="Central Parish",
            taken_year=1961,
            taken_day=4,
        )

    assert "taken_day requires taken_month" in str(exc_info.value)


def test_photo_create_requires_category_slug() -> None:
    with pytest.raises(ValidationError) as exc_info:
        PhotoCreate(
            description="Old station platform.",
            location_text="Railway District",
            taken_year=1938,
        )

    assert "category_slug" in str(exc_info.value)


def test_photo_read_serializes_from_model() -> None:
    category = PhotoCategory(
        id=2,
        slug="budynek",
        name="Budynek",
        parent_id=None,
    )
    photo = Photo(
        id=7,
        owner_id=3,
        category_id=2,
        description="Main avenue after renovation.",
        location_text="Main Avenue",
        taken_year=1991,
        taken_month=9,
        taken_day=None,
        file_reference="photos/main-avenue-1991.jpg",
        category=category,
        created_at=datetime(2026, 4, 4, 10, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 4, 4, 11, 30, tzinfo=timezone.utc),
    )

    payload = PhotoRead.model_validate(photo)

    assert payload.model_dump() == {
        "id": 7,
        "owner_id": 3,
        "category_id": 2,
        "description": "Main avenue after renovation.",
        "location_text": "Main Avenue",
        "taken_year": 1991,
        "taken_month": 9,
        "taken_day": None,
        "file_reference": "photos/main-avenue-1991.jpg",
        "category": {
            "id": 2,
            "slug": "budynek",
            "name": "Budynek",
            "parent_id": None,
        },
        "created_at": datetime(2026, 4, 4, 10, 0, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 4, 4, 11, 30, tzinfo=timezone.utc),
    }
