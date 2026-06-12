import type {
  DivisionType,
  EducationLevel,
  LocationType,
  MaritalStatus,
  OccupationType,
  ReligionType,
} from '../pcl5-screenings/pcl5-screenings.types';

export type PHQ9Severity = 'NONE' | 'MILD' | 'MODERATE' | 'MOD_SEVERE' | 'SEVERE';

export interface PHQ9Screening {
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

export interface MentalHealthSession {
  id: string;
  queueEntryId: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    registrationNumber: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE';
  };
  station: { id: string; name: string };
  outreach: { id: string; name: string };
  recordedBy: { id: string; firstName: string; lastName: string };
  demographics: {
    initialOfParticipant: string | null;
    maritalStatus: MaritalStatus | null;
    educationLevel: EducationLevel | null;
    occupation: OccupationType | null;
    division: DivisionType | null;
    locationType: LocationType | null;
    religion: ReligionType | null;
  };
  phq9: {
    id: string;
    totalScore: number;
    severity: PHQ9Severity;
    selfHarmResponse: number;
    notes: string | null;
  };
  gad7: {
    id: string;
    totalScore: number;
    severity: import('../gad7-screenings/gad7-screenings.types').GAD7Severity;
    notes: string | null;
  } | null;
  pcl5: {
    id: string;
    totalScore: number;
    severity: import('../pcl5-screenings/pcl5-screenings.types').PCL5Severity;
    notes: string | null;
  } | null;
  createdAt: string;
}
