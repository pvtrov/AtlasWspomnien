"""Add optional photo coordinates.

Revision ID: 20260404_0005
Revises: 20260404_0004
Create Date: 2026-04-04 23:22:16
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260404_0005"
down_revision: str | None = "20260404_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("photos", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("photos", sa.Column("longitude", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("photos", "longitude")
    op.drop_column("photos", "latitude")
