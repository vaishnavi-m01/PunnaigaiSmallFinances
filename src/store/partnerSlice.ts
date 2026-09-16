import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  PartnerProfile, 
  PartnerContribution, 
  PartnerProfitShare, 
  PartnerSummary,
  PartnerDashboardResponse 
} from '../types/models';
import * as partnerApi from '../services/api/partnerApi';

export interface PartnerState {
  profile: PartnerProfile | null;
  contributions: PartnerContribution[];
  earnings: PartnerProfitShare[];
  withdrawals: any[];
  credits: any[];
  debits: any[];
  transactions: any[];
  summary: PartnerSummary;
  isLoading: boolean;
  error: string | null;
}

const initialState: PartnerState = {
  profile: null,
  contributions: [],
  earnings: [],
  withdrawals: [],
  credits: [],
  debits: [],
  transactions: [],
  summary: {
    contributions: 0,
    earnings: 0,
    withdrawals: 0,
    available_balance: 0,
    available_principal: 0,
    available_profit: 0,
    pending_withdrawals: 0,
  },
  isLoading: false,
  error: null,
};

export const fetchPartnerDashboardThunk = createAsyncThunk(
  'partner/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerDashboard();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchPartnerProfileThunk = createAsyncThunk(
  'partner/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerProfile();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const fetchPartnerContributionsThunk = createAsyncThunk(
  'partner/fetchContributions',
  async (_, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerContributions();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch contributions');
    }
  }
);

export const fetchPartnerEarningsThunk = createAsyncThunk(
  'partner/fetchEarnings',
  async (_, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerEarnings();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch earnings');
    }
  }
);

export const fetchPartnerTransactionsThunk = createAsyncThunk(
  'partner/fetchTransactions',
  async (params: { from_date?: string, to_date?: string, direction?: string } | undefined, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerTransactions(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchPartnerWithdrawalsThunk = createAsyncThunk(
  'partner/fetchWithdrawals',
  async (params: { from_date?: string, to_date?: string, direction?: string } | undefined, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerWithdrawals(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch withdrawals');
    }
  }
);

export const addPartnerContributionThunk = createAsyncThunk(
  'partner/addContribution',
  async (payload: { 
    amount: number; 
    payment_method: string;
    contribution_date: string;
    reference_number: string;
    notes: string;
  }, { rejectWithValue }) => {
    try {
      return await partnerApi.addPartnerContribution(payload);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to add contribution');
    }
  }
);

export const requestPartnerWithdrawalThunk = createAsyncThunk(
  'partner/requestWithdrawal',
  async (payload: { withdrawal_type: 'profit' | 'principal'; amount: number; notes?: string }, { rejectWithValue }) => {
    try {
      return await partnerApi.requestPartnerWithdrawal(payload);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to request withdrawal');
    }
  }
);

export const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Dashboard
    builder.addCase(fetchPartnerDashboardThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerDashboardThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.profile = action.payload.partner;
      state.contributions = action.payload.partner.contributions || [];
      state.earnings = action.payload.partner.profit_shares || [];
      state.withdrawals = action.payload.partner.withdrawals || [];
      state.summary = action.payload.summary;
    });
    builder.addCase(fetchPartnerDashboardThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Profile
    builder.addCase(fetchPartnerProfileThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerProfileThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchPartnerProfileThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Contributions
    builder.addCase(fetchPartnerContributionsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerContributionsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.contributions = action.payload;
    });
    builder.addCase(fetchPartnerContributionsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Earnings
    builder.addCase(fetchPartnerEarningsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerEarningsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.earnings = action.payload;
    });
    builder.addCase(fetchPartnerEarningsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Withdrawals
    builder.addCase(fetchPartnerWithdrawalsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerWithdrawalsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.summary = action.payload.summary;
      state.withdrawals = action.payload.withdrawals || [];
      state.credits = action.payload.credits || [];
      state.debits = action.payload.debits || [];
    });
    builder.addCase(fetchPartnerWithdrawalsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Transactions
    builder.addCase(fetchPartnerTransactionsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerTransactionsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.transactions = action.payload;
    });
    builder.addCase(fetchPartnerTransactionsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export default partnerSlice.reducer;
