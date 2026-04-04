from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.photo import Photo
from app.models.photo_category import PhotoCategory
from app.models.user import User, UserRole


def test_photo_persists_with_owner_and_file_reference(db_session: Session) -> None:
    category = PhotoCategory(slug="ulica", name="Ulica")
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)

    user = User(
        email="creator@example.com",
        username="creator-one",
        password_hash="hashed-password",
        role=UserRole.CREATOR,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    photo = Photo(
        owner_id=user.id,
        category_id=category.id,
        description="Historic town square during the spring market.",
        location_text="Town Square",
        taken_year=1984,
        taken_month=5,
        taken_day=12,
        file_reference="photos/creator-one/town-square-1984.jpg",
    )
    db_session.add(photo)
    db_session.commit()
    db_session.refresh(photo)

    stored_photo = db_session.scalar(select(Photo).where(Photo.id == photo.id))

    assert stored_photo is not None
    assert stored_photo.owner_id == user.id
    assert stored_photo.category_id == category.id
    assert stored_photo.file_reference == "photos/creator-one/town-square-1984.jpg"
    assert stored_photo.owner.id == user.id
    assert stored_photo.category.slug == "ulica"
    assert user.photos[0].id == photo.id


def test_photo_allows_partial_historical_date(db_session: Session) -> None:
    category = PhotoCategory(slug="budynek", name="Budynek")
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)

    user = User(
        email="creator@example.com",
        username="creator-one",
        password_hash="hashed-password",
        role=UserRole.CREATOR,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    photo = Photo(
        owner_id=user.id,
        category_id=category.id,
        description="Street view from the early reconstruction period.",
        location_text="Old Town",
        taken_year=1946,
        taken_month=None,
        taken_day=None,
        file_reference=None,
    )
    db_session.add(photo)
    db_session.commit()
    db_session.refresh(photo)

    assert photo.taken_year == 1946
    assert photo.taken_month is None
    assert photo.taken_day is None
    assert photo.category_id == category.id
