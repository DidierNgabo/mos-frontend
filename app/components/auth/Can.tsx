'use client';

import { useAbility } from '@/app/hooks/useAbility';
import { Action, Subject } from '@/app/lib/ability';

interface CanProps {
  do: Action;
  on: Subject;
  children: React.ReactNode;
}

export function Can({ do: action, on: subject, children }: CanProps) {
  const ability = useAbility();
  if (!ability.can(action, subject)) return null;
  return <>{children}</>;
}
