import axios from 'axios';
import { API_BASE_URL } from '@env';
import apiClient from '../apiClient';
import { ENDPOINTS } from '../endpoints';
import { 
   
  PartnerProfile, 

} from '../../types/models';

export const getPartnerTransactions = async (params?: { from_date?: string, to_date?: string, direction?: string, partnership_id?: number }): Promise<any> => {
  const cleanParams = Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v !== undefined));
  const query = new URLSearchParams(cleanParams as any).toString();
  const url = query ? `${ENDPOINTS.PARTNER.TRANSACTIONS}?${query}` : ENDPOINTS.PARTNER.TRANSACTIONS;
  const response = await apiClient.get(url, { skipAuth: true } as any);
  return response.data?.data || response.data;
};

export const getPartnerDashboard = async (partnership_id?: number): Promise<any> => {
  const url = partnership_id ? `${ENDPOINTS.PARTNER.DASHBOARD}?partnership_id=${partnership_id}` : ENDPOINTS.PARTNER.DASHBOARD;
  const response = await apiClient.get(url, { skipAuth: true } as any);
  return response.data?.data || response.data;
};

export const getPartnerPartnerships = async (): Promise<any> => {
  const response = await apiClient.get(ENDPOINTS.PARTNER.PARTNERSHIP, { skipAuth: true } as any);
  return response.data?.data || response.data;
};

export const getPartnerProfile = async (): Promise<PartnerProfile> => {
  const response = await apiClient.get(ENDPOINTS.PARTNER.PROFILE);
  return response.data?.data || response.data;
};

export const getPartnerContributions = async (params?: { from_date?: string, to_date?: string, direction?: string, partnership_id?: number }): Promise<any> => {
  const cleanParams = Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v !== undefined));
  const query = new URLSearchParams(cleanParams as any).toString();
  const url = query ? `${ENDPOINTS.PARTNER.CONTRIBUTIONS}?${query}` : ENDPOINTS.PARTNER.CONTRIBUTIONS;
  const response = await apiClient.get(url, { skipAuth: true } as any);
  return response.data?.data || response.data;
};

export const getPartnerEarnings = async (params?: { from_date?: string, to_date?: string, partnership_id?: number }): Promise<any> => {
  const cleanParams = Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v !== undefined));
  const query = new URLSearchParams(cleanParams as any).toString();
  const url = query ? `${ENDPOINTS.PARTNER.EARNINGS}?${query}` : ENDPOINTS.PARTNER.EARNINGS;
  const response = await apiClient.get(url, { skipAuth: true } as any);
  return response.data?.data || response.data;
};

export const getPartnerWithdrawals = async (params?: { from_date?: string, to_date?: string, direction?: string, partnership_id?: number }): Promise<any> => {
  const cleanParams = Object.fromEntries(Object.entries(params || {}).filter(([_, v]) => v !== undefined));
  const query = new URLSearchParams(cleanParams as any).toString();
  const url = query ? `${ENDPOINTS.PARTNER.WITHDRAWALS}?${query}` : ENDPOINTS.PARTNER.WITHDRAWALS;
  const response = await apiClient.get(url, { skipAuth: true } as any);
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

export const searchCustomers = async (query: string): Promise<any> => {
  const response = await apiClient.get(`/customers/search?query=${encodeURIComponent(query)}`, { skipAuth: true } as any);
  return response.data?.data || response.data;
};
