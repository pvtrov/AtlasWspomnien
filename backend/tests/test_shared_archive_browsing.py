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
    file_reference: str | None = "photos/example.jpg",
) -> Photo:
    photo = Photo(
        owner_id=owner_id,
        category_id=category_id,
        description="Historic market square.",
        location_text="Rynek",
        taken_year=1982,
        taken_month=1,
        taken_day=14,
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
