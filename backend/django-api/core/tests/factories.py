from accounts.models import User
from organizations.models import Membership, Organization


def create_user(
    *,
    email: str,
    password: str = "TestPass123!",
) -> User:
    return User.objects.create_user(
        email=email,
        password=password,
    )


def create_organization(
    *,
    name: str,
    owner: User,
) -> tuple[Organization, Membership]:
    organization = Organization.objects.create(
        name=name,
        slug=f"{owner.id}-{name.lower().replace(' ', '-')}",
    )

    membership = Membership.objects.create(
        user=owner,
        organization=organization,
        role=Membership.Role.OWNER,
    )

    return organization, membership


def add_membership(
    *,
    user: User,
    organization: Organization,
    role: str,
) -> Membership:
    return Membership.objects.create(
        user=user,
        organization=organization,
        role=role,
    )
