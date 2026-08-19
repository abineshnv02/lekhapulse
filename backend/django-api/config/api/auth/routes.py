from uuid import UUID

from django.core.exceptions import PermissionDenied
from ninja import Router
from ninja.errors import HttpError

from accounts.services.authentication import authenticate_user
from accounts.services.registration import register_user

from config.auth.jwt import (
    create_access_token,
    create_refresh_token,
)

from config.auth.ninja_auth import JWTAuth

from organizations.models import Membership
from organizations.services.permissions import (
    ROLE_PERMISSIONS,
)

from .schemas import (
    LoginRequest,
    MeResponse,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
)


router = Router(
    tags=["Authentication"],
    auth=None,
)


@router.post(
    "/register",
    response=RegisterResponse,
)
def register(
    request,
    payload: RegisterRequest,
):
    try:
        user, organization, membership = register_user(
            email=payload.email,
            password=payload.password,
            organization_name=payload.organization_name,
        )

    except ValueError as exc:
        raise HttpError(
            400,
            str(exc),
        )

    return {
        "user_id": user.id,
        "email": user.email,
        "organization_id": organization.id,
        "organization_name": organization.name,
        "role": membership.role,
    }


@router.post(
    "/login",
    response=TokenResponse,
)
def login(
    request,
    payload: LoginRequest,
):
    user = authenticate_user(
        email=payload.email,
        password=payload.password,
    )

    if user is None:
        raise HttpError(
            401,
            "Invalid email or password.",
        )

    if not user.is_active:
        raise HttpError(
            403,
            "User account is inactive.",
        )

    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
    }


@router.get(
    "/me",
    response=MeResponse,
    auth=JWTAuth(),
)
def me(request):
    memberships = (
        Membership.objects
        .select_related("organization")
        .filter(user=request.auth)
        .order_by("organization__name")
    )

    return {
        "user_id": request.auth.id,
        "email": request.auth.email,
        "memberships": [
            {
                "organization_id": membership.organization.id,
                "organization_name": (
                    membership.organization.name
                ),
                "role": membership.role,
                "permissions": [
                    permission.value
                    for permission in ROLE_PERMISSIONS.get(
                        membership.role,
                        set(),
                    )
                ],
            }
            for membership in memberships
        ],
    }
