from datetime import datetime
from uuid import UUID

from ninja import Schema


class AuditEventResponse(Schema):
    id: UUID
    action: str
    actor_id: int | None
    actor_email: str | None
    target_type: str
    target_id: str
    metadata: dict
    created_at: datetime


class AuditEventListResponse(Schema):
    items: list[AuditEventResponse]
    count: int
    page: int
    page_size: int
    total_pages: int
