from uuid import UUID

from django.core.exceptions import PermissionDenied
from ninja import Header, Query, Router
from ninja.errors import HttpError

from clients.models import Client

from config.api.transactions.schemas import (
    TransactionCreateRequest,
    TransactionListResponse,
    TransactionResponse,
    TransactionUpdateRequest,
)

from organizations.services.membership import (
    get_membership_for_user,
)

from organizations.services.permissions import (
    can_create_transaction,
    can_update_transaction,
    can_view_transaction,
)

from transactions.models import Transaction

from transactions.services.transaction import (
    confirm_transaction,
    create_transaction,
    get_transaction,
    list_transactions,
    update_transaction,
)

from transactions.tasks import process_transaction


router = Router(
    tags=["Transactions"],
)


@router.post(
    "/",
    response=TransactionResponse,
)
def create_transaction_endpoint(
    request,
    payload: TransactionCreateRequest,
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

    if not can_create_transaction(membership):
        raise HttpError(
            403,
            "You do not have permission to create transactions.",
        )

    try:
        client = Client.objects.get(
            id=payload.client_id,
            organization=membership.organization,
            is_deleted=False,
        )
    except Client.DoesNotExist:
        raise HttpError(
            404,
            "Client not found.",
        )

    try:
        transaction = create_transaction(
            client=client,
            transaction_date=payload.transaction_date,
            description=payload.description,
            amount=payload.amount,
            currency=payload.currency,
            source=payload.source,
            source_transaction_id=(
                payload.source_transaction_id
            ),
            actor=membership.user,
        )
    except ValueError as exc:
        raise HttpError(
            409,
            str(exc),
        )

    process_transaction.delay(
        str(transaction.id),
    )

    return transaction


@router.get(
    "/",
    response=TransactionListResponse,
)
def list_transactions_endpoint(
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
    search: str | None = Query(
        None,
    ),
    status: str | None = Query(
        None,
    ),
    client_id: UUID | None = Query(
        None,
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

    if not can_view_transaction(membership):
        raise HttpError(
            403,
            "You do not have permission to view transactions.",
        )

    try:
        result = list_transactions(
            organization=membership.organization,
            page=page,
            page_size=page_size,
            search=search,
            status=status,
            client_id=client_id,
        )
    except ValueError as exc:
        raise HttpError(
            400,
            str(exc),
        )

    return result


@router.get(
    "/{transaction_id}",
    response=TransactionResponse,
)
def get_transaction_endpoint(
    request,
    transaction_id: UUID,
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

    if not can_view_transaction(membership):
        raise HttpError(
            403,
            "You do not have permission to view transactions.",
        )

    try:
        transaction = get_transaction(
            organization=membership.organization,
            transaction_id=transaction_id,
        )
    except Transaction.DoesNotExist:
        raise HttpError(
            404,
            "Transaction not found.",
        )

    return transaction


@router.patch(
    "/{transaction_id}",
    response=TransactionResponse,
)
def update_transaction_endpoint(
    request,
    transaction_id: UUID,
    payload: TransactionUpdateRequest,
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

    if not can_update_transaction(membership):
        raise HttpError(
            403,
            "You do not have permission to update transactions.",
        )

    try:
        transaction = get_transaction(
            organization=membership.organization,
            transaction_id=transaction_id,
        )
    except Transaction.DoesNotExist:
        raise HttpError(
            404,
            "Transaction not found.",
        )

    client = None

    if payload.client_id is not None:
        try:
            client = Client.objects.get(
                id=payload.client_id,
                organization=membership.organization,
                is_deleted=False,
            )
        except Client.DoesNotExist:
            raise HttpError(
                404,
                "Client not found.",
            )

    try:
        transaction = update_transaction(
            transaction=transaction,
            client=client,
            transaction_date=payload.transaction_date,
            description=payload.description,
            amount=payload.amount,
            currency=payload.currency,
            source=payload.source,
            source_transaction_id=(
                payload.source_transaction_id
            ),
            actor=membership.user,
        )
    except ValueError as exc:
        raise HttpError(
            409,
            str(exc),
        )

    process_transaction.delay(
        str(transaction.id),
    )

    return transaction


@router.post(
    "/{transaction_id}/confirm",
    response=TransactionResponse,
)
def confirm_transaction_endpoint(
    request,
    transaction_id: UUID,
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

    if not can_update_transaction(membership):
        raise HttpError(
            403,
            "You do not have permission to confirm transactions.",
        )

    try:
        transaction = confirm_transaction(
            organization=membership.organization,
            transaction_id=transaction_id,
            actor=membership.user,
        )
    except Transaction.DoesNotExist:
        raise HttpError(
            404,
            "Transaction not found.",
        )
    except ValueError as exc:
        raise HttpError(
            409,
            str(exc),
        )

    return transaction
