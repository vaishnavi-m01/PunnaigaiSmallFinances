import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AssignedCustomer, CollectionRecord } from '../types/models';
import { mockAssignedCustomers, mockCollections } from '../services/mockDataService';
import {
  fetchAssignedCustomersThunk,
  recordCollectionThunk,
} from '../features/agent/collectionThunks';

export interface AgentState {
  todayCollection: number;
  totalCollection: number;
  assignedCustomers: AssignedCustomer[];
  collections: CollectionRecord[];
  isLoading: boolean;
  assignedCustomersError: string | null;
  isSubmittingCollection: boolean;
  collectionError: string | null;
}

const initialState: AgentState = {
  todayCollection: 45000,
  totalCollection: 850000,
  assignedCustomers: [...mockAssignedCustomers],
  collections: [...mockCollections],
  isLoading: false,
  assignedCustomersError: null,
  isSubmittingCollection: false,
  collectionError: null,
};

export const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    addCollection: (
      state,
      action: PayloadAction<{
        customerName: string;
        customerId: string;
        loanId: string;
        amount: number;
        paymentMethod: 'Cash' | 'UPI' | 'Cheque';
        remarks?: string;
      }>
    ) => {
      const { customerName, customerId, loanId, amount, paymentMethod, remarks } = action.payload;

      // Update counters
      state.todayCollection += amount;
      state.totalCollection += amount;

      // Add collection record
      const newRecord: CollectionRecord = {
        id: `COL_${Date.now()}`,
        customerName,
        customerId,
        loanId,
        amount,
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paymentMethod,
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        remarks,
      };
      state.collections.unshift(newRecord);

      // Reduce customer pending balance
      const customer = state.assignedCustomers.find(c => c.id === customerId);
      if (customer) {
        customer.pendingAmount = Math.max(0, customer.pendingAmount - amount);
        if (customer.pendingAmount === 0) {
          customer.isOverdue = false;
        }
      }
    },
    clearCollectionError: state => {
      state.collectionError = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAssignedCustomersThunk.pending, state => {
        state.isLoading = true;
        state.assignedCustomersError = null;
      })
      .addCase(fetchAssignedCustomersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignedCustomers = action.payload;
      })
      .addCase(fetchAssignedCustomersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.assignedCustomersError =
          action.payload ?? 'Failed to load assigned customers';
      })
      .addCase(recordCollectionThunk.pending, state => {
        state.isSubmittingCollection = true;
        state.collectionError = null;
      })
      .addCase(recordCollectionThunk.fulfilled, (state, action) => {
        const { collection, input } = action.payload;
        const amount = Number(collection.amount);

        state.isSubmittingCollection = false;
        state.todayCollection += amount;
        state.totalCollection += amount;
        state.collections.unshift({
          id: String(collection.id),
          customerName: collection.customer_name ?? input.customerName,
          customerId: String(collection.customer_id),
          loanId: String(collection.loan_id),
          amount,
          date: collection.collected_at ?? new Date().toLocaleString('en-IN'),
          paymentMethod: collection.payment_method,
          receiptNumber: collection.receipt_number ?? `REC-${Date.now().toString().slice(-6)}`,
          remarks: collection.remarks ?? input.remarks,
        });

        const customer = state.assignedCustomers.find(
          item => item.id === String(collection.customer_id),
        );
        if (customer) {
          customer.pendingAmount = Math.max(0, customer.pendingAmount - amount);
          if (customer.pendingAmount === 0) {
            customer.isOverdue = false;
          }
        }
      })
      .addCase(recordCollectionThunk.rejected, (state, action) => {
        state.isSubmittingCollection = false;
        state.collectionError =
          (action.payload as string | undefined) ?? 'Failed to record collection';
      });
  },
});

export const { addCollection, clearCollectionError } = agentSlice.actions;
export default agentSlice.reducer;
