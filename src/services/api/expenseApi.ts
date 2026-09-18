import apiClient from '../apiClient';
import { ENDPOINTS } from '../endpoints';

export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface Expense {
  id: string | number;
  amount: number;
  category_id: number;
  category_name?: string;
  expense_date: string;
  reference_number?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GetExpensesParams {
  category_id?: number | string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface ExpensesSummary {
  total_records: number;
  total_amount: number;
}

export interface GetExpensesResponse {
  summary?: ExpensesSummary;
  expenses: Expense[];
  pagination?: {
    current_page: number;
    total_pages: number;
    has_next: boolean;
  };
}

export interface AddExpensePayload {
  amount: number;
  category_id: number | string;
  expense_date: string;
  reference_number?: string;
  description?: string;
}

export interface UpdateExpensePayload extends Partial<AddExpensePayload> {}

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const response = await apiClient.get(ENDPOINTS.EXPENSES.CATEGORIES, { skipAuth: true });
  const body = response.data as any;
  return body.data ?? body;
};

export const getExpenses = async (params?: GetExpensesParams): Promise<GetExpensesResponse> => {
  const response = await apiClient.get(ENDPOINTS.EXPENSES.BASE, { params, skipAuth: true });
  const body = response.data as any;
  
  // Handle case where backend returns directly array or an object with data property
  if (Array.isArray(body.data)) {
      return {
          expenses: body.data,
          summary: body.summary,
          pagination: body.pagination,
      };
  } else if (body.data && body.data.expenses) {
      return body.data;
  }
  
  return { expenses: Array.isArray(body) ? body : [] };
};

export const addExpense = async (payload: AddExpensePayload): Promise<Expense> => {
  const response = await apiClient.post(ENDPOINTS.EXPENSES.BASE, payload, { skipAuth: true });
  const body = response.data as any;
  return body.data ?? body;
};

export const updateExpense = async (id: string | number, payload: UpdateExpensePayload): Promise<Expense> => {
  const response = await apiClient.put(ENDPOINTS.EXPENSES.BY_ID(id), payload, { skipAuth: true });
  const body = response.data as any;
  return body.data ?? body;
};

export const deleteExpense = async (id: string | number): Promise<void> => {
  await apiClient.delete(ENDPOINTS.EXPENSES.BY_ID(id), { skipAuth: true });
};
