import { apiRequest } from "./client";


export interface DashboardSummary {
  client_count: number;
  transaction_count: number;
  pending_count: number;
  processing_count: number;
  ai_suggested_count: number;
  confirmed_count: number;
  failed_count: number;
}


export function getDashboardSummary(
  organizationId: string,
): Promise<DashboardSummary> {
  return apiRequest<DashboardSummary>(
    "/dashboard/summary",
    {
      method: "GET",
      headers: {
        "X-Organization-ID": organizationId,
      },
    },
  );
}
