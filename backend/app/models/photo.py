from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.photo_category import PhotoCategory
    from app.models.user import User


class Photo(Base):
    __tablename__ = "photos"
    __table_args__ = (
        Index("ix_photos_owner_id", "owner_id"),
        Index("ix_photos_category_id", "category_id"),
        Index("ix_photos_location_text", "location_text"),
        Index("ix_photos_taken_on_parts", "taken_year", "taken_month", "taken_day"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("photo_categories.id", ondelete="RESTRICT"),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    location_text: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    taken_year: Mapped[int] = mapped_column(Integer, nullable=False)
    taken_month: Mapped[int | None] = mapped_column(Integer, nullable=True)
    taken_day: Mapped[int | None] = mapped_column(Integer, nullable=True)
    file_reference: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    owner: Mapped[User] = relationship(back_populates="photos")
    category: Mapped[PhotoCategory] = relationship(back_populates="photos")
