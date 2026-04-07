from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User, UserRole


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        return self.db.scalar(statement)

    def get_by_username(self, username: str) -> User | None:
        statement = select(User).where(User.username == username)
        return self.db.scalar(statement)

    def get_by_id(self, user_id: int) -> User | None:
        statement = select(User).where(User.id == user_id)
        return self.db.scalar(statement)

    def list_all(self) -> list[User]:
        statement = select(User).order_by(User.created_at.desc(), User.id.desc())
        return list(self.db.scalars(statement))

    def create_creator(
        self,
        *,
        email: str,
        username: str,
        password_hash: str,
    ) -> User:
        user = User(
            email=email,
            username=username,
            password_hash=password_hash,
            role=UserRole.CREATOR,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def set_blocked_state(self, user: User, *, is_blocked: bool) -> User:
        user.is_blocked = is_blocked
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def set_role(self, user: User, *, role: UserRole) -> User:
        user.role = role
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def record_successful_login(self, user: User) -> User:
        user.previous_successful_login_at = user.last_successful_login_at
        user.last_successful_login_at = datetime.now(timezone.utc)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
