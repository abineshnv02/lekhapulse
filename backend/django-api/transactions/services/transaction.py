from datetime import date
from decimal import Decimal
from uuid import UUID

from django.core.paginator import Paginator
from django.db import IntegrityError, transaction as db_transaction
from django.db.models import Q

from accounts.models import User
from audit.models import AuditEvent
from audit.services.events import record_audit_event

from clients.models import Client
from organizations.models import Organization
from transactions.models import Transaction


def create_transaction(
    client: Client,
    *,
    transaction_date: date,
    description: str,
    amount: Decimal,
    currency: str,
    source: str = "",
    source_transaction_id: str = "",
    actor: User,
) -> Transaction:
    try:
        with db_transaction.atomic():

            transaction = Transaction.objects.create(
                client=client,
                transaction_date=transaction_date,
                description=description,
                amount=amount,
                currency=currency,
                source=source,
                source_transaction_id=source_transaction_id,
            )

            record_audit_event(
                organization=client.organization,
                actor=actor,
                action=AuditEvent.Action.TRANSACTION_CREATED,
                target_type="Transaction",
                target_id=str(transaction.id),
                metadata={
                    "client_id": str(client.id),
                    "transaction_date": (
                        transaction.transaction_date.isoformat()
                    ),
                    "description": transaction.description,
                    "amount": str(transaction.amount),
                    "currency": transaction.currency,
                    "source": transaction.source,
                    "source_transaction_id": (
                        transaction.source_transaction_id
                    ),
                },
            )

            return transaction

    except IntegrityError as exc:
        if "transaction_client_source_unique" in str(exc):
            raise ValueError(
                "A transaction with this source ID already exists "
                "for this client."
            ) from exc

        raise


