"""Enable PostgreSQL unaccent extension for archive search.

Revision ID: 20260405_0006
Revises: 20260404_0005
Create Date: 2026-04-05 11:20:00
"""

from collections.abc import Sequence

from alembic import op


revision: str = "20260405_0006"
down_revision: str | None = "20260404_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS unaccent")


def downgrade() -> None:
    op.execute("DROP EXTENSION IF EXISTS unaccent")
