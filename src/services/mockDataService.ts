import {
  UserProfile,
  CustomerLoan,
  PaymentScheduleItem,
  PaymentHistoryItem,
  PendingBreakdown,
  OverdueDetails,
  PenaltyDetails,
  CustomerDocumentItem,
  AppNotification,
  AssignedCustomer,
  CollectionRecord,
  InvestorDetails,
  WalletTransaction,
  PartnerDetails,
  PartnerEarningsItem,
} from '../types/models';
import { APP_ROLES, AppRoleType } from '../constants/roles';

export interface RoleCredential {
  role: AppRoleType;
  roleName: string;
  phone: string;
  formattedPhone: string;
  password: string;
  user: UserProfile;
}

export const mockUsers: Record<string, UserProfile> = {
  customer: {
    id: 'USR_CUST_001',
    name: 'Raji Kumar',
    phone: '+91 98765 43210',
    email: 'rajikumar@punnaigai.com',
    role: APP_ROLES.CUSTOMER,
    joinDate: '12 Jan 2024',
  },
  agent: {
    id: 'USR_AGT_002',
    name: 'Karthik Subramanian',
    phone: '+91 98450 11223',
    email: 'karthik.agent@punnaigai.com',
    role: APP_ROLES.AGENT,
    joinDate: '01 Nov 2023',
  },
  investor: {
    id: 'USR_INV_003',
    name: 'Ravi Chandran',
    phone: '+91 94432 99887',
    email: 'ravi.investor@punnaigai.com',
    role: APP_ROLES.INVESTOR,
    joinDate: '15 Aug 2023',
  },
  partnership: {
    id: 'USR_PRT_004',
    name: 'Arun & Kumar Partners',
    phone: '+91 97890 55443',
    email: 'arun.partner@punnaigai.com',
    role: APP_ROLES.PARTNERSHIP,
    joinDate: '01 Jun 2023',
  },
};

export const staticCredentials: Record<string, RoleCredential> = {
  [APP_ROLES.CUSTOMER]: {
    role: APP_ROLES.CUSTOMER,
    roleName: 'Customer',
    phone: '+919876543210',
    formattedPhone: '+91 98765 43210',
    password: 'password',
    user: mockUsers.customer,
  },
  [APP_ROLES.AGENT]: {
    role: APP_ROLES.AGENT,
    roleName: 'Agent',
    phone: '+919845011223',
    formattedPhone: '+91 98450 11223',
    password: 'password',
    user: mockUsers.agent,
  },
  [APP_ROLES.INVESTOR]: {
    role: APP_ROLES.INVESTOR,
    roleName: 'Investor',
    phone: '+919443299887',
    formattedPhone: '+91 94432 99887',
    password: 'password',
    user: mockUsers.investor,
  },
  [APP_ROLES.PARTNERSHIP]: {
    role: APP_ROLES.PARTNERSHIP,
    roleName: 'Partner',
    phone: '+919789055443',
    formattedPhone: '+91 97890 55443',
    password: 'password',
    user: mockUsers.partnership,
  },
};

export const mockCustomerLoan: CustomerLoan = {
  id: 'LN_101',
  loanId: 'PLN000123',
  packageName: 'Gold Loan',
  loanAmount: 100000,
  amountDisbursed: 80000,
  amountReceived: 88000,
  tenureMonths: 12,
  status: 'Active',
  totalRepaymentAmount: 100000,
  interestRate: 12,
  processingFee: 2000,
  pendingAmount: 12000,
  nextPaymentDate: '15 Apr 2025',
  monthlyEmi: 9000,
  startDate: '15 Oct 2024',
  endDate: '15 Oct 2025',
};

