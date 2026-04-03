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
