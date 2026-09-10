import apiClient from '../apiClient';

export interface LoanPackageResponse {
  id: number;
  name: string;
  min_amount: string;
  max_amount: string;
  deduction_percentage: string;
  repayment_period: number;
  repayment_frequency: string;
  due_calculation_type: 'lump_sum' | 'installments';
  installment_count: number;
}

export interface DashboardResponse {
  active_loan: {
    id: number;
    requested_amount: string;
    approved_amount: string;
    repayment_obligation: string;
    due_date: string;
    status: string;
  } | null;
  amount_due: number;
  penalty: number;
  overdue_status: boolean;
}

export interface LoanRequestPayload {
  loan_package_id: number;
  requested_amount: number;
}

export interface LoanRequestResponse {
  id: number;
  customer_id: number;
  loan_package_id: number;
  requested_amount: string;
  status: string;
  admin_notes: string | null;
}

export interface LoanDetailResponse {
  id: number;
  customer_id: number;
  loan_package_id: number;
  loan_request_id: number;
  requested_amount: string;
  deduction_amount: string;
  approved_amount: string;
  repayment_obligation: string;
  due_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  loan_package: {
    id: number;
    name: string;
    min_amount: string;
    max_amount: string;
    deduction_percentage: string;
    repayment_period: number;
    repayment_frequency: string;
    penalty_enabled: boolean;
    missed_dues_before_penalty: number | null;
    penalty_type: string | null;
    penalty_amount_or_percentage: string | null;
    due_calculation_type: string;
    installment_count: number;
    status: boolean;
    created_at: string;
    updated_at: string;
  };
  repayments: { id: number; amount_paid: string; payment_date: string }[];
  repayment_schedules: {
    id: number;
    customer_id: number;
    finance_id: number | null;
    loan_id: number;
    due_date: string;
    amount: string;
    paid_amount?: string;
    penalty_amount?: string;
    penalty_paid_amount?: string;
    status: string;
    created_at: string;
    updated_at: string;
  }[];
}

export type MyLoanResponse = LoanDetailResponse;

/**
 * GET /dashboard
 * Returns active loan, amount due, penalty, overdue status.
 */
export const getDashboard = async (): Promise<DashboardResponse> => {
  const response = await apiClient.get('/dashboard');
  const body = response.data as any;
  return body.data ?? body;
};

/**
 * GET /loan-packages
 * Returns all active loan packages.
 */
export const getLoanPackages = async (): Promise<LoanPackageResponse[]> => {
  const response = await apiClient.get('/loan-packages');
  const body = response.data as any;
  return body.data ?? body;
};

/**
 * POST /loan-request
 * Submit a new loan request.
 */
export const submitLoanRequest = async (
  payload: LoanRequestPayload,
): Promise<LoanRequestResponse> => {
  const response = await apiClient.post('/loan-request', payload);
  const body = response.data as any;
  return body.data ?? body;
};

/**
 * GET /loan-requests
 * Returns all loan requests for the logged-in customer.
 */
export const getLoanRequests = async (): Promise<LoanRequestResponse[]> => {
  const response = await apiClient.get('/loan-requests');
  const body = response.data as any;
  return body.data ?? body;
};

/**
 * GET /loan/{id}
 * Returns loan detail + repayment history.
 */
export const getLoanDetail = async (
  id: number,
): Promise<LoanDetailResponse> => {
  const response = await apiClient.get(`/loan/${id}`);
  const body = response.data as any;
  return body.data ?? body;
};

/**
 * GET /my-loans
 * Returns all loans for the logged-in customer.
 */
export const getMyLoans = async (): Promise<MyLoanResponse[]> => {
  const response = await apiClient.get('/my-loans');
  const body = response.data as any;
  return body.data ?? body;
};

/**
 * GET /repayments_schedules
 * Returns all customer loans with their repayment schedules.
 */
export const getRepaymentSchedules = async (): Promise<MyLoanResponse[]> => {
  const response = await apiClient.get('/repayments_schedules');
  const body = response.data as any;
  return body.data ?? body;
};
