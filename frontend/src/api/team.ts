import { apiRequest } from "./client";


export type TeamRole =
  | "OWNER"
  | "ADMIN"
  | "ACCOUNTANT"
  | "VIEWER";


export interface TeamMember {
  membership_id: string;
  user_id: number;
  email: string;
  role: TeamRole;
}


export interface TeamMemberListResponse {
  items: TeamMember[];
  count: number;
}


export interface InviteMemberRequest {
  email: string;
  role: "ADMIN" | "ACCOUNTANT" | "VIEWER";
}


export interface UpdateMemberRoleRequest {
  role: "ADMIN" | "ACCOUNTANT" | "VIEWER";
}


export interface InvitationResponse {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  invitation_url: string;
}


export interface InvitationDetails {
  email: string;
  organization_id: string;
  organization_name: string;
  role: string;
  expires_at: string;
}


export interface AcceptInvitationResponse {
  user_id: number;
  email: string;
  organization_id: string;
  organization_name: string;
  role: string;
}


export function getTeamMembers(
  organizationId: string,
): Promise<TeamMemberListResponse> {
  return apiRequest<TeamMemberListResponse>(
    "/team/members",
    {
      method: "GET",
      headers: {
        "X-Organization-ID": organizationId,
      },
    },
  );
}


export function inviteTeamMember(
  organizationId: string,
  payload: InviteMemberRequest,
): Promise<InvitationResponse> {
  return apiRequest<InvitationResponse>(
    "/team/invitations",
    {
      method: "POST",
      headers: {
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify(payload),
    },
  );
}


export function updateTeamMemberRole(
  organizationId: string,
  membershipId: string,
  payload: UpdateMemberRoleRequest,
): Promise<TeamMember> {
  return apiRequest<TeamMember>(
    `/team/members/${membershipId}`,
    {
      method: "PATCH",
      headers: {
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify(payload),
    },
  );
}


export function removeTeamMember(
  organizationId: string,
  membershipId: string,
): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(
    `/team/members/${membershipId}`,
    {
      method: "DELETE",
      headers: {
        "X-Organization-ID": organizationId,
      },
    },
  );
}


export function getInvitationDetails(
  token: string,
): Promise<InvitationDetails> {
  return apiRequest<InvitationDetails>(
    `/team/invitations/${token}`,
    {
      method: "GET",
    },
  );
}


export function acceptInvitation(
  token: string,
  password: string,
): Promise<AcceptInvitationResponse> {
  return apiRequest<AcceptInvitationResponse>(
    `/team/invitations/${token}/accept`,
    {
      method: "POST",
      body: JSON.stringify({
        password,
      }),
    },
  );
}
