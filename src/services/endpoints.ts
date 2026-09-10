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
    LOAN_DETAIL: (id: number) => `/loan/${id}`,
  },
  AGENT: {
    ASSIGNED_CUSTOMERS: '/agent/assigned-customers',
    COLLECTIONS: '/agent/collections',
  },
} as const;
