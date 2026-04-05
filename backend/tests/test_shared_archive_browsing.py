from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.photo import Photo
from app.models.photo_category import PhotoCategory
from app.models.user import User, UserRole
from app.security.passwords import hash_password


def create_user(
    db_session: Session,
    *,
    email: str,
    username: str,
    role: UserRole,
    password: str = "secret123",
) -> User:
    user = User(
        email=email,
        username=username,
        password_hash=hash_password(password),
        role=role,
        is_blocked=False,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def create_category(db_session: Session, *, slug: str = "ulica") -> PhotoCategory:
    category = PhotoCategory(slug=slug, name=slug.capitalize())
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category


def create_photo(
    db_session: Session,
    *,
    owner_id: int,
    category_id: int,
    description: str = "Historic market square.",
    display_name: str | None = None,
    location_text: str = "Rynek",
    taken_year: int = 1982,
    taken_month: int | None = 1,
    taken_day: int | None = 14,
    file_reference: str | None = "photos/example.jpg",
) -> Photo:
    photo = Photo(
        owner_id=owner_id,
        category_id=category_id,
        description=description,
        display_name=display_name,
        location_text=location_text,
        taken_year=taken_year,
        taken_month=taken_month,
        taken_day=taken_day,
        file_reference=file_reference,
    )
    db_session.add(photo)
    db_session.commit()
    db_session.refresh(photo)
    return photo


def test_shared_photo_list_is_public_and_hides_file_reference(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        file_reference="photos/creator-one/market.jpg",
    )

    response = client.get("/api/v1/photos")

    assert response.status_code == 200
    photos = response.json()["photos"]
    assert len(photos) == 1
    assert photos[0]["id"] == photo.id
    assert photos[0]["owner_id"] == creator.id
    assert photos[0]["display_name"] is None
    assert "file_reference" not in photos[0]


def test_shared_photo_detail_is_public_and_hides_file_reference(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        file_reference="photos/creator-one/market.jpg",
    )

    response = client.get(f"/api/v1/photos/{photo.id}")

    assert response.status_code == 200
    payload = response.json()["photo"]
    assert payload["id"] == photo.id
    assert payload["owner_id"] == creator.id
    assert payload["category"]["slug"] == category.slug
    assert payload["display_name"] is None
    assert "file_reference" not in payload


def test_shared_photo_detail_returns_not_found_for_missing_photo(client) -> None:
    response = client.get("/api/v1/photos/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Photo not found."}


def test_shared_photo_image_is_public(
    client,
    db_session: Session,
    monkeypatch,
    tmp_path: Path,
) -> None:
    monkeypatch.setattr(settings, "photo_storage_dir", tmp_path)
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )

    owner_dir = tmp_path / str(creator.id)
    owner_dir.mkdir(parents=True, exist_ok=True)
    image_path = owner_dir / "market.jpg"
    image_bytes = b"fake-image"
    image_path.write_bytes(image_bytes)

    photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        file_reference=f"photos/{creator.id}/market.jpg",
    )

    response = client.get(f"/api/v1/photos/{photo.id}/image")

    assert response.status_code == 200
    assert response.content == image_bytes


def test_shared_photo_image_returns_not_found_without_file_reference(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        file_reference=None,
    )

    response = client.get(f"/api/v1/photos/{photo.id}/image")

    assert response.status_code == 404
    assert response.json() == {"detail": "Photo file not found."}


def test_shared_photo_image_returns_not_found_when_file_is_missing(
    client,
    db_session: Session,
    monkeypatch,
    tmp_path: Path,
) -> None:
    monkeypatch.setattr(settings, "photo_storage_dir", tmp_path)
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        file_reference=f"{creator.id}/missing.jpg",
    )

    response = client.get(f"/api/v1/photos/{photo.id}/image")

    assert response.status_code == 404
    assert response.json() == {"detail": "Photo file not found."}


