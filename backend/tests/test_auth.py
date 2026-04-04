from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.photo import Photo
from app.models.photo_category import PhotoCategory
from app.models.user import User, UserRole


def test_register_creator_returns_created_user(client, db_session: Session) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "creator-one",
            "email": "creator@example.com",
            "password": "secret123",
        },
    )

    assert response.status_code == 201
    assert response.json() == {
        "user": {
            "id": 1,
            "username": "creator-one",
            "email": "creator@example.com",
            "role": "creator",
            "is_blocked": False,
        }
    }

    stored_user = db_session.scalar(
        select(User).where(User.email == "creator@example.com"),
    )

    assert stored_user is not None
    assert stored_user.username == "creator-one"
    assert stored_user.role == UserRole.CREATOR
    assert stored_user.password_hash != "secret123"


def test_register_creator_rejects_duplicate_username(client) -> None:
    payload = {
        "username": "creator-one",
        "email": "creator@example.com",
        "password": "secret123",
    }

    first_response = client.post("/api/v1/auth/register", json=payload)
    second_response = client.post(
        "/api/v1/auth/register",
        json={**payload, "email": "other@example.com"},
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json() == {
        "detail": "Email or username is already in use.",
    }


def test_login_returns_access_token(client) -> None:
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "creator-one",
            "email": "creator@example.com",
            "password": "secret123",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "creator@example.com",
            "password": "secret123",
        },
    )

    body = response.json()

    assert response.status_code == 200
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"] == {
        "id": 1,
        "username": "creator-one",
        "email": "creator@example.com",
        "role": "creator",
        "is_blocked": False,
    }


def test_login_rejects_invalid_credentials(client) -> None:
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "creator-one",
            "email": "creator@example.com",
            "password": "secret123",
        },
    )

    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "creator@example.com",
            "password": "wrongpass",
        },
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid credentials."}


def test_read_current_user_requires_authentication(client) -> None:
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated."}


def test_read_current_user_returns_authenticated_user(client) -> None:
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "creator-one",
            "email": "creator@example.com",
            "password": "secret123",
        },
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "creator@example.com",
            "password": "secret123",
        },
    )
    access_token = login_response.json()["access_token"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "user": {
            "id": 1,
            "username": "creator-one",
            "email": "creator@example.com",
            "role": "creator",
            "is_blocked": False,
        }
    }


def test_authenticated_user_can_list_only_their_own_photos(
    client,
    db_session: Session,
) -> None:
    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "creator-one",
            "email": "creator@example.com",
            "password": "secret123",
        },
    )
    user_id = register_response.json()["user"]["id"]

    category = PhotoCategory(slug="ulica", name="Ulica")
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)

    photo = Photo(
        owner_id=user_id,
        category_id=category.id,
        description="Historic market square.",
        location_text="Rynek",
        taken_year=1982,
        taken_month=1,
        taken_day=14,
        file_reference="photos/creator-one/market.jpg",
    )
    db_session.add(photo)
    db_session.commit()
    db_session.refresh(photo)

    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "creator@example.com",
            "password": "secret123",
        },
    )
    access_token = login_response.json()["access_token"]

    response = client.get(
        f"/api/v1/{user_id}/photos",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    assert response.status_code == 200
    photos = response.json()["photos"]
    assert len(photos) == 1
    assert photos[0]["id"] == photo.id
    assert photos[0]["owner_id"] == user_id
