"""Add photo categories foundation.

Revision ID: 20260404_0004
Revises: 20260404_0003
Create Date: 2026-04-04 01:30:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260404_0004"
down_revision: str | None = "20260404_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "photo_categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=True),
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
        sa.ForeignKeyConstraint(
            ["parent_id"],
            ["photo_categories.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_photo_categories_slug"),
    )
    op.create_index(
        "ix_photo_categories_parent_id",
        "photo_categories",
        ["parent_id"],
        unique=False,
    )

    photo_categories_table = sa.table(
        "photo_categories",
        sa.column("slug", sa.String(length=100)),
        sa.column("name", sa.String(length=255)),
    )
    op.bulk_insert(
        photo_categories_table,
        [
            {"slug": "ulica", "name": "Ulica"},
            {"slug": "budynek", "name": "Budynek"},
            {"slug": "park", "name": "Park"},
        ],
    )

    op.add_column("photos", sa.Column("category_id", sa.Integer(), nullable=True))

    connection = op.get_bind()
    default_category_id = connection.execute(
        sa.text("SELECT id FROM photo_categories WHERE slug = :slug"),
        {"slug": "ulica"},
    ).scalar_one()

    connection.execute(
        sa.text("UPDATE photos SET category_id = :category_id WHERE category_id IS NULL"),
        {"category_id": default_category_id},
    )

    op.alter_column("photos", "category_id", nullable=False)
    op.create_foreign_key(
        "fk_photos_category_id_photo_categories",
        "photos",
        "photo_categories",
        ["category_id"],
        ["id"],
        ondelete="RESTRICT",
    )
    op.create_index("ix_photos_category_id", "photos", ["category_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_photos_category_id", table_name="photos")
    op.drop_constraint("fk_photos_category_id_photo_categories", "photos", type_="foreignkey")
    op.drop_column("photos", "category_id")
    op.drop_index("ix_photo_categories_parent_id", table_name="photo_categories")
    op.drop_table("photo_categories")
