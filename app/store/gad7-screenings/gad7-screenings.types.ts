export type GAD7Severity = 'MINIMAL' | 'MILD' | 'MODERATE' | 'SEVERE';

export interface GAD7Screening {
  id: string;
  queueEntry: { id: string };
  patient: { id: string; firstName: string; lastName: string };
  station: { id: string; name: string };
  outreach: { id: string; name: string };
  recordedBy: { id: string; firstName: string; lastName: string };
  q1Anxious: number;
  q2Uncontrollable: number;
  q3Worrying: number;
  q4Relaxing: number;
  q5Restless: number;
  q6Irritable: number;
  q7Afraid: number;
  totalScore: number;
  severity: GAD7Severity;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GAD7ScreeningState {
  list: GAD7Screening[];
  totalNumItems: number;
  isLoading: boolean;
  error: string | null;
}
