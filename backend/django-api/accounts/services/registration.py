from django.db import transaction as db_transaction

from accounts.models import User
from organizations.models import Membership, Organization


def register_user(
    *,
    email: str,
    password: str,
    organization_name: str,
) -> tuple[User, Organization, Membership]:

    email = email.strip().lower()
    organization_name = organization_name.strip()

    if not email:
        raise ValueError("Email is required.")

    if not password:
        raise ValueError("Password is required.")

    if not organization_name:
        raise ValueError("Organization name is required.")

    if User.objects.filter(email=email).exists():
        raise ValueError(
            "An account with this email already exists."
        )

    with db_transaction.atomic():

        user = User.objects.create_user(
            email=email,
            password=password,
        )

        organization = Organization.objects.create(
            name=organization_name,
            slug=f"{user.id}-{organization_name.lower().replace(' ', '-')}",
        )

        membership = Membership.objects.create(
            user=user,
            organization=organization,
            role=Membership.Role.OWNER,
        )

    return user, organization, membership