def list_transactions(
    organization: Organization,
    *,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    status: str | None = None,
    client_id: UUID | None = None,
) -> dict:
    queryset = (
        Transaction.objects.filter(
            client__organization=organization,
        )
        .select_related("client")
        .order_by(
            "-transaction_date",
            "-created_at",
        )
    )

    if search:
        search = search.strip()

        if search:
            queryset = queryset.filter(
                Q(description__icontains=search)
                | Q(source_transaction_id__icontains=search)
                | Q(ai_category__icontains=search)
                | Q(confirmed_category__icontains=search)
                | Q(client__name__icontains=search)
            )

    if status:
        valid_statuses = {
            choice
            for choice, _ in Transaction.Status.choices
        }

        if status not in valid_statuses:
            raise ValueError(
                f"Invalid transaction status: {status}"
            )

        queryset = queryset.filter(
            status=status,
        )

    if client_id:
        queryset = queryset.filter(
            client_id=client_id,
        )

    paginator = Paginator(
        queryset,
        page_size,
    )

    total_count = paginator.count
    total_pages = paginator.num_pages

    if page > total_pages and total_pages > 0:
        raise ValueError(
            f"Page {page} is out of range."
        )

    page_object = paginator.get_page(page)

    return {
        "items": list(page_object.object_list),
        "count": total_count,
        "page": page_object.number,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def get_transaction(
    organization: Organization,
    transaction_id,
) -> Transaction:
    return Transaction.objects.get(
        id=transaction_id,
        client__organization=organization,
    )


def update_transaction(
    transaction: Transaction,
    *,
    client: Client | None = None,
    transaction_date: date | None = None,
    description: str | None = None,
    amount: Decimal | None = None,
    currency: str | None = None,
    source: str | None = None,
    source_transaction_id: str | None = None,
    actor: User,
) -> Transaction:
    if transaction.status in {
        Transaction.Status.PROCESSING,
        Transaction.Status.CONFIRMED,
    }:
        raise ValueError(
            "This transaction cannot be edited while it is "
            "being processed or after it has been confirmed."
        )

    # Capture the old values before modifying the object.
    old_client_id = str(transaction.client_id)
    old_transaction_date = (
        transaction.transaction_date.isoformat()
    )
    old_description = transaction.description
    old_amount = str(transaction.amount)
    old_currency = transaction.currency
    old_source = transaction.source
    old_source_transaction_id = (
        transaction.source_transaction_id
    )

    if client is not None:
        transaction.client = client

    if transaction_date is not None:
        transaction.transaction_date = transaction_date

    if description is not None:
        transaction.description = description

    if amount is not None:
        transaction.amount = amount

    if currency is not None:
        transaction.currency = currency.upper()

    if source is not None:
        transaction.source = source

    if source_transaction_id is not None:
        transaction.source_transaction_id = (
            source_transaction_id
        )

    # Any editable change invalidates the previous AI result.
    transaction.ai_category = ""
    transaction.ai_confidence = None
    transaction.confirmed_category = ""
    transaction.status = Transaction.Status.PENDING

    try:
        with db_transaction.atomic():

            transaction.save(
                update_fields=[
                    "client",
                    "transaction_date",
                    "description",
                    "amount",
                    "currency",
                    "source",
                    "source_transaction_id",
                    "ai_category",
                    "ai_confidence",
                    "confirmed_category",
                    "status",
                    "updated_at",
                ],
            )

            record_audit_event(
                organization=transaction.client.organization,
                actor=actor,
                action=AuditEvent.Action.TRANSACTION_UPDATED,
                target_type="Transaction",
                target_id=str(transaction.id),
                metadata={
                    "old": {
                        "client_id": old_client_id,
                        "transaction_date": (
                            old_transaction_date
                        ),
                        "description": old_description,
                        "amount": old_amount,
                        "currency": old_currency,
                        "source": old_source,
                        "source_transaction_id": (
                            old_source_transaction_id
                        ),
                    },
                    "new": {
                        "client_id": str(
                            transaction.client_id
                        ),
                        "transaction_date": (
                            transaction.transaction_date.isoformat()
                        ),
                        "description": (
                            transaction.description
                        ),
                        "amount": str(
                            transaction.amount
                        ),
                        "currency": transaction.currency,
                        "source": transaction.source,
                        "source_transaction_id": (
                            transaction.source_transaction_id
                        ),
                    },
                },
            )

    except IntegrityError as exc:
        if "transaction_client_source_unique" in str(exc):
            raise ValueError(
                "A transaction with this source ID already exists "
                "for this client."
            ) from exc

        raise

    return transaction


def confirm_transaction(
    organization: Organization,
    transaction_id,
    *,
    actor: User,
) -> Transaction:
    with db_transaction.atomic():

        transaction = (
            Transaction.objects
            .select_for_update()
            .select_related("client")
            .get(
                id=transaction_id,
                client__organization=organization,
            )
        )

        if transaction.status == Transaction.Status.CONFIRMED:
            return transaction

        if transaction.status != Transaction.Status.AI_SUGGESTED:
            raise ValueError(
                "Only AI-suggested transactions can be confirmed."
            )

        if not transaction.ai_category:
            raise ValueError(
                "Transaction does not have an AI category."
            )

        previous_status = transaction.status
        ai_category = transaction.ai_category

        transaction.confirmed_category = (
            transaction.ai_category
        )
        transaction.status = (
            Transaction.Status.CONFIRMED
        )

        transaction.save(
            update_fields=[
                "confirmed_category",
                "status",
                "updated_at",
            ],
        )

        record_audit_event(
            organization=organization,
            actor=actor,
            action=AuditEvent.Action.TRANSACTION_CONFIRMED,
            target_type="Transaction",
            target_id=str(transaction.id),
            metadata={
                "description": transaction.description,
                "client_id": str(
                    transaction.client_id
                ),
                "previous_status": previous_status,
                "new_status": transaction.status,
                "ai_category": ai_category,
                "confirmed_category": (
                    transaction.confirmed_category
                ),
                "ai_confidence": (
                    str(transaction.ai_confidence)
                    if transaction.ai_confidence is not None
                    else None
                ),
            },
        )

        return transaction
