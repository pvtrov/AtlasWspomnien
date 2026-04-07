"""Add user login tracking timestamps.

Revision ID: 20260407_0008
Revises: 20260405_0007
Create Date: 2026-04-07 12:30:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260407_0008"
down_revision: str | None = "20260405_0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("last_successful_login_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("previous_successful_login_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "previous_successful_login_at")
    op.drop_column("users", "last_successful_login_at")
