import { createAsyncThunk } from '@reduxjs/toolkit';
import * as agentApi from '../../services/api/agentApi';
import { parseApiError } from '../../utils/apiError';
import { AssignedCustomer } from '../../types/models';

export interface RecordCollectionInput {
  customerId: string;
  customerName: string;
  loanId: string;
  amount: number;
  advanceAmount?: number;
  paymentMethod: agentApi.CollectionPaymentMethod;
  remarks?: string;
}

export const fetchAssignedCustomersThunk = createAsyncThunk<
  AssignedCustomer[],
  void,
  { rejectValue: string }
>('agent/fetchAssignedCustomers', async (_, { rejectWithValue }) => {
  try {
    const customers = await agentApi.getAssignedCustomers();
    return customers.map(customer => ({
      id: String(customer.id),
      name: customer.name,
      phone: customer.mobile,
      loanId: customer.next_due ? String(customer.next_due.loan_id) : 'N/A',
      pendingAmount: customer.next_due ? Number(customer.next_due.amount) : 0,
      dueDate: customer.next_due ? customer.next_due.due_date : '',
      isOverdue: customer.next_due ? new Date(customer.next_due.due_date) < new Date() && customer.next_due.status === 'pending' : false,
      address: undefined, 
      avatar: undefined,
    }));
  } catch (error: unknown) {
    return rejectWithValue(parseApiError(error));
  }
});


export const recordCollectionThunk = createAsyncThunk(
  'agent/recordCollection',
  async (input: RecordCollectionInput, { rejectWithValue }) => {
    try {
      const collection = await agentApi.recordCollection({
        customer_id: Number(input.customerId),
        amount: input.amount,
        advance_amount: input.advanceAmount,
        mode: input.paymentMethod.toLowerCase(),
        notes: input.remarks,
        collected_at: new Date().toISOString().split('T')[0], 
      });

      if (collection && collection.id) {
        try {
          await agentApi.updateCollectionStatus(collection.id, 'collected');
        } catch (statusError) {
          console.warn('Failed to update collection status:', statusError);
        }
      }

      return { collection, input };
    } catch (error: unknown) {
      return rejectWithValue(parseApiError(error));
    }
  },
);
