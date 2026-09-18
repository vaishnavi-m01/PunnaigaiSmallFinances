import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getExpenseCategories, 
  getExpenses, 
  addExpense, 
  updateExpense, 
  deleteExpense,
  Expense,
  ExpenseCategory,
  GetExpensesParams,
  AddExpensePayload,
  UpdateExpensePayload,
  ExpensesSummary
} from '../services/api/expenseApi';

export interface ExpenseState {
  categories: ExpenseCategory[];
  expenses: Expense[];
  summary: ExpensesSummary;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  hasFetchedCategories: boolean;
}

const initialState: ExpenseState = {
  categories: [],
  expenses: [],
  summary: { total_records: 0, total_amount: 0 },
  isLoading: false,
  isSubmitting: false,
  error: null,
  hasFetchedCategories: false,
};

export const fetchExpenseCategoriesThunk = createAsyncThunk(
  'expense/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await getExpenseCategories();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to fetch categories');
    }
  }
);

export const fetchExpensesThunk = createAsyncThunk(
  'expense/fetchExpenses',
  async (params: GetExpensesParams | undefined, { rejectWithValue }) => {
    try {
      return await getExpenses(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to fetch expenses');
    }
  }
);

export const createExpenseThunk = createAsyncThunk(
  'expense/createExpense',
  async (payload: AddExpensePayload, { rejectWithValue }) => {
    try {
      return await addExpense(payload);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to create expense');
    }
  }
);

export const updateExpenseThunk = createAsyncThunk(
  'expense/updateExpense',
  async ({ id, payload }: { id: string | number; payload: UpdateExpensePayload }, { rejectWithValue }) => {
    try {
      return await updateExpense(id, payload);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to update expense');
    }
  }
);

export const removeExpenseThunk = createAsyncThunk(
  'expense/removeExpense',
  async (id: string | number, { rejectWithValue }) => {
    try {
      await deleteExpense(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message || 'Failed to delete expense');
    }
  }
);

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    clearExpenseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Categories
    builder.addCase(fetchExpenseCategoriesThunk.fulfilled, (state, action) => {
      state.categories = action.payload;
      state.hasFetchedCategories = true;
    });

    // Fetch Expenses
    builder.addCase(fetchExpensesThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchExpensesThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.expenses = action.payload.expenses;
      if (action.payload.summary) {
        state.summary = action.payload.summary;
      } else {
        // Fallback summary calculation if not provided by backend
        state.summary = {
          total_records: action.payload.expenses.length,
          total_amount: action.payload.expenses.reduce((sum, exp) => sum + exp.amount, 0),
        };
      }
    });
    builder.addCase(fetchExpensesThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create Expense
    builder.addCase(createExpenseThunk.pending, (state) => {
      state.isSubmitting = true;
    });
    builder.addCase(createExpenseThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      // Note: Ideally, we should refetch expenses after create to ensure correct sorting/pagination,
      // but we can prepend it optimistically here if needed. We'll handle refetch in the component.
    });
    builder.addCase(createExpenseThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload as string;
    });

    // Update Expense
    builder.addCase(updateExpenseThunk.pending, (state) => {
      state.isSubmitting = true;
    });
    builder.addCase(updateExpenseThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      const index = state.expenses.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = { ...state.expenses[index], ...action.payload };
      }
    });
    builder.addCase(updateExpenseThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload as string;
    });

    // Delete Expense
    builder.addCase(removeExpenseThunk.pending, (state) => {
      state.isSubmitting = true;
    });
    builder.addCase(removeExpenseThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.expenses = state.expenses.filter(e => e.id !== action.payload);
      state.summary.total_records = Math.max(0, state.summary.total_records - 1);
      // We don't adjust amount perfectly here because it might affect pagination. Better to refetch in UI.
    });
    builder.addCase(removeExpenseThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearExpenseError } = expenseSlice.actions;
export default expenseSlice.reducer;
