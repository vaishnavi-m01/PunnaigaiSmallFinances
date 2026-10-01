import apiClient from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import { PartnerProfile } from '../../types/models';

export const getPartnerTransactions = async (params?: {
  from_date?: string;
  to_date?: string;
  direction?: string;
  partnership_id?: number;
}): Promise<any> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null),
  );
  const query = new URLSearchParams(cleanParams as any).toString();
  const url = query
    ? `${ENDPOINTS.PARTNER.TRANSACTIONS}?${query}`
    : ENDPOINTS.PARTNER.TRANSACTIONS;

  console.log('🚀 [API REQUEST] getPartnerTransactions -> URL:', url);
  const response = await apiClient.get(url, { skipAuth: true } as any);
  console.log('✅ [API RESPONSE] getPartnerTransactions -> DATA:', JSON.stringify(response.data?.data || response.data, null, 2));

  return response.data?.data || response.data;
};

export const getPartnerDashboard = async (params?: {
  partnership_id?: number;
  from_date?: string;
  to_date?: string;
}): Promise<any> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null),
  );
  const query = new URLSearchParams(cleanParams as any).toString();
  const url = query
    ? `${ENDPOINTS.PARTNER.DASHBOARD}?${query}`
    : ENDPOINTS.PARTNER.DASHBOARD;
  const response = await apiClient.get(url, { skipAuth: true } as any);
  return response.data?.data || response.data;
};

export const getPartnerPartnerships = async (): Promise<any> => {
  const response = await apiClient.get(ENDPOINTS.PARTNER.PARTNERSHIP, {
    skipAuth: true,
  } as any);
  return response.data?.data || response.data;
};

export const getPartnerProfile = async (): Promise<PartnerProfile> => {
  const response = await apiClient.get(ENDPOINTS.PARTNER.PROFILE);
  return response.data?.data || response.data;
};

export const updatePartnerProfile = async (formData: FormData) => {
  const response = await apiClient.post(ENDPOINTS.PARTNER.PROFILE_UPDATE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data?.data || response.data;
};

export const deletePartnerProfileImage = async () => {
  const response = await apiClient.delete(ENDPOINTS.PARTNER.PROFILE_IMAGE_DELETE);
  return response.data?.data || response.data;
};

export const getPartnerContributions = async (params?: {
  from_date?: string;
  to_date?: string;
  direction?: string;
  partnership_id?: number;
}): Promise<any> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null),
  );
  const query = new URLSearchParams(cleanParams as any).toString();
  const url = query
    ? `${ENDPOINTS.PARTNER.CONTRIBUTIONS}?${query}`
    : ENDPOINTS.PARTNER.CONTRIBUTIONS;
  const response = await apiClient.get(url, { skipAuth: true } as any);
  return response.data?.data || response.data;
};

export const getPartnerEarnings = async (params?: {
  from_date?: string;
  to_date?: string;
  partnership_id?: number;
}): Promise<any> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null),
  );
  const query = new URLSearchParams(cleanParams as any).toString();
  const url = query
    ? `${ENDPOINTS.PARTNER.EARNINGS}?${query}`
    : ENDPOINTS.PARTNER.EARNINGS;
  const response = await apiClient.get(url, { skipAuth: true } as any);
  return response.data?.data || response.data;
};

export const getPartnerWithdrawals = async (params?: {
  from_date?: string;
  to_date?: string;
  direction?: string;
  partnership_id?: number;
}): Promise<any> => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null),
  );
  const query = new URLSearchParams(cleanParams as any).toString();
  const url = query
    ? `${ENDPOINTS.PARTNER.WITHDRAWALS}?${query}`
    : ENDPOINTS.PARTNER.WITHDRAWALS;
  const response = await apiClient.get(url, { skipAuth: true } as any);
  return response.data?.data || response.data;
};

export const getPartnerOverallProfitCollection = async (params?: { partnership_id?: number }) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null),
  );
  const query = new URLSearchParams(cleanParams as any).toString();
  const url = query
    ? `${ENDPOINTS.PARTNER.OVERALL_PROFIT_COLLECTION}?${query}`
    : ENDPOINTS.PARTNER.OVERALL_PROFIT_COLLECTION;
  const response = await apiClient.get(url);
  return response.data?.data || response.data;
};

export const requestPartnerWithdrawal = async (payload: {
  amount: number;
  notes?: string;
  partnership_id?: number | null;
}) => {
  const response = await apiClient.post(ENDPOINTS.PARTNER.WITHDRAWALS, payload);
  return response.data?.data || response.data;
};

export const addPartnerContribution = async (payload: {
  amount: number;
  payment_method: string;
  contribution_date: string;
  reference_number: string;
  notes: string;
}) => {
  const response = await apiClient.post(
    ENDPOINTS.PARTNER.CONTRIBUTIONS,
    payload,
  );
  return response.data?.data || response.data;
};

export const searchCustomers = async (query: string): Promise<any> => {
  const response = await apiClient.get(
    `/customers/search?query=${encodeURIComponent(query)}`,
    { skipAuth: true } as any,
  );
  return response.data?.data || response.data;
};

export const collectPayment = async (payload: {
  customer_id: number;
  finance_id: number;
  schedule_id: number;
  amount: number;
  advance_amount?: number;
  penalty_amount?: number;
  use_advance?: boolean;
  mode: string;
  notes?: string;
  collected_at: string;
}) => {
  console.log(
    'Collection API Request -> Endpoint: collections, Payload:',
    JSON.stringify(payload, null, 2),
  );
  const response = await apiClient.post(ENDPOINTS.AGENT.COLLECTIONS, payload);
  return response.data?.data || response.data;
};

export const addGivenAmount = async (payload: {
  customer_id: number;
  schedule_id: number;
  given_amount: number;
  payment_date: string;
  note?: string;
}) => {
  const response = await apiClient.post('/givenamount', payload);
  return response.data?.data || response.data;
};

export const updateGivenAmount = async (payload: {
  customer_id: number;
  schedule_id: number;
  given_amount: number;
  payment_date: string;
  note?: string;
}) => {
  const response = await apiClient.put('/givenamount/update', payload);
  return response.data?.data || response.data;
};

export const deleteWithdrawal = async (payload: {
  withdrawal_id: number;
}) => {
  console.log('🚀 [API REQUEST] deleteWithdrawal -> PAYLOAD:', JSON.stringify(payload, null, 2));
  const response = await apiClient.post('/partner/withdrawals/delete', payload);
  return response.data?.data || response.data;
};

export const deleteTransaction = async (payload: {
  transaction_id: number;
}) => {
  console.log('🚀 [API REQUEST] deleteTransaction -> PAYLOAD:', JSON.stringify(payload, null, 2));
  const response = await apiClient.delete('/partner/transactions/delete', { data: payload });
  return response.data?.data || response.data;
};
