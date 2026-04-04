from pathlib import Path

from sqlalchemy import select
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
    is_blocked: bool = False,
    password: str = "secret123",
) -> User:
    user = User(
        email=email,
        username=username,
        password_hash=hash_password(password),
        role=role,
        is_blocked=is_blocked,
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
    file_reference: str | None = None,
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


def login_headers(
    client,
    *,
    email: str,
    password: str = "secret123",
) -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_blocked_creator_can_log_in_and_read_current_user(
    client,
    db_session: Session,
) -> None:
    create_user(
        db_session,
        email="blocked@example.com",
        username="blocked-creator",
        role=UserRole.CREATOR,
        is_blocked=True,
    )

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "blocked@example.com", "password": "secret123"},
    )

    assert login_response.status_code == 200
    assert login_response.json()["user"]["is_blocked"] is True

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {login_response.json()['access_token']}"},
    )

    assert response.status_code == 200
    assert response.json()["user"]["is_blocked"] is True


def test_blocked_creator_cannot_upload_photo(
    client,
    db_session: Session,
    monkeypatch,
    tmp_path: Path,
) -> None:
    monkeypatch.setattr(settings, "photo_storage_dir", tmp_path)
    create_category(db_session)
    create_user(
        db_session,
        email="blocked@example.com",
        username="blocked-creator",
        role=UserRole.CREATOR,
        is_blocked=True,
    )
    headers = login_headers(client, email="blocked@example.com")

    response = client.post(
        "/api/v1/photos",
        headers=headers,
        files={"file": ("photo.jpg", b"fake-image", "image/jpeg")},
        data={
            "category_slug": "ulica",
            "description": "Blocked upload",
            "location_text": "Rynek",
            "taken_year": "1982",
            "taken_month": "1",
            "taken_day": "14",
        },
    )

    assert response.status_code == 403
    assert response.json() == {
        "detail": "Blocked creators cannot upload or edit photos.",
    }


def test_blocked_creator_cannot_edit_photo(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="blocked@example.com",
        username="blocked-creator",
        role=UserRole.CREATOR,
        is_blocked=True,
    )
    photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
    )
    headers = login_headers(client, email="blocked@example.com")

    response = client.patch(
        f"/api/v1/photos/{photo.id}",
        headers=headers,
        json={
            "category_slug": "ulica",
            "description": "Updated text",
            "location_text": "Rynek",
            "taken_year": 1982,
            "taken_month": 1,
            "taken_day": 14,
        },
    )

    assert response.status_code == 403
    assert response.json() == {
        "detail": "Blocked creators cannot upload or edit photos.",
    }


def test_blocked_creator_can_delete_owned_photo(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    creator = create_user(
        db_session,
        email="blocked@example.com",
        username="blocked-creator",
        role=UserRole.CREATOR,
        is_blocked=True,
    )
    photo = create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
    )
    headers = login_headers(client, email="blocked@example.com")

    response = client.delete(f"/api/v1/photos/{photo.id}", headers=headers)

    assert response.status_code == 204
    assert db_session.scalar(select(Photo).where(Photo.id == photo.id)) is None


def test_admin_can_list_users(client, db_session: Session) -> None:
    create_user(
        db_session,
        email="admin@example.com",
        username="admin",
        role=UserRole.ADMINISTRATOR,
    )
    create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    headers = login_headers(client, email="admin@example.com")

    response = client.get("/api/v1/admin/users", headers=headers)

    assert response.status_code == 200
    users = response.json()["users"]
    assert len(users) == 2
    assert {user["role"] for user in users} == {"administrator", "creator"}


def test_admin_can_block_creator(client, db_session: Session) -> None:
    create_user(
        db_session,
        email="admin@example.com",
        username="admin",
        role=UserRole.ADMINISTRATOR,
    )
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    headers = login_headers(client, email="admin@example.com")

    response = client.patch(f"/api/v1/admin/users/{creator.id}/block", headers=headers)

    assert response.status_code == 200
    assert response.json()["user"]["is_blocked"] is True
    refreshed_user = db_session.get(User, creator.id)
    assert refreshed_user is not None
    assert refreshed_user.is_blocked is True


def test_admin_cannot_block_own_account(client, db_session: Session) -> None:
    admin = create_user(
        db_session,
        email="admin@example.com",
        username="admin",
        role=UserRole.ADMINISTRATOR,
    )
    headers = login_headers(client, email="admin@example.com")

    response = client.patch(f"/api/v1/admin/users/{admin.id}/block", headers=headers)

    assert response.status_code == 400
    assert response.json() == {
        "detail": "You cannot block your own account.",
    }


