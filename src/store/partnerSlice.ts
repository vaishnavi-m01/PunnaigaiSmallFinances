import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  PartnerProfile, 
  PartnerContribution, 
  PartnerProfitShare, 
  PartnerSummary,

  PartnershipDetail,
  PartnershipContributionDetail,
  PartnershipEarningDetail,
  PartnershipWithdrawalDetail,
  PartnershipTransactionDetail
} from '../types/models';
import * as partnerApi from '../services/api/partnerApi';
import { logout } from './authSlice';

export interface PartnerState {
  profile: PartnerProfile | null;
  partners: PartnerProfile[];
  partnerships: PartnershipDetail[];
  selectedPartnershipCode: string | null;
  contributions: PartnerContribution[];
  contributionPartnerships: PartnershipContributionDetail[];
  earnings: PartnerProfitShare[];
  earningsPartnerships: PartnershipEarningDetail[];
  withdrawals: any[];
  withdrawalsPartnerships: PartnershipWithdrawalDetail[];
  credits: any[];
  debits: any[];
  transactions: any[];
  transactionsPartnerships: PartnershipTransactionDetail[];
  summary: PartnerSummary;
  isLoading: boolean;
  error: string | null;
}

const initialState: PartnerState = {
  profile: null,
  partners: [],
  partnerships: [],
  selectedPartnershipCode: null,
  contributions: [],
  contributionPartnerships: [],
  earnings: [],
  earningsPartnerships: [],
  withdrawals: [],
  withdrawalsPartnerships: [],
  credits: [],
  debits: [],
  transactions: [],
  transactionsPartnerships: [],
  summary: {
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
  async (partnership_id: number | undefined, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerDashboard(partnership_id);
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

export const fetchPartnerPartnershipsThunk = createAsyncThunk(
  'partner/fetchPartnerships',
  async (_, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerPartnerships();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch partnerships');
    }
  }
);

export const fetchPartnerContributionsThunk = createAsyncThunk(
  'partner/fetchContributions',
  async (params: { from_date?: string, to_date?: string, direction?: string, partnership_id?: number } | undefined, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerContributions(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch contributions');
    }
  }
);

export const fetchPartnerEarningsThunk = createAsyncThunk(
  'partner/fetchEarnings',
  async (params: { from_date?: string, to_date?: string, partnership_id?: number } | undefined, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerEarnings(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch earnings');
    }
  }
);

export const fetchPartnerTransactionsThunk = createAsyncThunk(
  'partner/fetchTransactions',
  async (params: { from_date?: string, to_date?: string, direction?: string, partnership_id?: number } | undefined, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerTransactions(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchPartnerWithdrawalsThunk = createAsyncThunk(
  'partner/fetchWithdrawals',
  async (params: { from_date?: string, to_date?: string, direction?: string, partnership_id?: number } | undefined, { rejectWithValue }) => {
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
    partnership_id?: number | null;
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
  async (payload: { withdrawal_type: 'profit' | 'principal'; amount: number; notes?: string; partnership_id?: number | null }, { rejectWithValue }) => {
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
  reducers: {
    setSelectedPartnershipCode: (state, action: PayloadAction<string | null>) => {
      state.selectedPartnershipCode = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Helper to sort partnerships so the logged in partner is first
    const sortPartnerships = (state: PartnerState) => {
      state.partnerships.sort((a, b) => {
        if (state.profile) {
          if (a.partnership_code === state.profile.par_code) return -1;
          if (b.partnership_code === state.profile.par_code) return 1;
          if (a.partnership_name === state.profile.name) return -1;
          if (b.partnership_name === state.profile.name) return 1;
        }
        if (a.partner_type === 'individual' && b.partner_type !== 'individual') return -1;
        if (b.partner_type === 'individual' && a.partner_type !== 'individual') return 1;
        return 0;
      });
    };
    // Dashboard
    builder.addCase(fetchPartnerDashboardThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerDashboardThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      const payload = action.payload;
      
      // We merge dashboard data for any partnerships returned.
      // Filter list mapping is now handled by fetchPartnerPartnershipsThunk, but if dashboard returns rich data, we merge it safely.
      if (payload.partnerships && payload.partnerships.length > 0) {
        payload.partnerships.forEach((incoming: any) => {
          let index = -1;
          
          // If a specific partnership was requested and the backend returned exactly one, 
          // forcefully merge it into the selected partnership, even if the backend 
          // returned the wrong partnership_code (backend bug workaround).
          if (action.meta.arg !== undefined && payload.partnerships.length === 1 && state.selectedPartnershipCode) {
             index = state.partnerships.findIndex(p => p.partnership_code === state.selectedPartnershipCode);
          } else {
             // Otherwise, safely match by code
             index = state.partnerships.findIndex(p => p.partnership_code === incoming.partnership_code);
          }
          
          if (index !== -1) {
            const targetCode = state.partnerships[index].partnership_code;
            
            state.partnerships[index] = { 
              ...state.partnerships[index], 
              ...incoming,
              // Protect core identifiers from being corrupted by backend
              partnership_code: state.partnerships[index].partnership_code,
              partnership_id: state.partnerships[index].partnership_id
            };
            
            // If this is the currently selected partnership, update the summary at the root
            if (state.selectedPartnershipCode === targetCode && incoming.summary) {
              state.summary = incoming.summary;
            }
          }
        });
      }
      
      // Fallback for unfiltered (if it ever happens)
      if (action.meta.arg === undefined && payload.overall_summary) {
         state.summary = payload.overall_summary;
      }
      
      if (payload.partners) {
        state.partners = payload.partners;
      }
    });
    builder.addCase(fetchPartnerDashboardThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Partnerships API
    builder.addCase(fetchPartnerPartnershipsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerPartnershipsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      const payload = action.payload;
      console.log("✅ Partnerships fetched:", payload.partnerships?.length);
      
      if (payload.partnerships) {
        // Merge instead of replace to prevent wiping out rich dashboard data (like recent_transactions)
        if (state.partnerships.length === 0) {
          state.partnerships = payload.partnerships;
        } else {
          payload.partnerships.forEach((incoming: any) => {
            const index = state.partnerships.findIndex(p => p.partnership_code === incoming.partnership_code);
            if (index !== -1) {
              state.partnerships[index] = { ...state.partnerships[index], ...incoming };
            } else {
              state.partnerships.push(incoming);
            }
          });
        }
        
        // Sort so the logged-in partner is first
        sortPartnerships(state);

        // Auto-select first active partner if none selected or if selected is not in list
        if (state.partnerships.length > 0) {
           const exists = state.partnerships.find((p: any) => p.partnership_code === state.selectedPartnershipCode);
           if (!state.selectedPartnershipCode || !exists) {
             const activeP = state.partnerships.find((p: any) => p.status === 'active') || state.partnerships[0];
             state.selectedPartnershipCode = activeP.partnership_code;
           }
        }
      }
    });
    builder.addCase(fetchPartnerPartnershipsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      console.log("❌ Partnerships fetch failed:", action.payload);
    });
    // Profile
    builder.addCase(fetchPartnerProfileThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPartnerProfileThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.profile = action.payload;
      
      const prevFirst = state.partnerships[0]?.partnership_code;
      sortPartnerships(state);
      
      // If the selected partnership was the old first item (auto-selected), 
      // update it to the new first item after sorting.
      if (state.partnerships.length > 0 && state.selectedPartnershipCode === prevFirst) {
         state.selectedPartnershipCode = state.partnerships[0].partnership_code;
      }
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
      const payload = action.payload;
      state.contributionPartnerships = payload.partnerships || [];
      
      const isFiltered = action.meta.arg !== undefined;
      const selectedP = (isFiltered && payload.partnerships?.length === 1)
        ? payload.partnerships[0]
        : payload.partnerships?.find((p: any) => p.partnership_code === state.selectedPartnershipCode);

      if (selectedP && selectedP.summary) {
        state.summary = { ...state.summary, ...selectedP.summary };
      }

      let allContributions: PartnerContribution[] = [];
      state.contributionPartnerships.forEach(p => {
        if (p.contributions) {
          const effectiveCode = (isFiltered && payload.partnerships?.length === 1) ? state.selectedPartnershipCode : p.partnership_code;
          const enhanced = p.contributions.map((c: any) => ({ ...c, partnership_code: effectiveCode }));
          allContributions = [...allContributions, ...enhanced];
        }
      });
      state.contributions = allContributions;
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
      const payload = action.payload;
      state.earningsPartnerships = payload.partnerships || [];
      const isFiltered = action.meta.arg !== undefined;
      const selectedP = (isFiltered && payload.partnerships?.length === 1)
        ? payload.partnerships[0]
        : payload.partnerships?.find((p: any) => p.partnership_code === state.selectedPartnershipCode);

      if (selectedP && selectedP.summary) {
        state.summary = { ...state.summary, ...selectedP.summary };
      }

      let allEarnings: PartnerProfitShare[] = [];
      state.earningsPartnerships.forEach(p => {
        if (p.earnings) {
          const effectiveCode = (isFiltered && payload.partnerships?.length === 1) ? state.selectedPartnershipCode : p.partnership_code;
          const enhanced = p.earnings.map((e: any) => ({ ...e, partnership_code: effectiveCode }));
          allEarnings = [...allEarnings, ...enhanced];
        }
      });
      state.earnings = allEarnings;
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
      const payload = action.payload;
      
      const isFiltered = action.meta.arg !== undefined;
      const selectedP = (isFiltered && payload.partnerships?.length === 1)
        ? payload.partnerships[0]
        : payload.partnerships?.find((p: any) => p.partnership_code === state.selectedPartnershipCode);

      const newSummary = selectedP?.summary || payload.overall || payload.partnerships?.[0]?.summary;
      if (newSummary) {
        state.summary = { ...state.summary, ...newSummary };
      }
      
      state.withdrawalsPartnerships = payload.partnerships || [];
      
      let allWithdrawals: any[] = [];
      state.withdrawalsPartnerships.forEach(p => {
        if (p.withdrawals) allWithdrawals = [...allWithdrawals, ...p.withdrawals];
      });
      state.withdrawals = allWithdrawals;
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
      const payload = action.payload;
      state.transactionsPartnerships = payload.partnerships || [];
      
      let allTransactions: any[] = [];
      state.transactionsPartnerships.forEach(p => {
        if (p.transactions) allTransactions = [...allTransactions, ...p.transactions];
      });
      state.transactions = allTransactions;
    });
    builder.addCase(fetchPartnerTransactionsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Clear state on logout
    builder.addCase(logout, () => initialState);
  },
});

export const { setSelectedPartnershipCode } = partnerSlice.actions;

export default partnerSlice.reducer;
