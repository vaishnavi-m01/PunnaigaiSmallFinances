import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  CustomerLoan,
  PaymentScheduleItem,
  PaymentHistoryItem,
  PendingBreakdown,
  OverdueDetails,
  PenaltyDetails,
  CustomerDocumentItem,
  AppNotification,
  LoanPackage,
  LoanRequest,
  DashboardData,
} from '../types/models';
import {
  mockCustomerLoan,
  mockPaymentSchedule,
  mockPaymentHistory,
  mockPendingBreakdown,
  mockOverdueDetails,
  mockPenaltyDetails,
  mockCustomerDocuments,
  mockNotifications,
} from '../services/mockDataService';
import * as customerApi from '../services/api/customerApi';

export interface CustomerState {
  loan: CustomerLoan;
  paymentSchedule: PaymentScheduleItem[];
  paymentHistory: PaymentHistoryItem[];
  pendingBreakdown: PendingBreakdown;
  overdueDetails: OverdueDetails;
  penaltyDetails: PenaltyDetails;
  documents: CustomerDocumentItem[];
  notifications: AppNotification[];
  isLoading: boolean;
  // API state
  loanPackages: LoanPackage[];
  loanRequests: LoanRequest[];
  dashboardData: DashboardData | null;
  isDashboardLoading: boolean;
  isPackagesLoading: boolean;
  isSubmittingLoan: boolean;
}

const initialState: CustomerState = {
  loan: { ...mockCustomerLoan },
  paymentSchedule: [...mockPaymentSchedule],
  paymentHistory: [...mockPaymentHistory],
  pendingBreakdown: { ...mockPendingBreakdown },
  overdueDetails: { ...mockOverdueDetails },
  penaltyDetails: { ...mockPenaltyDetails },
  documents: [...mockCustomerDocuments],
  notifications: [...mockNotifications],
  isLoading: false,
  loanPackages: [],
  loanRequests: [],
  dashboardData: null,
  isDashboardLoading: false,
  isPackagesLoading: false,
  isSubmittingLoan: false,
};

// ─── ASYNC THUNKS ────────────────────────────────────────────────────────────

/**
 * GET /dashboard
 * Fetches active loan info, amount due, penalty, overdue status.
 */
export const fetchDashboardThunk = createAsyncThunk(
  'customer/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await customerApi.getDashboard();

      // Map snake_case API → camelCase store
      const mapped: DashboardData = {
        activeLoan: data.active_loan
          ? {
              id: data.active_loan.id,
              requestedAmount: parseFloat(data.active_loan.requested_amount),
              approvedAmount: parseFloat(data.active_loan.approved_amount),
              repaymentObligation: parseFloat(data.active_loan.repayment_obligation),
              dueDate: data.active_loan.due_date,
              status: data.active_loan.status,
            }
          : null,
        amountDue: data.amount_due,
        penalty: data.penalty,
        overdueStatus: data.overdue_status,
      };

      return mapped;
    } catch (error: any) {
      console.error('[fetchDashboardThunk] error:', error?.response?.data);
      return rejectWithValue('Failed to load dashboard data');
    }
  }
);

/**
 * GET /loan-packages
 * Fetches all active loan packages from API.
 */
export const fetchLoanPackagesThunk = createAsyncThunk(
  'customer/fetchLoanPackages',
  async (_, { rejectWithValue }) => {
    try {
      const packages = await customerApi.getLoanPackages();

      // Map API response → app LoanPackage type
      const mapped: LoanPackage[] = packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        minAmount: parseFloat(pkg.min_amount),
        maxAmount: parseFloat(pkg.max_amount),
        deductionPercentage: parseFloat(pkg.deduction_percentage),
        repaymentPeriod: pkg.repayment_period,
        repaymentFrequency: pkg.repayment_frequency,
        dueCalculationType: pkg.due_calculation_type,
        installmentCount: pkg.installment_count,
      }));

      return mapped;
    } catch (error: any) {
      console.error('[fetchLoanPackagesThunk] error:', error?.response?.data);
      return rejectWithValue('Failed to load loan packages');
    }
  }
);

/**
 * POST /loan-request
 * Submits a loan application.
 */
export const submitLoanRequestThunk = createAsyncThunk(
  'customer/submitLoanRequest',
  async (payload: { loan_package_id: number; requested_amount: number }, { rejectWithValue }) => {
    try {
      const result = await customerApi.submitLoanRequest(payload);

      const mapped: LoanRequest = {
        id: result.id,
        customerId: result.customer_id,
        loanPackageId: result.loan_package_id,
        requestedAmount: parseFloat(result.requested_amount),
        status: result.status as 'Pending' | 'Approved' | 'Rejected',
        adminNotes: result.admin_notes,
      };

      return mapped;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        'Failed to submit loan request';
      return rejectWithValue(message);
    }
  }
);

/**
 * GET /loan-requests
 * Fetches all loan request history.
 */
