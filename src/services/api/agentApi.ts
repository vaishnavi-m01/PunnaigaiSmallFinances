import apiClient from '../apiClient';
import { ENDPOINTS } from '../endpoints';

export type CollectionPaymentMethod = 'Cash' | 'UPI' | 'Cheque';

export interface RecordCollectionPayload {
  customer_id: string | number;
  loan_id: string | number;
  amount: number;
  payment_method: CollectionPaymentMethod;
  remarks?: string;
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
  id: string | number;
  name: string;
  phone: string;
  loan_id: string | number;
  pending_amount: number | string;
  due_date: string;
  is_overdue: boolean | number;
  address?: string;
  avatar?: string;
}

/** GET /agent/assigned-customers — customers allocated to the logged-in agent. */
export const getAssignedCustomers = async (): Promise<AssignedCustomerResponse[]> => {
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
