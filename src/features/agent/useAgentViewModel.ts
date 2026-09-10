import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { fetchAssignedCustomersThunk } from './agentThunks';

export const useAgentViewModel = () => {
  const dispatch = useAppDispatch();
  const agent = useAppSelector(state => state.agent);

  const refreshAssignedCustomers = useCallback(
    () => dispatch(fetchAssignedCustomersThunk()),
    [dispatch],
  );

  return { agent, refreshAssignedCustomers };
};
