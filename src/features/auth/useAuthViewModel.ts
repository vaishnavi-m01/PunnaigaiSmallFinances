import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppHooks';
import { logoutThunk } from './authThunks';

export const useAuthViewModel = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);

  const logout = useCallback(() => dispatch(logoutThunk()), [dispatch]);

  return { auth, logout };
};
