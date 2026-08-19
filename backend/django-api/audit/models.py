import uuid

from django.conf import settings
from django.db import models

from organizations.models import Organization


class AuditEvent(models.Model):
    class Action(models.TextChoices):
        CLIENT_CREATED = (
            "CLIENT_CREATED",
            "Client created",
        )

        CLIENT_UPDATED = (
            "CLIENT_UPDATED",
            "Client updated",
        )

        CLIENT_DELETED = (
            "CLIENT_DELETED",
            "Client deleted",
        )

        TRANSACTION_CREATED = (
            "TRANSACTION_CREATED",
            "Transaction created",
        )

        TRANSACTION_UPDATED = (
            "TRANSACTION_UPDATED",
            "Transaction updated",
        )

        TRANSACTION_CONFIRMED = (
            "TRANSACTION_CONFIRMED",
            "Transaction confirmed",
        )

        MEMBER_INVITED = (
            "MEMBER_INVITED",
            "Member invited",
        )

        MEMBER_ROLE_UPDATED = (
            "MEMBER_ROLE_UPDATED",
            "Member role updated",
        )

        MEMBER_REMOVED = (
            "MEMBER_REMOVED",
            "Member removed",
        )

        INVITATION_ACCEPTED = (
            "INVITATION_ACCEPTED",
            "Invitation accepted",
        )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="audit_events",
    )

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_events",
    )

    action = models.CharField(
        max_length=50,
        choices=Action.choices,
    )

    target_type = models.CharField(
        max_length=100,
    )

    target_id = models.CharField(
        max_length=100,
    )

    metadata = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        indexes = [
            models.Index(
                fields=[
                    "organization",
                    "-created_at",
                ],
                name="audit_org_created_idx",
            ),
            models.Index(
                fields=[
                    "actor",
                    "-created_at",
                ],
                name="audit_actor_created_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.action} "
            f"{self.target_type}:{self.target_id}"
        )
