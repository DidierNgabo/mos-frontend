import { useMemo } from 'react';
import { buildAbilityFor, Ability } from '@/app/lib/ability';
import { useAppSelector } from './redux';

export const useAbility = (): Ability => {
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  return useMemo(() => buildAbilityFor(roles), [roles]);
};
