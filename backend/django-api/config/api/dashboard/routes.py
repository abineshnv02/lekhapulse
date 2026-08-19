from uuid import UUID

from django.core.exceptions import PermissionDenied
from ninja import Header, Router
from ninja.errors import HttpError

from config.api.dashboard.schemas import (
    DashboardSummaryResponse,
)
from organizations.services.membership import (
    get_membership_for_user,
)
from organizations.services.permissions import (
    can_view_client,
    can_view_transaction,
)
from dashboard.services.summary import (
    get_dashboard_summary,
)


router = Router(tags=["Dashboard"])


@router.get(
    "/summary",
    response=DashboardSummaryResponse,
)
def dashboard_summary_endpoint(
    request,
    organization_id: UUID = Header(
        ...,
        alias="X-Organization-ID",
    ),
):
    try:
        membership = get_membership_for_user(
            request.auth,
            organization_id,
        )
    except PermissionDenied:
        raise HttpError(
            403,
            "You are not a member of this organization.",
        )

    if not can_view_client(membership):
        raise HttpError(
            403,
            "You do not have permission to view dashboard client data.",
        )

    if not can_view_transaction(membership):
        raise HttpError(
            403,
            "You do not have permission to view dashboard transaction data.",
        )

    return get_dashboard_summary(
        organization=membership.organization,
    )
