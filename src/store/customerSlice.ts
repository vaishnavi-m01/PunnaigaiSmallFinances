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
  overdueData: import('../types/models').OverdueResponse | null;
  isOverdueLoading: boolean;
  unreadNotificationCount: number;
}

const initialState: CustomerState = {
  loan: {
    id: '', loanId: '', packageName: '', loanAmount: 0, amountDisbursed: 0, amountReceived: 0, tenureMonths: 0, status: 'Pending', totalRepaymentAmount: 0, interestRate: 0, processingFee: 0, pendingAmount: 0, nextPaymentDate: '', monthlyEmi: 0
  },
  paymentSchedule: [],
  paymentHistory: [],
  pendingBreakdown: {
    totalPendingAmount: 0, emiAmount: 0, emiDueDate: '', emiStatus: 'Pending', lateFee: 0, lateFeeDueDate: '', lateFeeStatus: 'Pending', otherCharges: 0, otherChargesDueDate: '', otherChargesStatus: 'Pending'
  },
  overdueDetails: {
    totalOverdueAmount: 0, emiPending: 0, lateFee: 0, otherCharges: 0, warningNote: ''
  },
  penaltyDetails: {
    totalPenalty: 0, penaltyEnabled: false, penaltyType: '', penaltyAmount: 0, penaltyFrequency: '', gracePeriod: '', isApplied: false
  },
  documents: [],
  notifications: [],
  isLoading: false,
  loanPackages: [],
  loanRequests: [],
  dashboardData: null,
  isDashboardLoading: false,
  isPackagesLoading: false,
  isSubmittingLoan: false,
  overdueData: null,
  isOverdueLoading: false,
  unreadNotificationCount: 0,
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
        finance: data.finance
          ? {
              id: data.finance.id,
              financeCode: data.finance.finance_code,
              totalAmount: parseFloat(data.finance.total_amount),
              disbursedAmount: parseFloat(data.finance.disbursed_amount),
              profitAmount: parseFloat(data.finance.profit_amount),
              repaymentAmount: parseFloat(data.finance.repayment_amount),
              paidAmount: parseFloat(data.finance.paid_amount),
              outstandingAmount: parseFloat(data.finance.outstanding_amount),
              status: data.finance.status,
              startDate: data.finance.start_date,
            }
          : null,
        amountDue: data.amount_due,
        penalty: data.penalty,
        totalDue: data.total_due,
        overdueStatus: data.overdue_status,
        missedDues: data.missed_dues,
        nextDue: data.next_due,
        recentTransactions: data.recent_transactions?.map((t: any) => ({
          paymentId: t.payment_id,
          financeId: t.finance_id,
          loanPackageId: t.loan_package_id,
          loanPackageName: t.loan_package_name,
          amount: t.amount,
          mode: t.mode,
          paidAt: t.paid_at,
          status: t.status,
        })) || [],
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

/**
 * GET /overdue
 * Fetches overdue schedules for the customer.
 */
export const fetchOverdueThunk = createAsyncThunk(
  'customer/fetchOverdue',
  async (_, { rejectWithValue }) => {
    try {
      const res = await customerApi.getOverdue();
      const mapped: import('../types/models').OverdueResponse = {
        count: res.data.count,
        totalDue: res.data.total_due,
        overdue: res.data.overdue.map((item: any) => ({
          scheduleId: item.schedule_id,
          dueDate: item.due_date,
          amount: item.amount,
          paidAmount: item.paid_amount,
          balance: item.balance,
          penalty: item.penalty,
          totalDue: item.total_due,
          status: item.status,
          loanPackageName: item.loan_package_name,
        })),
      };
      return mapped;
    } catch {
      return rejectWithValue('Failed to fetch overdue data');
    }
  }
);

/**
 * GET /notifications
 * Fetches all notifications from the real API.
 */
export const fetchNotificationsThunk = createAsyncThunk(
  'customer/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await customerApi.getNotifications();
      const now = Date.now();
      return res.data.notifications.map((n, i) => ({
        id: `notif_${n.id}`,
        numericId: n.id,
        title: n.title,
        message: n.message,
        type: mapNotifType(n.type),
        isRead: n.read,
        timeAgo: formatTimeAgo(n.created_at),
        createdAt: n.created_at,
        readAt: n.read_at,
        payload: n.data,
      })) as import('../types/models').AppNotification[];
    } catch {
      return rejectWithValue('Failed to fetch notifications');
    }
  }
);

/**
 * PATCH /notifications/:id/read
 */
export const markNotificationReadThunk = createAsyncThunk(
  'customer/markNotificationRead',
  async (numericId: number, { rejectWithValue }) => {
    try {
      await customerApi.markNotificationReadApi(numericId);
      return numericId;
    } catch {
      return rejectWithValue('Failed to mark notification as read');
    }
  }
);

/**
 * POST /notifications/read-all
 */
export const markAllNotificationsReadThunk = createAsyncThunk(
  'customer/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await customerApi.markAllNotificationsReadApi();
    } catch {
      return rejectWithValue('Failed to mark all notifications as read');
    }
  }
);

/**
 * GET /notifications/unreadcount
 */
export const fetchUnreadCountThunk = createAsyncThunk(
  'customer/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await customerApi.getNotificationUnreadCount();
      return res.data.unread_count;
    } catch {
      return rejectWithValue('Failed to fetch unread count');
    }
  }
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapNotifType(apiType: string): import('../types/models').NotificationType {
  if (apiType.includes('overdue') || apiType.includes('reminder')) return 'reminder';
  if (apiType.includes('approval') || apiType.includes('approved')) return 'approval';
  if (apiType.includes('document')) return 'document';
  if (apiType.includes('offer')) return 'offer';
  return 'system';
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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
        numericId: 0,
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
      // Optimistic local update; API call happens in markNotificationReadThunk
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif) notif.isRead = true;
    },
    markAllNotificationsAsRead: state => {
      // Optimistic local update; API call happens in markAllNotificationsReadThunk
      state.notifications.forEach(n => { n.isRead = true; });
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

    // ── fetchOverdueThunk ──
    builder.addCase(fetchOverdueThunk.pending, state => {
      state.isOverdueLoading = true;
    });
    builder.addCase(fetchOverdueThunk.fulfilled, (state, action) => {
      state.isOverdueLoading = false;
      state.overdueData = action.payload;
      
      // Sync total overdue to the old overdueDetails just in case it's used elsewhere
      state.overdueDetails.totalOverdueAmount = action.payload.totalDue;
    });
    builder.addCase(fetchOverdueThunk.rejected, state => {
      state.isOverdueLoading = false;
    });

    // ── fetchNotificationsThunk ──
    builder.addCase(fetchNotificationsThunk.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload;
      state.unreadNotificationCount = action.payload.filter(n => !n.isRead).length;
    });
    builder.addCase(fetchNotificationsThunk.rejected, state => {
      state.isLoading = false;
    });

    // ── fetchUnreadCountThunk ──
    builder.addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
      state.unreadNotificationCount = action.payload;
    });

    // ── markNotificationReadThunk ── (optimistic already done in reducer)
    builder.addCase(markNotificationReadThunk.fulfilled, (state, action) => {
      const numericId = action.payload;
      const notif = state.notifications.find(n => n.numericId === numericId);
      if (notif) notif.isRead = true;
    });

    // ── markAllNotificationsReadThunk ──
    builder.addCase(markAllNotificationsReadThunk.fulfilled, state => {
      state.notifications.forEach(n => { n.isRead = true; });
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
