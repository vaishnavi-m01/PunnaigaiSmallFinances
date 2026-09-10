import { useAppSelector } from '../../hooks/useAppHooks';

export const useInvestorViewModel = () => {
  const investor = useAppSelector(state => state.investor);
  return { investor };
};
