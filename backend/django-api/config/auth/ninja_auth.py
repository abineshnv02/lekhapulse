from ninja.security import HttpBearer
from jwt import InvalidTokenError

from accounts.models import User
from config.auth.jwt import decode_token


class JWTAuth(HttpBearer):
    def authenticate(self, request, token):
        try:
            payload = decode_token(token)
        except InvalidTokenError:
            return None

        if payload.get("type") != "access":
            return None

        user_id = payload.get("sub")

        if not user_id:
            return None

        try:
            return User.objects.get(
                id=user_id,
                is_active=True,
            )
        except User.DoesNotExist:
            return None
