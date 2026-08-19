from typing import Any

from audit.models import AuditEvent
from accounts.models import User
from organizations.models import Organization


def record_audit_event(
    *,
    organization: Organization,
    actor: User | None,
    action: AuditEvent.Action,
    target_type: str,
    target_id: str,
    metadata: dict[str, Any] | None = None,
) -> AuditEvent:
    return AuditEvent.objects.create(
        organization=organization,
        actor=actor,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        metadata=metadata or {},
    )
