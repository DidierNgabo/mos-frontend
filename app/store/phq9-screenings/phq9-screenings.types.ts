export type PHQ9Severity = 'NONE' | 'MILD' | 'MODERATE' | 'MOD_SEVERE' | 'SEVERE';

export interface PHQ9Screening {
  id: string;
  queueEntry: { id: string };
  patient: { id: string; firstName: string; lastName: string };
  station: { id: string; name: string };
  outreach: { id: string; name: string };
  recordedBy: { id: string; firstName: string; lastName: string };
  q1LittleInterest: number;
  q2Depressed: number;
  q3SleepProblems: number;
  q4Fatigue: number;
  q5Appetite: number;
  q6Worthlessness: number;
  q7Concentration: number;
  q8Psychomotor: number;
  q9SelfHarm: number;
  totalScore: number;
  severity: PHQ9Severity;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PHQ9ScreeningState {
  list: PHQ9Screening[];
  totalNumItems: number;
  isLoading: boolean;
  error: string | null;
}
