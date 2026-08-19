from django.contrib.auth import authenticate
from django.contrib.auth.models import AbstractBaseUser


def authenticate_user(email: str, password: str) -> AbstractBaseUser | None:
    return authenticate(
        email=email,
        password=password,
    )
