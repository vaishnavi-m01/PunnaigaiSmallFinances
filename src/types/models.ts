import { AppRoleType } from '../constants/roles';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: AppRoleType;
  avatarUrl?: string;
  joinDate?: string;
}

export type LoanStatus = 'Active' | 'Pending' | 'Closed' | 'Defaulted';
export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
export type DocumentStatus =
  | 'Verified'
  | 'Pending'
  | 'Rejected'
  | 'Not Uploaded';
export type NotificationType =
  | 'reminder'
  | 'approval'
  | 'document'
  | 'offer'
  | 'welcome'
  | 'system';

export interface CustomerLoan {
  id: string;
  loanId: string; // e.g. PLN000123
  packageName: string; // e.g. Gold Loan
  loanAmount: number; // ₹1,00,000
  amountDisbursed: number; // ₹80,000
  amountReceived: number; // ₹88,000
  tenureMonths: number; // 12
  status: LoanStatus;
  totalRepaymentAmount: number; // ₹1,00,000
  interestRate: number; // 12%
  processingFee: number; // ₹2,000
  pendingAmount: number; // ₹12,000
  nextPaymentDate: string; // 15 Apr 2025
  monthlyEmi: number; // ₹9,000
  startDate?: string;
  endDate?: string;
}

export interface PaymentScheduleItem {
  no: number;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  mode?: 'UPI' | 'Cash' | 'Bank Transfer' | 'Net Banking';
  receiptNo?: string;
  collectedBy?: string;
}

export interface PendingBreakdown {
  totalPendingAmount: number;
  emiAmount: number;
  emiDueDate: string;
  emiStatus: PaymentStatus;
  lateFee: number;
  lateFeeDueDate: string;
  lateFeeStatus: PaymentStatus;
  otherCharges: number;
  otherChargesDueDate: string;
  otherChargesStatus: PaymentStatus;
}

export interface OverdueDetails {
  totalOverdueAmount: number;
  emiPending: number;
  lateFee: number;
  otherCharges: number;
  warningNote: string;
}

export interface PenaltyDetails {
  totalPenalty: number;
  penaltyEnabled: boolean;
  penaltyType: string; // 'Fixed Amount' or 'Percentage'
  penaltyAmount: number;
  penaltyFrequency: string; // 'Monthly'
  gracePeriod: string; // '3 Days'
  isApplied: boolean;
  appliedReason?: string;
}

export interface CustomerDocumentItem {
  id: string;
  category: string;
  title: string;
  status: DocumentStatus;
  uploadDate?: string;
  fileUri?: string;
  adminRemarks?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: NotificationType;
  isRead: boolean;
  createdAt?: string;
}

// Agent Domain
export interface AssignedCustomer {
  id: string;
  name: string;
  phone: string;
  loanId: string;
  pendingAmount: number;
  dueDate: string;
  isOverdue: boolean;
  avatar?: string;
  address?: string;
}

export interface CollectionRecord {
  id: string;
  customerName: string;
  customerId: string;
  loanId: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'UPI' | 'Cheque';
  receiptNumber: string;
  remarks?: string;
}

// Investor Domain
export interface InvestorDetails {
  id: string;
  name: string;
  totalInvestment: number; 
  walletBalance: number;
  totalPaymentsReceived: number; 
  monthlyReturnRate: number; 
  agreementDate: string;
  tenureMonths: number;
}

export interface WalletTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  status: 'Completed' | 'Pending' | 'Rejected';
  referenceNo: string;
  description?: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  requestedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  bankAccount: string;
  ifsc: string;
  payoutDate?: string;
}

// Partner Domain
export interface PartnerProfile {
  id: number;
  user_id: number;
  par_code: string;
  name: string;
  mobile: string;
  email: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  partner_type: string;
  partnership_name: string;
  profit_share_percentage: string;
  principal_withdrawal_permission: number;
  profit_withdrawal_permission: number;
}

export interface PartnerContribution {
  id: number;
  contribution_code: string;
  partner_id: number;
  amount: string;
  contribution_date: string;
  payment_method: string;
  reference_number: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerProfitShare {
  id: number;
  partner_id: number;
  source_type: string;
  source_id: number;
  total_profit: string;
  share_percentage: string;
  share_amount: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerSummary {
  contributions: number;
  earnings: number;
  withdrawals: number;
  available_balance: number;
  available_principal: number;
  available_profit: number;
  pending_withdrawals: number;
}

export interface PartnerTransaction {
  id: number;
  transaction_code: string;
  transaction_type: string;
  reference_type: string;
  reference_id: number;
  direction: 'in' | 'out';
  amount: string;
  description: string;
  transaction_date: string;
  created_by: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerDashboardResponse {
  partner: PartnerProfile & {
    contributions: PartnerContribution[];
    profit_shares: PartnerProfitShare[];
    withdrawals: any[]; // Assuming any for now
  };
  summary: PartnerSummary;
}
export interface LoanPackage {
  id: number;
  name: string;
  minAmount: number; 
  maxAmount: number; 
  deductionPercentage: number;
  repaymentPeriod: number;
  repaymentFrequency: string; 
  dueCalculationType: 'lump_sum' | 'installments';
  installmentCount: number;
  penaltyEnabled?: boolean;
  missedDuesBeforePenalty?: number | null;
  penaltyType?: string | null;
  penaltyAmountOrPercentage?: number | null;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoanRequest {
  id: number;
  customerId: number;
  loanPackageId: number;
  requestedAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminNotes: string | null;
}

export interface DashboardData {
  activeLoan: {
    id: number;
    requestedAmount: number;
    approvedAmount: number;
    repaymentObligation: number;
    dueDate: string;
    status: string;
  } | null;
  finance: {
    id: number;
    financeCode: string;
    totalAmount: number;
    disbursedAmount: number;
    profitAmount: number;
    repaymentAmount: number;
    paidAmount: number;
    outstandingAmount: number;
    status: string;
    startDate: string;
  } | null;
  amountDue: number;
  penalty: number;
  totalDue: number;
  overdueStatus: boolean;
  missedDues: number;
  nextDue: string | null;
  recentTransactions?: {
    paymentId: number;
    financeId: number;
    loanPackageId: number;
    loanPackageName: string;
    amount: number;
    mode: string;
    paidAt: string;
    status: string;
  }[];
}