export const mockPaymentSchedule: PaymentScheduleItem[] = [
  { no: 1, dueDate: '15 Apr 2025', amount: 9000, status: 'Pending' },
  { no: 2, dueDate: '15 May 2025', amount: 9000, status: 'Pending' },
  { no: 3, dueDate: '15 Jun 2025', amount: 9000, status: 'Pending' },
  { no: 4, dueDate: '15 Jul 2025', amount: 9000, status: 'Pending' },
  { no: 5, dueDate: '15 Aug 2025', amount: 9000, status: 'Pending' },
  { no: 6, dueDate: '15 Sep 2025', amount: 9000, status: 'Pending' },
  { no: 7, dueDate: '15 Oct 2025', amount: 9000, status: 'Pending' },
  { no: 8, dueDate: '15 Nov 2025', amount: 9000, status: 'Pending' },
  { no: 9, dueDate: '15 Dec 2025', amount: 9000, status: 'Pending' },
  { no: 10, dueDate: '15 Jan 2026', amount: 9000, status: 'Pending' },
];

export const mockPaymentHistory: PaymentHistoryItem[] = [
  { id: 'TX_101', date: '15 Mar 2025', amount: 9000, status: 'Paid', mode: 'UPI', receiptNo: 'RCP-2025-0315' },
  { id: 'TX_102', date: '15 Feb 2025', amount: 9000, status: 'Paid', mode: 'Cash', receiptNo: 'RCP-2025-0215' },
  { id: 'TX_103', date: '15 Jan 2025', amount: 9000, status: 'Paid', mode: 'UPI', receiptNo: 'RCP-2025-0115' },
  { id: 'TX_104', date: '15 Dec 2024', amount: 9000, status: 'Paid', mode: 'Bank Transfer', receiptNo: 'RCP-2024-1215' },
  { id: 'TX_105', date: '15 Nov 2024', amount: 9000, status: 'Paid', mode: 'UPI', receiptNo: 'RCP-2024-1115' },
  { id: 'TX_106', date: '15 Oct 2024', amount: 9000, status: 'Paid', mode: 'Cash', receiptNo: 'RCP-2024-1015' },
];

export const mockPendingBreakdown: PendingBreakdown = {
  totalPendingAmount: 12000,
  emiAmount: 9000,
  emiDueDate: '15 Apr 2025',
  emiStatus: 'Pending',
  lateFee: 1000,
  lateFeeDueDate: '15 Apr 2025',
  lateFeeStatus: 'Pending',
  otherCharges: 2000,
  otherChargesDueDate: '20 Apr 2025',
  otherChargesStatus: 'Pending',
};

export const mockOverdueDetails: OverdueDetails = {
  totalOverdueAmount: 12000,
  emiPending: 9000,
  lateFee: 1000,
  otherCharges: 2000,
  warningNote: 'Please pay the overdue amount to avoid penalty charges.',
};

export const mockPenaltyDetails: PenaltyDetails = {
  totalPenalty: 2000,
  penaltyEnabled: true,
  penaltyType: 'Fixed Amount',
  penaltyAmount: 1000,
  penaltyFrequency: 'Monthly',
  gracePeriod: '3 Days',
  isApplied: false,
  appliedReason: 'You are currently not eligible for any penalty.',
};

export const mockCustomerDocuments: CustomerDocumentItem[] = [
  { id: 'DOC_01', category: 'Identity', title: 'Identity Proof', status: 'Verified', uploadDate: '10 Oct 2024' },
  { id: 'DOC_02', category: 'Address', title: 'Address Proof', status: 'Verified', uploadDate: '10 Oct 2024' },
  { id: 'DOC_03', category: 'Income', title: 'Income Proof', status: 'Pending', uploadDate: '14 Oct 2024' },
  { id: 'DOC_04', category: 'Employment', title: 'Employment Proof', status: 'Verified', uploadDate: '11 Oct 2024' },
  { id: 'DOC_05', category: 'Property', title: 'Property Documents', status: 'Not Uploaded' },
  { id: 'DOC_06', category: 'Other', title: 'Other Documents', status: 'Not Uploaded' },
];

