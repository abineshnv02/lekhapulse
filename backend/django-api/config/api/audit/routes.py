from uuid import UUID

from django.core.paginator import Paginator
from django.core.exceptions import PermissionDenied
from ninja import Header, Query, Router
from ninja.errors import HttpError

from audit.models import AuditEvent

from config.api.audit.schemas import (
    AuditEventListResponse,
)

from organizations.services.membership import (
    get_membership_for_user,
)

from organizations.services.permissions import (
    can_view_audit,
)


router = Router(
    tags=["Audit"],
)


@router.get(
    "/events",
    response=AuditEventListResponse,
)
def list_audit_events(
    request,
    organization_id: UUID = Header(
        ...,
        alias="X-Organization-ID",
    ),
    page: int = Query(
        1,
        ge=1,
    ),
    page_size: int = Query(
        20,
        ge=1,
        le=100,
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

    if not can_view_audit(membership):
        raise HttpError(
            403,
            "You do not have permission to view audit events.",
        )

    queryset = (
        AuditEvent.objects
        .filter(
            organization=membership.organization,
        )
        .select_related("actor")
        .order_by("-created_at")
    )

    paginator = Paginator(
        queryset,
        page_size,
    )

    total_count = paginator.count
    total_pages = paginator.num_pages

    if page > total_pages and total_pages > 0:
        raise HttpError(
            400,
            f"Page {page} is out of range.",
        )

    page_object = paginator.get_page(page)

    return {
        "items": [
            {
                "id": event.id,
                "action": event.action,
                "actor_id": (
                    event.actor.id
                    if event.actor
                    else None
                ),
                "actor_email": (
                    event.actor.email
                    if event.actor
                    else None
                ),
                "target_type": event.target_type,
                "target_id": event.target_id,
                "metadata": event.metadata,
                "created_at": event.created_at,
            }
            for event in page_object.object_list
        ],
        "count": total_count,
        "page": page_object.number,
        "page_size": page_size,
        "total_pages": total_pages,
    }
