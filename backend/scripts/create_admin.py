from __future__ import annotations

import argparse
from pathlib import Path
import sys


CURRENT_FILE = Path(__file__).resolve()
BACKEND_ROOT = CURRENT_FILE.parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.security.passwords import hash_password


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create an administrator account or promote an existing user.",
    )
    parser.add_argument("--email", required=True, help="User email address.")
    parser.add_argument("--username", required=True, help="User username.")
    parser.add_argument("--password", required=True, help="User password.")
    parser.add_argument(
        "--update-password",
        action="store_true",
        help="Update the password if the user already exists.",
    )
    return parser.parse_args()


def create_or_promote_admin(
    *,
    email: str,
    username: str,
    password: str,
    update_password: bool,
) -> tuple[User, str]:
    normalized_email = email.strip().lower()
    normalized_username = username.strip()

    with SessionLocal() as session:
        repository = UserRepository(session)

        existing_user = repository.get_by_email(normalized_email)
        if existing_user is None:
            existing_user = repository.get_by_username(normalized_username)

        if existing_user is not None:
            changed = False

            if existing_user.role != UserRole.ADMINISTRATOR:
                existing_user = repository.set_role(
                    existing_user,
                    role=UserRole.ADMINISTRATOR,
                )
                changed = True

            if update_password:
                existing_user.password_hash = hash_password(password)
                session.add(existing_user)
                session.commit()
                session.refresh(existing_user)
                changed = True

            if not changed:
                return existing_user, "Existing user is already an administrator."

            return existing_user, "Existing user promoted to administrator."

        user = User(
            email=normalized_email,
            username=normalized_username,
            password_hash=hash_password(password),
            role=UserRole.ADMINISTRATOR,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        return user, "Administrator account created."


def main() -> None:
    args = parse_args()
    user, message = create_or_promote_admin(
        email=args.email,
        username=args.username,
        password=args.password,
        update_password=args.update_password,
    )

    print(message)
    print(f"id={user.id}")
    print(f"email={user.email}")
    print(f"username={user.username}")
    print(f"role={user.role.value}")
    print(f"is_blocked={user.is_blocked}")


if __name__ == "__main__":
    main()
