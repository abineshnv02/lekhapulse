from uuid import UUID

from ninja import Schema


class ClientCreateRequest(Schema):
    name: str
    email: str = ""
    phone: str = ""

class ClientUpdateRequest(Schema):
    name: str | None = None
    email: str | None = None
    phone: str | None = None

class ClientResponse(Schema):
    id: UUID
    name: str
    email: str
    phone: str

class ClientListResponse(Schema):
    items: list[ClientResponse]
    count: int
