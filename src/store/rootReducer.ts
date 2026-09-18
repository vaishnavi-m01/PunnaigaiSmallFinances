import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import customerReducer from './customerSlice';
import agentReducer from './agentSlice';
import investorReducer from './investorSlice';
import partnerReducer from './partnerSlice';
import toastReducer from './toastSlice';
import globalErrorReducer from './globalErrorSlice';
import expenseReducer from './expenseSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  agent: agentReducer,
  investor: investorReducer,
  partner: partnerReducer,
  toast: toastReducer,
  globalError: globalErrorReducer,
  expense: expenseReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
