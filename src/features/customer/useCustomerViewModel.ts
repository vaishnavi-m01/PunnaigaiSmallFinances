import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { fetchDashboardThunk, fetchLoanPackagesThunk } from './customerThunks';

export const useCustomerViewModel = () => {
  const dispatch = useAppDispatch();
  const customer = useAppSelector(state => state.customer);

  const refreshDashboard = useCallback(
    () => dispatch(fetchDashboardThunk()),
    [dispatch],
  );
  const loadLoanPackages = useCallback(
    () => dispatch(fetchLoanPackagesThunk()),
    [dispatch],
  );

  return { customer, refreshDashboard, loadLoanPackages };
};
