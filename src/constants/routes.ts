export const ROUTES = {
  // Auth & Common
  SPLASH: 'SplashScreen',
  LOGIN: 'LoginScreen',
  OTP_VERIFY: 'OtpVerificationScreen',
  REGISTER: 'RegisterScreen',
  FORGOT_PASSWORD: 'ForgotPasswordScreen',
  ROLE_SELECTION: 'RoleSelectionScreen',

  // Customer Routes 
  CUSTOMER_ROOT: 'CustomerRoot',
  CUSTOMER_TABS: 'CustomerTabs',
  CUSTOMER_DASHBOARD: 'CustomerDashboardScreen',
  APPLY_LOAN: 'ApplyLoanScreen',
  MY_LOAN: 'MyLoanScreen',
  PAYMENT_SCHEDULE: 'PaymentScheduleScreen',
  PAYMENT_HISTORY: 'PaymentHistoryScreen',
  PENDING_AMOUNT: 'PendingAmountScreen',
  OVERDUE_DETAILS: 'OverdueDetailsScreen',
  PENALTY_DETAILS: 'PenaltyDetailsScreen',
  MY_DOCUMENTS: 'MyDocumentsScreen',
  CUSTOMER_NOTIFICATIONS: 'CustomerNotificationsScreen',
  CUSTOMER_PROFILE: 'CustomerProfileScreen',
  MAKE_PAYMENT: 'MakePaymentScreen',

  // Agent Routes
  AGENT_ROOT: 'AgentRoot',
  AGENT_TABS: 'AgentTabs',
  AGENT_DASHBOARD: 'AgentDashboardScreen',
  ASSIGNED_CUSTOMERS: 'AssignedCustomersScreen',
  CUSTOMER_DETAIL_VIEW: 'CustomerDetailViewScreen',
  ADD_COLLECTION: 'AddCollectionScreen',
  COLLECTION_HISTORY: 'CollectionHistoryScreen',
  AGENT_REPORTS: 'AgentReportsScreen',
  AGENT_PROFILE: 'AgentProfileScreen',
  AGENT_NOTIFICATIONS: 'AgentNotificationsScreen',

  // Investor Routes
  INVESTOR_ROOT: 'InvestorRoot',
  INVESTOR_TABS: 'InvestorTabs',
  INVESTOR_DASHBOARD: 'InvestorDashboardScreen',
  MY_INVESTMENT: 'MyInvestmentScreen',
  INVESTOR_PAYMENTS: 'InvestorPaymentsScreen',
  INVESTOR_WALLET: 'InvestorWalletScreen',
  INVESTOR_WITHDRAW: 'InvestorWithdrawScreen',
  INVESTOR_WITHDRAWAL_HISTORY: 'InvestorWithdrawalHistoryScreen',
  INVESTOR_DOCUMENTS: 'InvestorDocumentsScreen',
  INVESTOR_PROFILE: 'InvestorProfileScreen',
  INVESTOR_NOTIFICATIONS: 'InvestorNotificationsScreen',

  // Partner Routes
  PARTNER_ROOT: 'PartnerRoot',
  PARTNER_TABS: 'PartnerTabs',
  PARTNER_DASHBOARD: 'PartnerDashboardScreen',
  MY_PARTNERSHIP: 'MyPartnershipScreen',
  MY_CONTRIBUTION: 'MyContributionScreen',
  MY_EARNINGS: 'MyEarningsScreen',
  PARTNER_EARNINGS_REPORT: 'PartnerEarningsReportScreen',
  PARTNER_WALLET: 'PartnerWalletScreen',
  PARTNER_WITHDRAW: 'PartnerWithdrawScreen',
  PARTNER_WITHDRAWAL_HISTORY: 'PartnerWithdrawalHistoryScreen',
  PARTNER_DOCUMENTS: 'PartnerDocumentsScreen',
  PARTNER_PROFILE: 'PartnerProfileScreen',
  PARTNER_NOTIFICATIONS: 'PartnerNotificationsScreen',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteName = (typeof ROUTES)[RouteKey];
