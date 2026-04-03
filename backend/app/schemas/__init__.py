"""Schema package."""

from app.schemas.photo import PhotoCreate, PhotoRead
from app.schemas.user import UserCreate, UserRead

__all__ = ["PhotoCreate", "PhotoRead", "UserCreate", "UserRead"]
