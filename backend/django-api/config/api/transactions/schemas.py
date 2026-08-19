from datetime import date
from decimal import Decimal
from uuid import UUID

from ninja import Schema


class TransactionCreateRequest(Schema):
    client_id: UUID
    transaction_date: date
    description: str
    amount: Decimal
    currency: str
    source: str = ""
    source_transaction_id: str = ""


class TransactionUpdateRequest(Schema):
    client_id: UUID | None = None
    transaction_date: date | None = None
    description: str | None = None
    amount: Decimal | None = None
    currency: str | None = None
    source: str | None = None
    source_transaction_id: str | None = None


class TransactionResponse(Schema):
    id: UUID
    client_id: UUID
    transaction_date: date
    description: str
    amount: Decimal
    currency: str
    status: str
    source: str
    source_transaction_id: str
    ai_category: str
    ai_confidence: Decimal | None
    confirmed_category: str


class TransactionListResponse(Schema):
    items: list[TransactionResponse]
    count: int
    page: int
    page_size: int
    total_pages: int
