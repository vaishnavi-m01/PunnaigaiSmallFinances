import { createAsyncThunk } from '@reduxjs/toolkit';
import * as agentApi from '../../services/api/agentApi';
import { parseApiError } from '../../utils/apiError';
import { AssignedCustomer } from '../../types/models';

export interface RecordCollectionInput {
  customerId: string;
  customerName: string;
  loanId: string;
  amount: number;
  paymentMethod: agentApi.CollectionPaymentMethod;
  remarks?: string;
}

/** Fetches customers allocated to the currently authenticated agent. */
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
      phone: customer.phone,
      loanId: String(customer.loan_id),
      pendingAmount: Number(customer.pending_amount),
      dueDate: customer.due_date,
      isOverdue: Boolean(customer.is_overdue),
      address: customer.address,
      avatar: customer.avatar,
    }));
  } catch (error: unknown) {
    return rejectWithValue(parseApiError(error));
  }
});

/**
 * Records an agent collection through the API. The fulfilled response is used
 * by agentSlice to update the dashboard and customer balance atomically.
 */
export const recordCollectionThunk = createAsyncThunk(
  'agent/recordCollection',
  async (input: RecordCollectionInput, { rejectWithValue }) => {
    try {
      const collection = await agentApi.recordCollection({
        customer_id: input.customerId,
        loan_id: input.loanId,
        amount: input.amount,
        payment_method: input.paymentMethod,
        remarks: input.remarks,
      });

      return { collection, input };
    } catch (error: unknown) {
      return rejectWithValue(parseApiError(error));
    }
  },
);
