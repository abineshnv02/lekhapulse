from uuid import UUID

from django.core.exceptions import PermissionDenied
from ninja import Header, Router
from ninja.errors import HttpError

from config.api.team.schemas import (
    AcceptInvitationRequest,
    AcceptInvitationResponse,
    DeleteMemberResponse,
    InvitationDetailsResponse,
    InvitationResponse,
    InviteMemberRequest,
    TeamMemberListResponse,
    TeamMemberResponse,
    UpdateMemberRoleRequest,
)

from organizations.models import Membership

from organizations.services.invitations import (
    accept_invitation,
    create_invitation,
    get_invitation_by_token,
)

from organizations.services.membership import (
    get_membership_for_user,
)

from organizations.services.permissions import (
    can_invite_member,
    can_remove_member,
    can_update_member,
    can_view_member,
)

from organizations.services.team import (
    remove_member,
    update_member_role,
)


router = Router(
    tags=["Team"],
)


@router.get(
    "/members",
    response=TeamMemberListResponse,
)
def list_members(
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

    if not can_view_member(membership):
        raise HttpError(
            403,
            "You do not have permission to view team members.",
        )

    memberships = (
        Membership.objects
        .filter(
            organization=membership.organization,
        )
        .select_related("user")
        .order_by("user__email")
    )

    return {
        "items": [
            {
                "membership_id": item.id,
                "user_id": item.user_id,
                "email": item.user.email,
                "role": item.role,
            }
            for item in memberships
        ],
        "count": len(memberships),
    }


@router.post(
    "/invitations",
    response=InvitationResponse,
)
def invite_member(
    request,
    payload: InviteMemberRequest,
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

    if not can_invite_member(membership):
        raise HttpError(
            403,
            "You do not have permission to invite team members.",
        )

    try:
        invitation = create_invitation(
            organization=membership.organization,
            email=payload.email,
            role=payload.role,
	    actor=membership.user,
        )
    except ValueError as exc:
        raise HttpError(
            409,
            str(exc),
        )

    invitation_url = (
        "http://localhost:5173/"
        f"accept-invitation/{invitation.token}"
    )

    return {
        "id": invitation.id,
        "email": invitation.email,
        "role": invitation.role,
        "expires_at": invitation.expires_at,
        "invitation_url": invitation_url,
    }


@router.get(
    "/invitations/{token}",
    response=InvitationDetailsResponse,
    auth=None,
)
def invitation_details(
    request,
    token: UUID,
):
    try:
        invitation = get_invitation_by_token(token)
    except ValueError as exc:
        raise HttpError(
            400,
            str(exc),
        )

    return {
        "email": invitation.email,
        "organization_id": invitation.organization.id,
        "organization_name": (
            invitation.organization.name
        ),
        "role": invitation.role,
        "expires_at": invitation.expires_at,
    }


@router.post(
    "/invitations/{token}/accept",
    response=AcceptInvitationResponse,
    auth=None,
)
def accept_invitation_endpoint(
    request,
    token: UUID,
    payload: AcceptInvitationRequest,
):
    try:
        user, membership = accept_invitation(
            token=token,
            password=payload.password,
        )
    except ValueError as exc:
        raise HttpError(
            400,
            str(exc),
        )

    return {
        "user_id": user.id,
        "email": user.email,
        "organization_id": membership.organization_id,
        "organization_name": (
            membership.organization.name
        ),
        "role": membership.role,
    }


@router.patch(
    "/members/{membership_id}",
    response=TeamMemberResponse,
)
def update_member(
    request,
    membership_id: UUID,
    payload: UpdateMemberRoleRequest,
    organization_id: UUID = Header(
        ...,
        alias="X-Organization-ID",
    ),
):
    try:
        actor_membership = get_membership_for_user(
            request.auth,
            organization_id,
        )
    except PermissionDenied:
        raise HttpError(
            403,
            "You are not a member of this organization.",
        )

    if not can_update_member(actor_membership):
        raise HttpError(
            403,
            "You do not have permission to update team members.",
        )

    try:
        membership = update_member_role(
            organization=actor_membership.organization,
            membership_id=membership_id,
            new_role=payload.role,
	    actor=actor_membership,
        )
    except ValueError as exc:
        raise HttpError(
            409,
            str(exc),
        )

    return {
        "membership_id": membership.id,
        "user_id": membership.user_id,
        "email": membership.user.email,
        "role": membership.role,
    }


@router.delete(
    "/members/{membership_id}",
    response=DeleteMemberResponse,
)
def delete_member(
    request,
    membership_id: UUID,
    organization_id: UUID = Header(
        ...,
        alias="X-Organization-ID",
    ),
):
    try:
        actor_membership = get_membership_for_user(
            request.auth,
            organization_id,
        )
    except PermissionDenied:
        raise HttpError(
            403,
            "You are not a member of this organization.",
        )

    if not can_remove_member(actor_membership):
        raise HttpError(
            403,
            "You do not have permission to remove team members.",
        )

    try:
        remove_member(
            organization=actor_membership.organization,
            membership_id=membership_id,
            actor_membership=actor_membership,
        )
    except ValueError as exc:
        raise HttpError(
            409,
            str(exc),
        )

    return {
        "status": "removed",
    }
