import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PartnerDetails, PartnerEarningsItem, WithdrawalRequest } from '../types/models';
import { mockPartnerDetails, mockPartnerEarnings } from '../services/mockDataService';

export interface PartnerState {
  details: PartnerDetails;
  earnings: PartnerEarningsItem[];
  withdrawals: WithdrawalRequest[];
  isLoading: boolean;
}

const initialState: PartnerState = {
  details: { ...mockPartnerDetails },
  earnings: [...mockPartnerEarnings],
  withdrawals: [
    {
      id: 'PWD_01',
      amount: 20000,
      requestedDate: '10 Feb 2025',
      status: 'Completed',
      bankAccount: '•••• •••• 8812',
      ifsc: 'ICIC0002345',
      payoutDate: '11 Feb 2025',
    },
  ],
  isLoading: false,
};

export const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {
    requestPartnerWithdrawal: (
      state,
      action: PayloadAction<{
        amount: number;
        bankAccount: string;
        ifsc: string;
      }>
    ) => {
      const { amount, bankAccount, ifsc } = action.payload;

      if (amount <= state.details.walletBalance) {
        state.details.walletBalance -= amount;

        const newWithdrawal: WithdrawalRequest = {
          id: `PWD_${Date.now()}`,
          amount,
          requestedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Pending',
          bankAccount,
          ifsc,
        };
        state.withdrawals.unshift(newWithdrawal);
      }
    },
  },
});

export const { requestPartnerWithdrawal } = partnerSlice.actions;
export default partnerSlice.reducer;