export const fetchLoanRequestsThunk = createAsyncThunk(
  'customer/fetchLoanRequests',
  async (_, { rejectWithValue }) => {
    try {
      const requests = await customerApi.getLoanRequests();
      return requests.map(r => ({
        id: r.id,
        customerId: r.customer_id,
        loanPackageId: r.loan_package_id,
        requestedAmount: parseFloat(r.requested_amount),
        status: r.status as 'Pending' | 'Approved' | 'Rejected',
        adminNotes: r.admin_notes,
      })) as LoanRequest[];
    } catch {
      return rejectWithValue('Failed to fetch loan requests');
    }
  }
);

// ─── SLICE ───────────────────────────────────────────────────────────────────

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    makePayment: (state, action: PayloadAction<{ amount: number; paymentMode?: string }>) => {
      const amount = action.payload.amount;
      const mode = (action.payload.paymentMode || 'UPI') as any;

      state.loan.pendingAmount = Math.max(0, state.loan.pendingAmount - amount);
      state.pendingBreakdown.totalPendingAmount = Math.max(
        0,
        state.pendingBreakdown.totalPendingAmount - amount
      );
      state.overdueDetails.totalOverdueAmount = Math.max(
        0,
        state.overdueDetails.totalOverdueAmount - amount
      );

      const newHistoryItem: PaymentHistoryItem = {
        id: `TX_${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        amount,
        status: 'Paid',
        mode,
        receiptNo: `RCP-${Date.now().toString().slice(-6)}`,
      };
      state.paymentHistory.unshift(newHistoryItem);

      const firstPendingIndex = state.paymentSchedule.findIndex(s => s.status === 'Pending');
      if (firstPendingIndex >= 0) {
        state.paymentSchedule[firstPendingIndex].status = 'Paid';
      }

      state.notifications.unshift({
        id: `NT_${Date.now()}`,
        title: 'Payment Successful',
        message: `₹ ${amount.toLocaleString('en-IN')} payment received successfully.`,
        timeAgo: 'Just now',
        type: 'approval',
        isRead: false,
      });
    },
    uploadDocument: (state, action: PayloadAction<{ docId: string; fileUri?: string }>) => {
      const doc = state.documents.find(d => d.id === action.payload.docId);
      if (doc) {
        doc.status = 'Pending';
        doc.uploadDate = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        doc.fileUri = action.payload.fileUri || 'uploaded_proof.jpg';
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) notif.isRead = true;
    },
    markAllNotificationsAsRead: state => {
      state.notifications.forEach(n => {
        n.isRead = true;
      });
    },
  },
  extraReducers: builder => {
    // ── fetchDashboardThunk ──
    builder.addCase(fetchDashboardThunk.pending, state => {
      state.isDashboardLoading = true;
    });
    builder.addCase(fetchDashboardThunk.fulfilled, (state, action) => {
      state.isDashboardLoading = false;
      state.dashboardData = action.payload;

      // Sync live dashboard data into loan state
      if (action.payload.activeLoan) {
        state.loan.loanAmount = action.payload.activeLoan.requestedAmount;
        state.loan.amountDisbursed = action.payload.activeLoan.approvedAmount;
        state.loan.totalRepaymentAmount = action.payload.activeLoan.repaymentObligation;
        state.loan.status = action.payload.activeLoan.status as any;
        state.loan.nextPaymentDate = action.payload.activeLoan.dueDate;
        state.loan.pendingAmount = action.payload.amountDue;
      }
      if (action.payload.overdueStatus) {
        state.overdueDetails.totalOverdueAmount = action.payload.amountDue;
      }
    });
    builder.addCase(fetchDashboardThunk.rejected, state => {
      state.isDashboardLoading = false;
    });

    // ── fetchLoanPackagesThunk ──
    builder.addCase(fetchLoanPackagesThunk.pending, state => {
      state.isPackagesLoading = true;
    });
    builder.addCase(fetchLoanPackagesThunk.fulfilled, (state, action) => {
      state.isPackagesLoading = false;
      state.loanPackages = action.payload;
    });
    builder.addCase(fetchLoanPackagesThunk.rejected, state => {
      state.isPackagesLoading = false;
    });

    // ── submitLoanRequestThunk ──
    builder.addCase(submitLoanRequestThunk.pending, state => {
      state.isSubmittingLoan = true;
    });
    builder.addCase(submitLoanRequestThunk.fulfilled, (state, action) => {
      state.isSubmittingLoan = false;
      state.loanRequests.unshift(action.payload);
    });
    builder.addCase(submitLoanRequestThunk.rejected, state => {
      state.isSubmittingLoan = false;
    });

    // ── fetchLoanRequestsThunk ──
    builder.addCase(fetchLoanRequestsThunk.fulfilled, (state, action) => {
      state.loanRequests = action.payload;
    });
  },
});

export const {
  makePayment,
  uploadDocument,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = customerSlice.actions;

export default customerSlice.reducer;
