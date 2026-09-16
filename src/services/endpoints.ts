export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    PROFILE: '/profile',
    PROFILE_UPDATE: '/profile',
  },
  CUSTOMER: {
    DASHBOARD: '/dashboard',
    LOAN_PACKAGES: '/loan-packages',
    LOAN_REQUEST: '/loan-request',
    LOAN_REQUESTS: '/loan-requests',
    LOAN_DETAIL: (id: number) => `/loanPackageDetail/${id}`,
  },
  AGENT: {
    ASSIGNED_CUSTOMERS: '/agent/assigned-customers',
    COLLECTIONS: '/agent/collections/store',
    COLLECTION_STATUS: (id: string | number) => `/agent/collections/${id}/status`,
  },
  PARTNER: {
    DASHBOARD: '/partner/dashboard',
    PROFILE: '/partner/profile',
    WALLET: '/partner/wallet',
    EARNINGS: '/partner/earnings',
    CONTRIBUTIONS: '/partner/contributions',
    TRANSACTIONS: '/partner/transactions',
    WITHDRAWALS: '/partner/withdrawals',
  },
} as const;