def test_admin_can_promote_creator(client, db_session: Session) -> None:
    create_user(
        db_session,
        email="admin@example.com",
        username="admin",
        role=UserRole.ADMINISTRATOR,
    )
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    headers = login_headers(client, email="admin@example.com")

    response = client.patch(
        f"/api/v1/admin/users/{creator.id}/promote",
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["user"]["role"] == "administrator"
    refreshed_user = db_session.get(User, creator.id)
    assert refreshed_user is not None
    assert refreshed_user.role == UserRole.ADMINISTRATOR


def test_non_admin_cannot_access_admin_user_listing(client, db_session: Session) -> None:
    create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    headers = login_headers(client, email="creator@example.com")

    response = client.get("/api/v1/admin/users", headers=headers)

    assert response.status_code == 403
    assert response.json() == {
        "detail": "Only administrators can access moderation routes.",
    }


def test_admin_can_list_only_own_photos_via_owned_route(client, db_session: Session) -> None:
    category = create_category(db_session)
    admin = create_user(
        db_session,
        email="admin@example.com",
        username="admin",
        role=UserRole.ADMINISTRATOR,
    )
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
    )
    headers = login_headers(client, email="admin@example.com")

    response = client.get(f"/api/v1/{admin.id}/photos", headers=headers)

    assert response.status_code == 200
    assert response.json()["photos"] == []


def test_admin_cannot_list_another_users_owned_photos(client, db_session: Session) -> None:
    category = create_category(db_session)
    admin = create_user(
        db_session,
        email="admin@example.com",
        username="admin",
        role=UserRole.ADMINISTRATOR,
    )
    creator = create_user(
        db_session,
        email="creator@example.com",
        username="creator-one",
        role=UserRole.CREATOR,
    )
    create_photo(
        db_session,
        owner_id=creator.id,
        category_id=category.id,
    )
    headers = login_headers(client, email="admin@example.com")

    response = client.get(f"/api/v1/{creator.id}/photos", headers=headers)

    assert response.status_code == 403
    assert response.json() == {
        "detail": "You can only access your own photos.",
    }


def test_admin_can_read_edit_and_delete_other_creator_photo(
    client,
    db_session: Session,
) -> None:
    category = create_category(db_session)
    other_category = create_category(db_session, slug="budynek")
    create_user(
        db_session,
        email="admin@example.com",
        username="admin",
        role=UserRole.ADMINISTRATOR,
    )
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
    )
    headers = login_headers(client, email="admin@example.com")

    get_response = client.get(f"/api/v1/photos/{photo.id}", headers=headers)

    assert get_response.status_code == 200
    assert get_response.json()["photo"]["owner_id"] == creator.id

    patch_response = client.patch(
        f"/api/v1/admin/photos/{photo.id}",
        headers=headers,
        json={
            "category_slug": "budynek",
            "description": "Corrected by admin",
            "location_text": "Nowy Rynek",
            "taken_year": 1983,
            "taken_month": 2,
            "taken_day": 15,
        },
    )

    assert patch_response.status_code == 200
    patched_photo = patch_response.json()["photo"]
    assert patched_photo["category"]["slug"] == other_category.slug
    assert patched_photo["description"] == "Corrected by admin"
    assert patched_photo["location_text"] == "Nowy Rynek"

    delete_response = client.delete(f"/api/v1/admin/photos/{photo.id}", headers=headers)

    assert delete_response.status_code == 204
    assert db_session.scalar(select(Photo).where(Photo.id == photo.id)) is None


def test_admin_can_upload_own_photo(client, db_session: Session, monkeypatch, tmp_path: Path) -> None:
    monkeypatch.setattr(settings, "photo_storage_dir", tmp_path)
    create_category(db_session)
    create_user(
        db_session,
        email="admin@example.com",
        username="admin",
        role=UserRole.ADMINISTRATOR,
    )
    headers = login_headers(client, email="admin@example.com")

    response = client.post(
        "/api/v1/photos",
        headers=headers,
        files={"file": ("photo.jpg", b"fake-image", "image/jpeg")},
        data={
          "category_slug": "ulica",
          "description": "Admin upload",
          "location_text": "Rynek",
          "taken_year": "1982",
          "taken_month": "1",
          "taken_day": "14",
        },
    )

    assert response.status_code == 201
    assert response.json()["photo"]["owner_id"] == 1
