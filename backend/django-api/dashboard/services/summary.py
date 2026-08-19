from django.db.models import Count, Q

from clients.models import Client
from organizations.models import Organization
from transactions.models import Transaction


def get_dashboard_summary(
    organization: Organization,
) -> dict[str, int]:
    client_count = Client.objects.filter(
        organization=organization,
        is_deleted=False,
    ).count()

    transaction_counts = Transaction.objects.filter(
        client__organization=organization,
    ).aggregate(
        total=Count("id"),
        pending=Count(
            "id",
            filter=Q(
                status=Transaction.Status.PENDING,
            ),
        ),
        processing=Count(
            "id",
            filter=Q(
                status=Transaction.Status.PROCESSING,
            ),
        ),
        ai_suggested=Count(
            "id",
            filter=Q(
                status=Transaction.Status.AI_SUGGESTED,
            ),
        ),
        confirmed=Count(
            "id",
            filter=Q(
                status=Transaction.Status.CONFIRMED,
            ),
        ),
        failed=Count(
            "id",
            filter=Q(
                status=Transaction.Status.FAILED,
            ),
        ),
    )

    return {
        "client_count": client_count,
        "transaction_count": transaction_counts["total"] or 0,
        "pending_count": transaction_counts["pending"] or 0,
        "processing_count": transaction_counts["processing"] or 0,
        "ai_suggested_count": (
            transaction_counts["ai_suggested"] or 0
        ),
        "confirmed_count": (
            transaction_counts["confirmed"] or 0
        ),
        "failed_count": transaction_counts["failed"] or 0,
    }
