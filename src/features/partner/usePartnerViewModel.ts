import { useAppSelector } from '../../hooks/useAppHooks';

export const usePartnerViewModel = () => {
  const partner = useAppSelector(state => state.partner);
  return { partner };
};
