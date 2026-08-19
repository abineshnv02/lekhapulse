import { apiRequest } from "./client";


export interface AuditEvent {
  id: string;
  action: string;
  actor_id: number | null;
  actor_email: string | null;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}


export interface AuditEventListResponse {
  items: AuditEvent[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}


export function getAuditEvents(
  organizationId: string,
  page = 1,
  pageSize = 10,
): Promise<AuditEventListResponse> {
  return apiRequest<AuditEventListResponse>(
    `/audit/events?page=${page}&page_size=${pageSize}`,
    {
      method: "GET",
      headers: {
        "X-Organization-ID": organizationId,
      },
    },
  );
}
