"""Add photos table.

Revision ID: 20260404_0003
Revises: 20260403_0002
Create Date: 2026-04-04 00:30:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260404_0003"
down_revision: str | None = "20260403_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "photos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=2000), nullable=False),
        sa.Column("location_text", sa.String(length=255), nullable=False),
        sa.Column("taken_year", sa.Integer(), nullable=False),
        sa.Column("taken_month", sa.Integer(), nullable=True),
        sa.Column("taken_day", sa.Integer(), nullable=True),
        sa.Column("file_reference", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_photos_location_text", "photos", ["location_text"], unique=False)
    op.create_index("ix_photos_owner_id", "photos", ["owner_id"], unique=False)
    op.create_index(
        "ix_photos_taken_on_parts",
        "photos",
        ["taken_year", "taken_month", "taken_day"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_photos_taken_on_parts", table_name="photos")
    op.drop_index("ix_photos_owner_id", table_name="photos")
    op.drop_index("ix_photos_location_text", table_name="photos")
    op.drop_table("photos")
