import { apiRequest } from "./client";


export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}


export interface ClientListResponse {
  items: Client[];
  count: number;
}


export interface ClientCreateRequest {
  name: string;
  email?: string;
  phone?: string;
}


export interface ClientUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
}


export function getClients(
  organizationId: string,
): Promise<ClientListResponse> {
  return apiRequest<ClientListResponse>(
    "/clients/",
    {
      method: "GET",
      headers: {
        "X-Organization-ID": organizationId,
      },
    },
  );
}


export function getClient(
  organizationId: string,
  clientId: string,
): Promise<Client> {
  return apiRequest<Client>(
    `/clients/${clientId}`,
    {
      method: "GET",
      headers: {
        "X-Organization-ID": organizationId,
      },
    },
  );
}


export function createClient(
  organizationId: string,
  payload: ClientCreateRequest,
): Promise<Client> {
  return apiRequest<Client>(
    "/clients/",
    {
      method: "POST",
      headers: {
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify(payload),
    },
  );
}


export function updateClient(
  organizationId: string,
  clientId: string,
  payload: ClientUpdateRequest,
): Promise<Client> {
  return apiRequest<Client>(
    `/clients/${clientId}`,
    {
      method: "PATCH",
      headers: {
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify(payload),
    },
  );
}


export function deleteClient(
  organizationId: string,
  clientId: string,
): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(
    `/clients/${clientId}`,
    {
      method: "DELETE",
      headers: {
        "X-Organization-ID": organizationId,
      },
    },
  );
}
