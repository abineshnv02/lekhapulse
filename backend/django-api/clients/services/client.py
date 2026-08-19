from django.db import transaction as db_transaction
from django.utils import timezone

from accounts.models import User
from audit.models import AuditEvent
from audit.services.events import record_audit_event

from clients.models import Client
from organizations.models import Organization


def create_client(
    organization: Organization,
    *,
    name: str,
    email: str = "",
    phone: str = "",
    actor: User,
) -> Client:
    with db_transaction.atomic():

        client = Client.objects.create(
            organization=organization,
            name=name,
            email=email,
            phone=phone,
        )

        record_audit_event(
            organization=organization,
            actor=actor,
            action=AuditEvent.Action.CLIENT_CREATED,
            target_type="Client",
            target_id=str(client.id),
            metadata={
                "name": client.name,
                "email": client.email,
                "phone": client.phone,
            },
        )

    return client


def list_clients(
    organization: Organization,
) -> list[Client]:
    return list(
        Client.objects.filter(
            organization=organization,
            is_deleted=False,
        )
        .order_by("-created_at")
    )


def get_client(
    organization: Organization,
    client_id,
) -> Client:
    return Client.objects.get(
        id=client_id,
        organization=organization,
        is_deleted=False,
    )


def update_client(
    client: Client,
    *,
    name: str | None = None,
    email: str | None = None,
    phone: str | None = None,
    actor: User,
) -> Client:
    old_name = client.name
    old_email = client.email
    old_phone = client.phone

    if name is not None:
        client.name = name

    if email is not None:
        client.email = email

    if phone is not None:
        client.phone = phone

    with db_transaction.atomic():

        client.save()

        record_audit_event(
            organization=client.organization,
            actor=actor,
            action=AuditEvent.Action.CLIENT_UPDATED,
            target_type="Client",
            target_id=str(client.id),
            metadata={
                "old_name": old_name,
                "new_name": client.name,
                "old_email": old_email,
                "new_email": client.email,
                "old_phone": old_phone,
                "new_phone": client.phone,
            },
        )

    return client


def delete_client(
    client: Client,
    *,
    actor: User,
) -> Client:
    client.is_deleted = True
    client.deleted_at = timezone.now()

    with db_transaction.atomic():

        client.save(
            update_fields=[
                "is_deleted",
                "deleted_at",
                "updated_at",
            ]
        )

        record_audit_event(
            organization=client.organization,
            actor=actor,
            action=AuditEvent.Action.CLIENT_DELETED,
            target_type="Client",
            target_id=str(client.id),
            metadata={
                "name": client.name,
                "email": client.email,
                "phone": client.phone,
            },
        )

    return client
