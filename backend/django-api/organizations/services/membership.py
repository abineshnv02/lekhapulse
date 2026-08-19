from uuid import UUID

from django.core.exceptions import PermissionDenied

from organizations.models import Membership


def get_membership_for_user(
    user,
    organization_id: UUID,
) -> Membership:
    try:
        return Membership.objects.select_related(
            "organization",
        ).get(
            user=user,
            organization_id=organization_id,
        )
    except Membership.DoesNotExist:
        raise PermissionDenied(
            "User is not a member of this organization."
        )
