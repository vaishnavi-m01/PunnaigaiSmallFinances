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
  overallTotals: { total_collection: number; total_profit: number } | null;
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
  overallTotals: null,
  isLoading: false,
  error: null,
};

export const fetchPartnerDashboardThunk = createAsyncThunk(
  'partner/fetchDashboard',
  async (params: { partnership_id?: number; from_date?: string; to_date?: string } | undefined, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerDashboard(params);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchPartnerOverallProfitCollectionThunk = createAsyncThunk(
  'partner/fetchOverallProfitCollection',
  async (params: any | undefined, { rejectWithValue }) => {
    try {
      return await partnerApi.getPartnerOverallProfitCollection(params);
    } catch (error: any) {
      console.log('API FETCH ERROR:', error);
      console.log('API RESPONSE ERROR DATA:', error?.response?.data);
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch overall totals');
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
  async (payload: { amount: number; notes?: string; partnership_id?: number | null }, { rejectWithValue }) => {
    try {
      return await partnerApi.requestPartnerWithdrawal(payload);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to request withdrawal');
    }
  }
);

export const deletePartnerTransactionThunk = createAsyncThunk(
  'partner/deleteTransaction',
  async (payload: { transaction_id: number }, { rejectWithValue }) => {
    try {
      return await partnerApi.deleteTransaction(payload);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete transaction');
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

      // Initialize base summary with current state
      let baseSummary = { ...state.summary };

      // Grab root level stats (sometimes backend sends them outside overall_summary)
      if (payload.total_collection !== undefined) baseSummary.total_collection = payload.total_collection;
      if (payload.total_profit !== undefined) baseSummary.total_profit = payload.total_profit;
      if (payload.company_profit !== undefined) baseSummary.company_profit = payload.company_profit;

      // Merge overall_summary if available
      if (payload.overall_summary) {
        baseSummary = { ...baseSummary, ...payload.overall_summary };
      }

      // We merge dashboard data for any partnerships returned.
      if (payload.partnerships && payload.partnerships.length > 0) {
        payload.partnerships.forEach((incoming: any) => {
          let index = -1;

          if (action.meta.arg?.partnership_id !== undefined && payload.partnerships.length === 1 && state.selectedPartnershipCode) {
            index = state.partnerships.findIndex(p => p.partnership_code === state.selectedPartnershipCode);
          } else {
            index = state.partnerships.findIndex(p => p.partnership_code === incoming.partnership_code);
          }

          if (index !== -1) {
            const targetCode = state.partnerships[index].partnership_code;

            state.partnerships[index] = {
              ...state.partnerships[index],
              ...incoming,
              partnership_code: state.partnerships[index].partnership_code,
              partnership_id: state.partnerships[index].partnership_id
            };

            // If this is the currently selected partnership, update the summary with its specific stats
            if (state.selectedPartnershipCode === targetCode && incoming.summary) {
              baseSummary = { ...baseSummary, ...incoming.summary };
            }
          }
        });
      }

      // Apply the fully merged summary back to state
      state.summary = baseSummary;

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

        // Only reset if the selected code is no longer in the list (e.g. they lost access)
        if (state.partnerships.length > 0 && state.selectedPartnershipCode) {
          const exists = state.partnerships.find((p: any) => p.partnership_code === state.selectedPartnershipCode);
          if (!exists) {
            state.selectedPartnershipCode = null;
          }
        }
      }
    });
    builder.addCase(fetchPartnerPartnershipsThunk.rejected, (state, action) => {
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

      const isFiltered = action.meta.arg !== undefined;
      const selectedP = (isFiltered && payload.partnerships?.length === 1)
        ? payload.partnerships[0]
        : payload.partnerships?.find((p: any) => p.partnership_code === state.selectedPartnershipCode);

      const newSummary = selectedP?.summary || payload.overall || payload.partnerships?.[0]?.summary;
      if (newSummary) {
        state.summary = { ...state.summary, ...newSummary };
      }

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

    // Overall Totals
    builder.addCase(fetchPartnerOverallProfitCollectionThunk.pending, (state) => {
      console.log('OVERALL_PROFIT_COLLECTION PENDING');
    });
    builder.addCase(fetchPartnerOverallProfitCollectionThunk.fulfilled, (state, action) => {
      console.log('OVERALL_PROFIT_COLLECTION FULFILLED:', action.payload);
      state.overallTotals = {
        total_collection: action.payload.total_collection ?? 0,
        total_profit: action.payload.total_profit ?? 0
      };
    });
    builder.addCase(fetchPartnerOverallProfitCollectionThunk.rejected, (state, action) => {
      console.log('OVERALL_PROFIT_COLLECTION REJECTED:', action.payload);
    });
  },
});

export const { setSelectedPartnershipCode } = partnerSlice.actions;

export default partnerSlice.reducer;
