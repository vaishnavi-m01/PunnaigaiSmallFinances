import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InvestorDetails, WalletTransaction, WithdrawalRequest } from '../types/models';

export interface InvestorState {
  details: InvestorDetails;
  transactions: WalletTransaction[];
  withdrawals: WithdrawalRequest[];
  isLoading: boolean;
}

const initialState: InvestorState = {
  details: {
    id: '', name: '', totalInvestment: 0, walletBalance: 0, totalPaymentsReceived: 0, monthlyReturnRate: 0, agreementDate: '', tenureMonths: 0
  },
  transactions: [],
  withdrawals: [],
  isLoading: false,
};

export const investorSlice = createSlice({
  name: 'investor',
  initialState,
  reducers: {
    requestWithdrawal: (
      state,
      action: PayloadAction<{
        amount: number;
        bankAccount: string;
        ifsc: string;
      }>
    ) => {
      const { amount, bankAccount, ifsc } = action.payload;

      // Validate available balance (Rule 6: Wallet balance cannot become negative)
      if (amount <= state.details.walletBalance) {
        state.details.walletBalance -= amount;

        const newWithdrawal: WithdrawalRequest = {
          id: `WD_${Date.now()}`,
          amount,
          requestedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Pending',
          bankAccount,
          ifsc,
        };
        state.withdrawals.unshift(newWithdrawal);

        const newTx: WalletTransaction = {
          id: `TX_WD_${Date.now()}`,
          title: 'Wallet Withdrawal Request',
          amount,
          type: 'debit',
          date: 'Today',
          status: 'Pending',
          referenceNo: `WDR-${Date.now().toString().slice(-6)}`,
        };
        state.transactions.unshift(newTx);
      }
    },
  },
});

export const { requestWithdrawal } = investorSlice.actions;
export default investorSlice.reducer;
