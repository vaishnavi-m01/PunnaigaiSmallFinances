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
    NOTIFICATIONS: '/notifications',
    NOTIFICATION_UNREAD_COUNT: '/notifications/unreadcount',
    NOTIFICATION_READ: (id: number | string) => `/notifications/${id}/read`,
    NOTIFICATIONS_READ_ALL: '/notifications/read-all',
    OVERDUE: '/overdue',
  },
  AGENT: {
    ASSIGNED_CUSTOMERS: '/agent/assigned-customers',
    COLLECTIONS: '/collections',
    COLLECTION_STATUS: (id: string | number) =>
      `/agent/collections/${id}/status`,
  },
  PARTNER: {
    PROFILE: '/partner/profile',
    DASHBOARD: '/partner/dashboard',
    PARTNERSHIP: '/partner/partnership',
    WALLET: '/partner/wallet',
    EARNINGS: '/partner/earnings',
    CONTRIBUTIONS: '/partner/contributions',
    TRANSACTIONS: '/partner/transactions',
    WITHDRAWALS: '/partner/withdrawals',
  },
  EXPENSES: {
    BASE: '/expenses',
    CATEGORIES: '/expenses/categories',
    BY_ID: (id: string | number) => `/expenses/${id}`,
  },
} as const;
