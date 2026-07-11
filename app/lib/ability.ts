export type Action = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subject =
  | 'Outreach'
  | 'User'
  | 'Role'
  | 'Station'
  | 'Patient'
  | 'VitalSign'
  | 'PharmacyStock'
  | 'QueueEntry'
  | 'Observation'
  | 'LabResult'
  | 'CommunicableDisease'
  | 'Transfer'
  | 'Prescription'
  | 'PHQ9Screening'
  | 'GAD7Screening'
  | 'PCL5Screening'
  | 'Team'
  | 'EvangelismRecord'
  | 'all';

export interface Ability {
  can(action: Action, subject: Subject): boolean;
}

const CLINICAL_READ_ONLY = ['NURSE', 'DOCTOR', 'PHARMACIST'];

export function buildAbilityFor(roles: string[]): Ability {
  const permissions = new Set<string>();

  const grant = (actions: Action | Action[], subjects: Subject | Subject[]) => {
    const as = Array.isArray(actions) ? actions : [actions];
    const ss = Array.isArray(subjects) ? subjects : [subjects];
    for (const a of as) for (const s of ss) permissions.add(`${a}:${s}`);
  };

  const has = (r: string) => roles.includes(r);
  const hasAny = (rs: string[]) => rs.some(has);

  if (has('SUPER_ADMIN')) {
    grant('manage', 'all');
  } else {
    if (has('OUTREACH_ADMIN')) {
      grant('manage', ['Outreach', 'Station', 'Team', 'Patient', 'PharmacyStock', 'VitalSign', 'QueueEntry', 'Observation', 'LabResult', 'CommunicableDisease', 'Transfer', 'Prescription', 'PHQ9Screening', 'GAD7Screening', 'PCL5Screening', 'EvangelismRecord']);
      grant(['create', 'read', 'update'], 'User');
      grant('read', 'Role');
    }

    if (has('EVANGELIST')) {
      grant(['create', 'read', 'update'], 'EvangelismRecord');
      grant('read', ['Outreach', 'Patient']);
    }

    if (has('PSYCHOLOGIST')) {
      grant('read', ['Outreach', 'Station', 'Team', 'Patient', 'User']);
      grant(['read', 'update'], 'QueueEntry');
      grant(['create', 'read', 'update', 'delete'], ['PHQ9Screening', 'GAD7Screening', 'PCL5Screening']);
      grant(['create', 'read', 'update'], ['Prescription', 'Transfer']);
    }

    if (has('PHARMACIST')) {
      grant(['create', 'read', 'update'], 'PharmacyStock');
      grant(['read', 'update'], 'QueueEntry');
      grant(['create', 'read', 'update'], 'Prescription');
    }

    if (hasAny(CLINICAL_READ_ONLY)) {
      grant('read', ['Outreach', 'User', 'Station', 'Team', 'Patient', 'PharmacyStock', 'VitalSign']);
    }

    if (has('NURSE') || has('DOCTOR')) {
      grant(['create', 'read', 'update'], 'VitalSign');
    }

    if (has('DATA_CLERK')) {
      grant('read', ['Outreach', 'User', 'Station', 'Team']);
      grant(['create', 'read', 'update'], 'Patient');
      grant(['create', 'read'], 'QueueEntry');
    }

    if (has('NURSE') || has('DOCTOR')) {
      grant(['read', 'update'], 'QueueEntry');
      grant(['create', 'read', 'update'], 'CommunicableDisease');
      grant(['create', 'read', 'update'], 'Observation');
    }

    if (has('DOCTOR')) {
      grant(['create', 'read', 'update'], 'LabResult');
      grant(['create', 'read', 'update'], 'Transfer');
      grant(['create', 'read'], 'Prescription');
    }

    if (has('NURSE')) {
      grant('read', 'Prescription');
    }

    // Every authenticated user can read/update their own profile
    grant(['read', 'update'], 'User');
  }

  return {
    can(action: Action, subject: Subject): boolean {
      if (permissions.has('manage:all')) return true;
      if (permissions.has(`manage:${subject}`)) return true;
      return permissions.has(`${action}:${subject}`);
    },
  };
}
