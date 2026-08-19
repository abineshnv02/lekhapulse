from datetime import datetime
from uuid import UUID

from ninja import Schema


class InviteMemberRequest(Schema):
    email: str
    role: str


class InvitationResponse(Schema):
    id: UUID
    email: str
    role: str
    expires_at: datetime
    invitation_url: str


class InvitationDetailsResponse(Schema):
    email: str
    organization_id: UUID
    organization_name: str
    role: str
    expires_at: datetime


class AcceptInvitationRequest(Schema):
    password: str


class AcceptInvitationResponse(Schema):
    user_id: int
    email: str
    organization_id: UUID
    organization_name: str
    role: str


class TeamMemberResponse(Schema):
    membership_id: UUID
    user_id: int
    email: str
    role: str


class TeamMemberListResponse(Schema):
    items: list[TeamMemberResponse]
    count: int


class UpdateMemberRoleRequest(Schema):
    role: str


class DeleteMemberResponse(Schema):
    status: str
