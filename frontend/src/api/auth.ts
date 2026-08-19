import { apiRequest } from "./client";


export interface LoginRequest {
  email: string;
  password: string;
}


export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}


export interface OrganizationMembership {
  organization_id: string;
  organization_name: string;
  role: string;
  permissions: string[];
}


export interface MeResponse {
  user_id: number;
  email: string;
  memberships: OrganizationMembership[];
}


export interface RegisterRequest {
  email: string;
  password: string;
  organization_name: string;
}


export interface RegisterResponse {
  user_id: number;
  email: string;
  organization_id: string;
  organization_name: string;
  role: string;
}


export function loginUser(
  payload: LoginRequest,
): Promise<TokenResponse> {
  return apiRequest<TokenResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}


export function registerUser(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}


export function getCurrentUser(): Promise<MeResponse> {
  return apiRequest<MeResponse>(
    "/auth/me",
    {
      method: "GET",
    },
  );
}
