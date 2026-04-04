from sqlalchemy.orm import Session

from app.models.photo_category import PhotoCategory


def test_photo_category_supports_optional_parent_child_relationship(
    db_session: Session,
) -> None:
    parent_category = PhotoCategory(slug="ulica", name="Ulica")
    db_session.add(parent_category)
    db_session.commit()
    db_session.refresh(parent_category)

    child_category = PhotoCategory(
        slug="zabytkowa-ulica",
        name="Zabytkowa ulica",
        parent_id=parent_category.id,
    )
    db_session.add(child_category)
    db_session.commit()
    db_session.refresh(child_category)

    assert child_category.parent_id == parent_category.id
    assert child_category.parent is not None
    assert child_category.parent.slug == "ulica"
    assert parent_category.children[0].slug == "zabytkowa-ulica"
