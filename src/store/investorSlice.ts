import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InvestorDetails, WalletTransaction, WithdrawalRequest } from '../types/models';
import { mockInvestorDetails, mockInvestorTransactions } from '../services/mockDataService';

export interface InvestorState {
  details: InvestorDetails;
  transactions: WalletTransaction[];
  withdrawals: WithdrawalRequest[];
  isLoading: boolean;
}

const initialState: InvestorState = {
  details: { ...mockInvestorDetails },
  transactions: [...mockInvestorTransactions],
  withdrawals: [
    {
      id: 'WD_01',
      amount: 10000,
      requestedDate: '15 Jan 2025',
      status: 'Completed',
      bankAccount: '•••• •••• 4390',
      ifsc: 'HDFC0001234',
      payoutDate: '16 Jan 2025',
    },
  ],
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
