from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings


ALGORITHM = "HS256"


def _create_token(
    user_id: int,
    token_type: str,
    lifetime: timedelta,
) -> str:
    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(user_id),
        "type": token_type,
        "iat": now,
        "exp": now + lifetime,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=ALGORITHM,
    )


def create_access_token(user_id: int) -> str:
    lifetime = timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_LIFETIME_MINUTES
    )

    return _create_token(
        user_id=user_id,
        token_type="access",
        lifetime=lifetime,
    )


def create_refresh_token(user_id: int) -> str:
    lifetime = timedelta(
        days=settings.JWT_REFRESH_TOKEN_LIFETIME_DAYS
    )

    return _create_token(
        user_id=user_id,
        token_type="refresh",
        lifetime=lifetime,
    )


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[ALGORITHM],
    )
