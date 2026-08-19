from celery import shared_task
from django.db import transaction as db_transaction

from ai.exceptions.categorization import (
    AIProviderError,
    AIResponseError,
)
from ai.services.categorizer import GeminiCategorizer
from transactions.models import Transaction


@shared_task(
    autoretry_for=(AIProviderError,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def process_transaction(transaction_id: str) -> str:
    try:
        transaction = (
            Transaction.objects
            .select_related("client")
            .get(id=transaction_id)
        )
    except Transaction.DoesNotExist:
        return f"Transaction {transaction_id} not found."

    # Idempotency protection.
    if transaction.status == Transaction.Status.AI_SUGGESTED:
        return (
            f"Transaction {transaction.id} was already processed. "
            "Skipping duplicate execution."
        )

    if transaction.status == Transaction.Status.CONFIRMED:
        return (
            f"Transaction {transaction.id} was already confirmed. "
            "Skipping processing."
        )

    transaction.status = Transaction.Status.PROCESSING
    transaction.save(
        update_fields=["status", "updated_at"],
    )

    categorizer = GeminiCategorizer()

    try:
        result = categorizer.categorize(
            description=transaction.description,
            amount=transaction.amount,
            currency=transaction.currency,
        )

    except AIResponseError:
        transaction.status = Transaction.Status.FAILED
        transaction.save(
            update_fields=["status", "updated_at"],
        )

        raise

    with db_transaction.atomic():
        transaction.ai_category = result.category
        transaction.ai_confidence = result.confidence
        transaction.status = Transaction.Status.AI_SUGGESTED

        transaction.save(
            update_fields=[
                "ai_category",
                "ai_confidence",
                "status",
                "updated_at",
            ],
        )

    return f"Transaction {transaction.id} processed successfully."
