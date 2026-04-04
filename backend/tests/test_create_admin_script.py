from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.models.user import User, UserRole
from scripts.create_admin import create_or_promote_admin


def make_session_local():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
        class_=Session,
    )
    Base.metadata.create_all(bind=engine)
    return engine, testing_session_local


def test_create_admin_script_creates_new_administrator(monkeypatch) -> None:
    engine, testing_session_local = make_session_local()
    monkeypatch.setattr("scripts.create_admin.SessionLocal", testing_session_local)

    try:
        user, message = create_or_promote_admin(
            email="admin@example.com",
            username="admin",
            password="secret123",
            update_password=False,
        )

        with testing_session_local() as session:
            stored_user = session.get(User, user.id)

        assert message == "Administrator account created."
        assert stored_user is not None
        assert stored_user.role == UserRole.ADMINISTRATOR
        assert stored_user.email == "admin@example.com"
    finally:
        Base.metadata.drop_all(bind=engine)


def test_create_admin_script_promotes_existing_user(monkeypatch) -> None:
    engine, testing_session_local = make_session_local()
    monkeypatch.setattr("scripts.create_admin.SessionLocal", testing_session_local)

    try:
        with testing_session_local() as session:
            user = User(
                email="creator@example.com",
                username="creator-one",
                password_hash="hashed-password",
                role=UserRole.CREATOR,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            user_id = user.id

        promoted_user, message = create_or_promote_admin(
            email="creator@example.com",
            username="creator-one",
            password="secret123",
            update_password=False,
        )

        with testing_session_local() as session:
            stored_user = session.get(User, user_id)

        assert message == "Existing user promoted to administrator."
        assert promoted_user.role == UserRole.ADMINISTRATOR
        assert stored_user is not None
        assert stored_user.role == UserRole.ADMINISTRATOR
    finally:
        Base.metadata.drop_all(bind=engine)
