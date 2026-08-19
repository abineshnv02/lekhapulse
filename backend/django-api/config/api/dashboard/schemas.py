from ninja import Schema


class DashboardSummaryResponse(Schema):
    client_count: int
    transaction_count: int
    pending_count: int
    processing_count: int
    ai_suggested_count: int
    confirmed_count: int
    failed_count: int
