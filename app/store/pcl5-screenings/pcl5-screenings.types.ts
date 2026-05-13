export type PCL5Severity = 'MINIMAL' | 'MODERATE' | 'SEVERE' | 'EXTREME';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type EducationLevel = 'NONE' | 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
export type OccupationType = 'NONE' | 'PRIVATE' | 'PUBLIC';
export type DivisionType = 'I' | 'II' | 'III' | 'IV';
export type LocationType = 'URBAN' | 'RURAL_SEMI_URBAN';
export type ReligionType = 'CATHOLIC' | 'PROTESTANT' | 'MUSLIM' | 'TRADITIONAL' | 'OTHER';

export interface PCL5Screening {
  id: string;
  queueEntry: { id: string };
  patient: { id: string; firstName: string; lastName: string };
  station: { id: string; name: string };
  outreach: { id: string; name: string };
  recordedBy: { id: string; firstName: string; lastName: string };
  initialOfParticipant: string | null;
  maritalStatus: MaritalStatus | null;
  educationLevel: EducationLevel | null;
  occupation: OccupationType | null;
  division: DivisionType | null;
  locationType: LocationType | null;
  religion: ReligionType | null;
  q1: number; q2: number; q3: number; q4: number; q5: number;
  q6: number; q7: number; q8: number; q9: number; q10: number;
  q11: number; q12: number; q13: number; q14: number; q15: number;
  q16: number; q17: number; q18: number; q19: number; q20: number;
  totalScore: number;
  severity: PCL5Severity;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PCL5ScreeningState {
  list: PCL5Screening[];
  totalNumItems: number;
  isLoading: boolean;
  error: string | null;
}
