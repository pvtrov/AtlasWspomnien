"""Add optional photo display name.

Revision ID: 20260405_0007
Revises: 20260405_0006
Create Date: 2026-04-05 13:10:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260405_0007"
down_revision: str | None = "20260405_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("photos", sa.Column("display_name", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("photos", "display_name")
