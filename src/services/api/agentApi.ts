import apiClient from '../apiClient';
import { ENDPOINTS } from '../endpoints';

export type CollectionPaymentMethod = 'Cash' | 'UPI' | 'Cheque';

export interface RecordCollectionPayload {
  customer_id: string | number;
  amount: number;
  advance_amount?: number;
  mode: string;
  notes?: string;
  collected_at: string;
}

export interface CollectionResponse {
  id: string | number;
  customer_id: string | number;
  customer_name?: string;
  loan_id: string | number;
  amount: number | string;
  payment_method: CollectionPaymentMethod;
  receipt_number?: string;
  remarks?: string;
  collected_at?: string;
}

export interface AssignedCustomerResponse {
  id: number;
  customer_code: string;
  name: string;
  mobile: string;
  status: string;
  outstanding: number;
  next_due?: {
    id: number;
    customer_id: number;
    finance_id: number;
    loan_id: number | null;
    due_date: string;
    amount: string;
    paid_amount: string;
    penalty_amount: string;
    penalty_paid_amount: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

/** GET /agent/assigned-customers — customers allocated to the logged-in agent. */
export const getAssignedCustomers = async (): Promise<
  AssignedCustomerResponse[]
> => {
  const response = await apiClient.get(ENDPOINTS.AGENT.ASSIGNED_CUSTOMERS);
  const body = response.data as any;
  return body.data ?? body;
};

/** POST /agent/collections — records a collection made by the logged-in agent. */
export const recordCollection = async (
  payload: RecordCollectionPayload,
): Promise<CollectionResponse> => {
  const response = await apiClient.post(ENDPOINTS.AGENT.COLLECTIONS, payload);
  const body = response.data as any;
  return body.data ?? body;
};

export const updateCollectionStatus = async (
  id: string | number,
  status: string
): Promise<any> => {
  const response = await apiClient.patch(ENDPOINTS.AGENT.COLLECTION_STATUS(id), { status });
  const body = response.data as any;
  return body.data ?? body;
};
