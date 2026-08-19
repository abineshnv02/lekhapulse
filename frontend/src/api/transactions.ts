import { apiRequest } from "./client";


export interface Transaction {
  id: string;
  client_id: string;
  transaction_date: string;
  description: string;
  amount: string;
  currency: string;
  status: string;
  source: string;
  source_transaction_id: string;
  ai_category: string;
  ai_confidence: string | null;
  confirmed_category: string;
}


export interface TransactionListResponse {
  items: Transaction[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}


export interface TransactionListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  client_id?: string;
}


export interface TransactionCreateRequest {
  client_id: string;
  transaction_date: string;
  description: string;
  amount: string;
  currency: string;
  source?: string;
  source_transaction_id?: string;
}


export interface TransactionUpdateRequest {
  client_id?: string;
  transaction_date?: string;
  description?: string;
  amount?: string;
  currency?: string;
  source?: string;
  source_transaction_id?: string;
}


export function getTransactions(
  organizationId: string,
  params: TransactionListParams = {},
): Promise<TransactionListResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set(
    "page",
    String(params.page ?? 1),
  );

  searchParams.set(
    "page_size",
    String(params.page_size ?? 20),
  );

  if (params.search?.trim()) {
    searchParams.set(
      "search",
      params.search.trim(),
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params.client_id) {
    searchParams.set(
      "client_id",
      params.client_id,
    );
  }

  return apiRequest<TransactionListResponse>(
    `/transactions/?${searchParams.toString()}`,
    {
      method: "GET",
      headers: {
        "X-Organization-ID": organizationId,
      },
    },
  );
}


export function getTransaction(
  organizationId: string,
  transactionId: string,
): Promise<Transaction> {
  return apiRequest<Transaction>(
    `/transactions/${transactionId}`,
    {
      method: "GET",
      headers: {
        "X-Organization-ID": organizationId,
      },
    },
  );
}


export function createTransaction(
  organizationId: string,
  payload: TransactionCreateRequest,
): Promise<Transaction> {
  return apiRequest<Transaction>(
    "/transactions/",
    {
      method: "POST",
      headers: {
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify(payload),
    },
  );
}


export function updateTransaction(
  organizationId: string,
  transactionId: string,
  payload: TransactionUpdateRequest,
): Promise<Transaction> {
  return apiRequest<Transaction>(
    `/transactions/${transactionId}`,
    {
      method: "PATCH",
      headers: {
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify(payload),
    },
  );
}


export function confirmTransaction(
  organizationId: string,
  transactionId: string,
): Promise<Transaction> {
  return apiRequest<Transaction>(
    `/transactions/${transactionId}/confirm`,
    {
      method: "POST",
      headers: {
        "X-Organization-ID": organizationId,
      },
    },
  );
}
