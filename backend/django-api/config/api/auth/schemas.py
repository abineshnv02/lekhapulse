from uuid import UUID

from ninja import Schema


class LoginRequest(Schema):
    email: str
    password: str


class TokenResponse(Schema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RegisterRequest(Schema):
    email: str
    password: str
    organization_name: str


class RegisterResponse(Schema):
    user_id: int
    email: str
    organization_id: UUID
    organization_name: str
    role: str


class OrganizationMembershipResponse(Schema):
    organization_id: UUID
    organization_name: str
    role: str
    permissions: list[str]


class MeResponse(Schema):
    user_id: int
    email: str
    memberships: list[OrganizationMembershipResponse]
