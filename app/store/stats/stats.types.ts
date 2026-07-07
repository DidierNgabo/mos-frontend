export interface AdminStats {
  totalPatientsToday: number;
  totalPatientsOutreach: number;
  transfersCount: number;
  abnormalLabsCount: number;
  genderBreakdown: { gender: string; count: number }[];
  ageGroups: { ageGroup: string; count: number }[];
  topDiagnoses: { diagnosis: string; count: number }[];
  phq9Distribution: { severity: string; count: number }[];
  gad7Distribution: { severity: string; count: number }[];
  activeQueueLengths: { stationName: string; count: number }[];
}

export interface DoctorStats {
  consultationsDoneToday: number;
  consultationsDoneOutreach: number;
  activeQueuePatientsOutreach: number;
  avgQueueToObservationMinutes: number;
  followUpsRecommended: number;
  transfersInitiated: number;
  completedEmergencyCasesOutreach: number;
  formsCompleted: { phq9: number; gad7: number; labs: number };
  myTopDiagnoses: { diagnosis: string; count: number }[];
  abnormalVitalsFlagged: number;
}

export interface ClerkStats {
  patientsRegisteredToday: number;
  patientsRegisteredInPeriod: number;
  patientRegistrationsPerHour: { hour: string; count: number }[];
  genderBreakdown: { gender: string; count: number }[];
  enqueuedCount: number;
  pendingEnqueue: number;
  priorityAssignments: { normal: number; urgent: number; emergency: number };
  ageGroups: { ageGroup: string; count: number }[];
}

export interface PharmacistStats {
  unitsDispensedToday: number;
  uniquePatientsServed: number;
  lowStockItems: { medicationName: string; quantityInStock: number; threshold: number }[];
  outOfStockItems: { medicationName: string }[];
  topDispensedMedications: { medicationName: string; totalDispensed: number }[];
  stockConsumptionByDay: { date: string; totalDispensed: number }[];
}

export interface StatsState {
  adminStats: AdminStats | null;
  myStats: DoctorStats | ClerkStats | PharmacistStats | null;
  isLoading: boolean;
  error: string | null;
}
