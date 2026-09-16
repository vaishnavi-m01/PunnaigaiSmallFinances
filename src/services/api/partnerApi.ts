import apiClient from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import { 
  PartnerDashboardResponse, 
  PartnerProfile, 
  PartnerContribution, 
  PartnerProfitShare, 
  PartnerSummary,
  PartnerTransaction 
} from '../../types/models';

export const getPartnerTransactions = async (params?: { from_date?: string, to_date?: string, direction?: string }): Promise<PartnerTransaction[]> => {
  const response = await apiClient.get(ENDPOINTS.PARTNER.TRANSACTIONS, { params });
  return response.data?.data || response.data;
};

export const getPartnerDashboard = async (): Promise<PartnerDashboardResponse> => {
  const response = await apiClient.get(ENDPOINTS.PARTNER.DASHBOARD);
  return response.data?.data || response.data;
};

export const getPartnerProfile = async (): Promise<PartnerProfile> => {
  const response = await apiClient.get(ENDPOINTS.PARTNER.PROFILE);
  return response.data?.data || response.data;
};

export const getPartnerContributions = async (): Promise<PartnerContribution[]> => {
  const response = await apiClient.get(ENDPOINTS.PARTNER.CONTRIBUTIONS);
  return response.data?.data || response.data;
};

export const getPartnerEarnings = async (): Promise<PartnerProfitShare[]> => {
  const response = await apiClient.get(ENDPOINTS.PARTNER.EARNINGS);
  return response.data?.data || response.data;
};

export const getPartnerWithdrawals = async (params?: { from_date?: string, to_date?: string, direction?: string }): Promise<{ summary: PartnerSummary, withdrawals: any[], credits?: any[], debits?: any[] }> => {
  const response = await apiClient.get(ENDPOINTS.PARTNER.WITHDRAWALS, { params });
  return response.data?.data || response.data;
};

export const requestPartnerWithdrawal = async (payload: {
  withdrawal_type: 'profit' | 'principal';
  amount: number;
  notes?: string;
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
  const response = await apiClient.post(ENDPOINTS.PARTNER.CONTRIBUTIONS, payload);
  return response.data?.data || response.data;
};