export const mockNotifications: AppNotification[] = [
  {
    id: 'NT_01',
    title: 'Payment Reminder',
    message: 'Your EMI is due on 15 Apr 2025',
    timeAgo: '2h ago',
    type: 'reminder',
    isRead: false,
  },
  {
    id: 'NT_02',
    title: 'Loan Approved',
    message: 'Your loan application has been approved',
    timeAgo: '1d ago',
    type: 'approval',
    isRead: false,
  },
  {
    id: 'NT_03',
    title: 'Document Verified',
    message: 'Your documents have been verified.',
    timeAgo: '2d ago',
    type: 'document',
    isRead: true,
  },
  {
    id: 'NT_04',
    title: 'New Offer',
    message: 'Special loan offers available for you.',
    timeAgo: '3d ago',
    type: 'offer',
    isRead: true,
  },
  {
    id: 'NT_05',
    title: 'Welcome',
    message: 'Thank you for joining Punnaigai Finances!',
    timeAgo: '5d ago',
    type: 'welcome',
    isRead: true,
  },
];

// Agent Mock Data
export const mockAssignedCustomers: AssignedCustomer[] = [
  {
    id: 'USR_CUST_001',
    name: 'Raji Kumar',
    phone: '+91 98765 43210',
    loanId: 'PLN000123',
    pendingAmount: 12000,
    dueDate: '15 Apr 2025',
    isOverdue: true,
    address: 'No 45, Gandhi Road, Salem',
  },
  {
    id: 'USR_CUST_002',
    name: 'Anbu Selvan',
    phone: '+91 94421 88765',
    loanId: 'PLN000188',
    pendingAmount: 9000,
    dueDate: '18 Apr 2025',
    isOverdue: false,
    address: '12 Temple St, Salem',
  },
  {
    id: 'USR_CUST_003',
    name: 'Priya R',
    phone: '+91 99432 11098',
    loanId: 'PLN000204',
    pendingAmount: 5000,
    dueDate: '20 Apr 2025',
    isOverdue: false,
    address: '88 Market View, Omalur',
  },
];

export const mockCollections: CollectionRecord[] = [
  {
    id: 'COL_01',
    customerName: 'Anbu Selvan',
    customerId: 'USR_CUST_002',
    loanId: 'PLN000188',
    amount: 9000,
    date: 'Today, 10:30 AM',
    paymentMethod: 'UPI',
    receiptNumber: 'REC-2025-0041',
  },
  {
    id: 'COL_02',
    customerName: 'Priya R',
    customerId: 'USR_CUST_003',
    loanId: 'PLN000204',
    amount: 5000,
    date: 'Today, 11:45 AM',
    paymentMethod: 'Cash',
    receiptNumber: 'REC-2025-0042',
  },
];

// Investor Mock Data
export const mockInvestorDetails: InvestorDetails = {
  id: 'USR_INV_003',
  name: 'Ravi Chandran',
  totalInvestment: 500000,
  walletBalance: 30000,
  totalPaymentsReceived: 30000,
  monthlyReturnRate: 2,
  agreementDate: '15 Aug 2023',
  tenureMonths: 24,
};

export const mockInvestorTransactions: WalletTransaction[] = [
  { id: 'WT_01', title: 'March Monthly Return', amount: 10000, type: 'credit', date: '31 Mar 2025', status: 'Completed', referenceNo: 'INV-PAY-0325' },
  { id: 'WT_02', title: 'February Monthly Return', amount: 10000, type: 'credit', date: '28 Feb 2025', status: 'Completed', referenceNo: 'INV-PAY-0225' },
  { id: 'WT_03', title: 'January Monthly Return', amount: 10000, type: 'credit', date: '31 Jan 2025', status: 'Completed', referenceNo: 'INV-PAY-0125' },
];

// Partner Mock Data
export const mockPartnerDetails: PartnerDetails = {
  id: 'USR_PRT_004',
  name: 'Arun & Kumar Partners',
  totalContribution: 500000,
  totalEarnings: 55000,
  walletBalance: 35000,
  profitSharePercentage: 25,
  partnershipAgreementDate: '01 Jun 2023',
};

export const mockPartnerEarnings: PartnerEarningsItem[] = [
  { month: 'February 2025', amount: 30000, status: 'Credited', date: '01 Mar 2025' },
  { month: 'January 2025', amount: 25000, status: 'Credited', date: '01 Feb 2025' },
];