def test_shared_photo_list_location_filter_is_accent_insensitive(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    matching_photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        location_text="Kraków",
    )
    create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        location_text="Warszawa",
        file_reference="photos/example-2.jpg",
    )

    response = client.get("/api/v1/photos?location=Krakow")

    assert response.status_code == 200
    photos = response.json()["photos"]
    assert len(photos) == 1
    assert photos[0]["id"] == matching_photo.id
    assert photos[0]["location_text"] == "Kraków"


def test_shared_photo_list_location_filter_matches_plain_text_record_with_diacritics_query(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    matching_photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        location_text="krakow",
    )
    create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        location_text="warszawa",
        file_reference="photos/example-6.jpg",
    )

    response = client.get("/api/v1/photos?location=kraków")

    assert response.status_code == 200
    photos = response.json()["photos"]
    assert len(photos) == 1
    assert photos[0]["id"] == matching_photo.id
    assert photos[0]["location_text"] == "krakow"


def test_shared_photo_list_query_is_accent_insensitive(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    matching_photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        description="Spacer po Łagiewnikach.",
        location_text="Kraków",
    )
    create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        description="Widok na park miejski.",
        location_text="Warszawa",
        file_reference="photos/example-3.jpg",
    )

    response = client.get("/api/v1/photos?query=Lagiewniki")

    assert response.status_code == 200
    photos = response.json()["photos"]
    assert len(photos) == 1
    assert photos[0]["id"] == matching_photo.id
    assert photos[0]["description"] == "Spacer po Łagiewnikach."


def test_shared_photo_list_query_matches_plain_text_record_with_diacritics_query(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    matching_photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        description="Stary kosciolek przy rynku.",
        location_text="krakow",
    )
    create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        description="Nowoczesna biblioteka miejska.",
        location_text="warszawa",
        file_reference="photos/example-7.jpg",
    )

    response = client.get("/api/v1/photos?query=kościołek")

    assert response.status_code == 200
    photos = response.json()["photos"]
    assert len(photos) == 1
    assert photos[0]["id"] == matching_photo.id
    assert photos[0]["description"] == "Stary kosciolek przy rynku."


def test_shared_photo_list_query_matches_plain_text_record_with_polish_l_character(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    matching_photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        description="Mały kosciolek na wzgórzu.",
        location_text="krakow",
    )
    create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        description="Duzy ratusz przy rynku.",
        location_text="warszawa",
        file_reference="photos/example-8.jpg",
    )

    response = client.get("/api/v1/photos?query=kościółek")

    assert response.status_code == 200
    photos = response.json()["photos"]
    assert len(photos) == 1
    assert photos[0]["id"] == matching_photo.id
    assert photos[0]["description"] == "Mały kosciolek na wzgórzu."


def test_shared_photo_list_query_matches_display_name(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    matching_photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        display_name="Brama Floriańska nocą",
        description="Historic gate in evening light.",
        location_text="Kraków",
    )
    create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        display_name="Planty o świcie",
        description="Morning light in the park.",
        location_text="Kraków",
        file_reference="photos/example-5.jpg",
    )

    response = client.get("/api/v1/photos?query=florianska")

    assert response.status_code == 200
    photos = response.json()["photos"]
    assert len(photos) == 1
    assert photos[0]["id"] == matching_photo.id
    assert photos[0]["display_name"] == "Brama Floriańska nocą"


def test_shared_photo_list_location_filter_matches_all_entered_words(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    matching_photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        location_text="Skarbińskiego 10, Kraków",
    )
    create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
        location_text="Skarbińskiego 12, Warszawa",
        file_reference="photos/example-4.jpg",
    )

    response = client.get("/api/v1/photos?location=skarbinskiego%20krakow")

    assert response.status_code == 200
    photos = response.json()["photos"]
    assert len(photos) == 1
    assert photos[0]["id"] == matching_photo.id
    assert photos[0]["location_text"] == "Skarbińskiego 10, Kraków"
