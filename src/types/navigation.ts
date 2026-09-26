import { NavigatorScreenParams } from '@react-navigation/native';
import { ROUTES } from '../constants/routes';
import { AppRoleType } from '../constants/roles';

export type RootStackParamList = {
  [ROUTES.SPLASH]: undefined;
  [ROUTES.LOGIN]: undefined;
  [ROUTES.OTP_VERIFY]: { phone: string; role?: AppRoleType };
  [ROUTES.CUSTOMER_ROOT]: NavigatorScreenParams<CustomerStackParamList>;
  [ROUTES.AGENT_ROOT]: NavigatorScreenParams<AgentStackParamList>;
  [ROUTES.INVESTOR_ROOT]: NavigatorScreenParams<InvestorStackParamList>;
  [ROUTES.PARTNER_ROOT]: NavigatorScreenParams<PartnerStackParamList>;
};

export type CustomerTabParamList = {
  [ROUTES.CUSTOMER_DASHBOARD]: undefined;
  [ROUTES.MY_LOAN]: undefined;
  [ROUTES.PAYMENT_SCHEDULE]: undefined;
  [ROUTES.CUSTOMER_PROFILE]: undefined;
};

export type CustomerStackParamList = {
  [ROUTES.CUSTOMER_TABS]: NavigatorScreenParams<CustomerTabParamList>;
  [ROUTES.APPLY_LOAN]: undefined;
  [ROUTES.LOAN_PACKAGE_DETAIL]: { pkg: import('./models').LoanPackage };
  [ROUTES.LOAN_DETAILS]: { loanId: number };
  [ROUTES.MY_LOAN]: undefined;
  [ROUTES.PAYMENT_SCHEDULE]: undefined;
  [ROUTES.PAYMENT_HISTORY]: undefined;
  [ROUTES.PENDING_AMOUNT]: undefined;
  [ROUTES.OVERDUE_DETAILS]: undefined;
  [ROUTES.PENALTY_DETAILS]: undefined;
  [ROUTES.MY_DOCUMENTS]: undefined;
  [ROUTES.CUSTOMER_NOTIFICATIONS]: undefined;
  [ROUTES.CUSTOMER_PROFILE]: undefined;
  [ROUTES.CUSTOMER_PROFILE_VIEW]: undefined;
  [ROUTES.HELP_AND_SUPPORT]: undefined;
  [ROUTES.MAKE_PAYMENT]: { amount?: number; title?: string };
};

export type AgentTabParamList = {
  [ROUTES.AGENT_DASHBOARD]: undefined;
  [ROUTES.ASSIGNED_CUSTOMERS]: undefined;
  [ROUTES.COLLECTION_HISTORY]: undefined;
  [ROUTES.AGENT_WALLET]: undefined;
  [ROUTES.AGENT_PROFILE]: undefined;
};

export type AgentStackParamList = {
  [ROUTES.AGENT_TABS]: NavigatorScreenParams<AgentTabParamList>;
  [ROUTES.CUSTOMER_DETAIL_VIEW]: { customerId: string };
  [ROUTES.AGENT_CUSTOMER_PAYMENT_HISTORY]: {
    customerId: string;
    customerName?: string;
  };
  [ROUTES.ADD_COLLECTION]: { customerId?: string; defaultAmount?: number };
  [ROUTES.COLLECTION_HISTORY]: undefined;
  [ROUTES.AGENT_REPORTS]: undefined;
  [ROUTES.AGENT_NOTIFICATIONS]: undefined;
  [ROUTES.AGENT_WALLET]: undefined;
};

export type InvestorTabParamList = {
  [ROUTES.INVESTOR_DASHBOARD]: undefined;
  [ROUTES.MY_INVESTMENT]: undefined;
  [ROUTES.INVESTOR_WALLET]: undefined;
  [ROUTES.INVESTOR_PROFILE]: undefined;
};

export type InvestorStackParamList = {
  [ROUTES.INVESTOR_TABS]: NavigatorScreenParams<InvestorTabParamList>;
  [ROUTES.MY_INVESTMENT]: undefined;
  [ROUTES.INVESTOR_WALLET]: undefined;
  [ROUTES.INVESTOR_WITHDRAW]: undefined;
  [ROUTES.INVESTOR_WITHDRAWAL_HISTORY]: undefined;
  [ROUTES.INVESTOR_DOCUMENTS]: undefined;
  [ROUTES.INVESTOR_NOTIFICATIONS]: undefined;
};

export type PartnerTabParamList = {
  [ROUTES.PARTNER_DASHBOARD]: undefined;
  [ROUTES.MY_EARNINGS]: undefined;
  [ROUTES.PARTNER_WALLET]: undefined;
  [ROUTES.PARTNER_CUSTOMERS]: undefined;
  [ROUTES.PARTNER_EXPENSES]: undefined;
  [ROUTES.PARTNER_PROFILE]: undefined;
};

export type PartnerStackParamList = {
  [ROUTES.PARTNER_TABS]: NavigatorScreenParams<PartnerTabParamList>;
  [ROUTES.MY_PARTNERSHIP]: undefined;
  [ROUTES.MY_CONTRIBUTION]: undefined;
  [ROUTES.MY_EARNINGS]: undefined;
  [ROUTES.PARTNER_EARNINGS_REPORT]: undefined;
  [ROUTES.PARTNER_WALLET]: undefined;
  [ROUTES.PARTNER_WITHDRAW]: undefined;
  [ROUTES.PARTNER_WITHDRAWAL_HISTORY]: undefined;
  [ROUTES.PARTNER_DOCUMENTS]: undefined;
  [ROUTES.PARTNER_NOTIFICATIONS]: undefined;
  [ROUTES.PARTNER_ADD_EXPENSE]: undefined;
  [ROUTES.PARTNER_CUSTOMERS]: undefined;
};
