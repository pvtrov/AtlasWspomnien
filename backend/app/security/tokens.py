from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings


ALGORITHM = "HS256"


def create_access_token(*, subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.auth_access_token_expire_minutes,
    )
    payload = {
        "sub": subject,
        "exp": expires_at,
    }
    return jwt.encode(payload, settings.auth_secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict[str, object]:
    return jwt.decode(token, settings.auth_secret_key, algorithms=[ALGORITHM])
