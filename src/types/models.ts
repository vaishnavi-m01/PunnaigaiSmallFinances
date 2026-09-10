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
export type DocumentStatus = 'Verified' | 'Pending' | 'Rejected' | 'Not Uploaded';
export type NotificationType = 'reminder' | 'approval' | 'document' | 'offer' | 'welcome' | 'system';

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
  totalInvestment: number; // ₹5,00,000
  walletBalance: number; // ₹30,000 (separate from investment!)
  totalPaymentsReceived: number; // ₹30,000
  monthlyReturnRate: number; // 2% / ₹10,000/mo
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
export interface PartnerDetails {
  id: string;
  name: string;
  totalContribution: number; // ₹5,00,000 (separate from wallet!)
  totalEarnings: number; // ₹55,000
  walletBalance: number; // ₹35,000
  profitSharePercentage: number; // 25%
  partnershipAgreementDate: string;
}

export interface PartnerEarningsItem {
  month: string;
  amount: number;
  status: 'Credited' | 'Pending';
  date: string;
}

// ─── API-mapped Types ────────────────────────────────────────────────────────

export interface LoanPackage {
  id: number;
  name: string;
  minAmount: number;      // parsed from min_amount
  maxAmount: number;      // parsed from max_amount
  deductionPercentage: number;
  repaymentPeriod: number;
  repaymentFrequency: string;  // 'Months' | 'Weeks' | 'Days'
  dueCalculationType: 'lump_sum' | 'installments';
  installmentCount: number;
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
  amountDue: number;
  penalty: number;
  overdueStatus: boolean;
}
