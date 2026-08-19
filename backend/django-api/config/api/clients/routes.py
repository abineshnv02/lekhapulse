from uuid import UUID

from django.core.exceptions import PermissionDenied
from ninja import Header, Router
from ninja.errors import HttpError

from clients.models import Client

from clients.services.client import (
    create_client,
    delete_client,
    get_client,
    list_clients,
    update_client,
)

from config.api.clients.schemas import (
    ClientCreateRequest,
    ClientListResponse,
    ClientResponse,
    ClientUpdateRequest,
)

from organizations.services.membership import (
    get_membership_for_user,
)

from organizations.services.permissions import (
    can_create_client,
    can_delete_client,
    can_update_client,
    can_view_client,
)


router = Router(
    tags=["Clients"],
)


@router.post(
    "/",
    response=ClientResponse,
)
def create_client_endpoint(
    request,
    payload: ClientCreateRequest,
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

    if not can_create_client(membership):
        raise HttpError(
            403,
            "You do not have permission to create clients.",
        )

    client = create_client(
        organization=membership.organization,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        actor=membership.user,
    )

    return client


@router.get(
    "/",
    response=ClientListResponse,
)
def list_clients_endpoint(
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
            "You do not have permission to view clients.",
        )

    clients = list_clients(
        organization=membership.organization,
    )

    return {
        "items": clients,
        "count": len(clients),
    }


@router.get(
    "/{client_id}",
    response=ClientResponse,
)
def get_client_endpoint(
    request,
    client_id: UUID,
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
            "You do not have permission to view clients.",
        )

    try:
        client = get_client(
            organization=membership.organization,
            client_id=client_id,
        )
    except Client.DoesNotExist:
        raise HttpError(
            404,
            "Client not found.",
        )

    return client


@router.patch(
    "/{client_id}",
    response=ClientResponse,
)
def update_client_endpoint(
    request,
    client_id: UUID,
    payload: ClientUpdateRequest,
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

    if not can_update_client(membership):
        raise HttpError(
            403,
            "You do not have permission to update clients.",
        )

    try:
        client = get_client(
            organization=membership.organization,
            client_id=client_id,
        )
    except Client.DoesNotExist:
        raise HttpError(
            404,
            "Client not found.",
        )

    client = update_client(
        client,
        **payload.model_dump(
            exclude_unset=True,
        ),
        actor=membership.user,
    )

    return client


@router.delete(
    "/{client_id}",
)
def delete_client_endpoint(
    request,
    client_id: UUID,
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

    if not can_delete_client(membership):
        raise HttpError(
            403,
            "You do not have permission to delete clients.",
        )

    try:
        client = get_client(
            organization=membership.organization,
            client_id=client_id,
        )
    except Client.DoesNotExist:
        raise HttpError(
            404,
            "Client not found.",
        )

    delete_client(
        client,
        actor=membership.user,
    )

    return {
        "status": "deleted",
    }
