import uuid

from django.db import models


class Transaction(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        AI_SUGGESTED = "AI_SUGGESTED", "AI Suggested"
        CONFIRMED = "CONFIRMED", "Confirmed"
        FAILED = "FAILED", "Failed"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    client = models.ForeignKey(
        "clients.Client",
        on_delete=models.CASCADE,
        related_name="transactions",
    )

    transaction_date = models.DateField()

    description = models.TextField()

    amount = models.DecimalField(
        max_digits=19,
        decimal_places=4,
    )

    currency = models.CharField(
        max_length=3,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    source = models.CharField(
        max_length=50,
        blank=True,
    )

    source_transaction_id = models.CharField(
        max_length=255,
        blank=True,
    )

    ai_category = models.CharField(
        max_length=255,
        blank=True,
    )

    ai_confidence = models.DecimalField(
    max_digits=5,
    decimal_places=4,
    null=True,
    blank=True,
    )

    confirmed_category = models.CharField(
        max_length=255,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        constraints = [
        models.CheckConstraint(
            condition=models.Q(
                ai_confidence__gte=0,
                ai_confidence__lte=1,
            ),
            name="transaction_ai_confidence_0_1",
        ),
        models.UniqueConstraint(
            fields=["client", "source_transaction_id"],
            condition=~models.Q(source_transaction_id=""),
            name="transaction_client_source_unique",
        ),
    ]

    def __str__(self):
        return f"{self.transaction_date} - {self.description}"
