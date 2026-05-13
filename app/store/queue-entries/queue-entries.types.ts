export type QueueStatus = 'WAITING' | 'IN_SERVICE' | 'COMPLETED' | 'NO_SHOW';
export type QueuePriority = 'NORMAL' | 'URGENT' | 'EMERGENCY';

export interface QueueEntry {
  id: string;
  patient: { id: string; firstName: string; lastName: string; registrationNumber: string; dateOfBirth?: string; gender?: string };
  outreach: { id: string; name: string };
  currentStation: { id: string; name: string; type: string } | null;
  status: QueueStatus;
  priority: QueuePriority;
  chiefComplaint: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VitalSignRecord {
  id: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  pulseRate: number;
  temperature: number;
  weight: number;
  height: number;
  bmi: number;
  oxygenSaturation?: number | null;
  bloodGlucose?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface ObservationRecord {
  id: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentGiven: string | null;
  followUpRequired: boolean;
  followUpNotes?: string | null;
  createdAt: string;
}

export interface LabResultRecord {
  id: string;
  testType: string;
  resultValue: string;
  resultUnit?: string | null;
  isAbnormal: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface CommunicableDiseaseRecord {
  id: string;
  tuberculosisScreen: boolean;
  tuberculosisNotes?: string | null;
  malariaScreen: boolean;
  hasFever: boolean;
  feverDurationDays?: number | null;
  recentTravel: boolean;
  contactWithInfected: boolean;
  createdAt: string;
}

export interface TransferRecord {
  id: string;
  referredToFacility: string;
  referredService: string;
  transferReason: string;
  urgency: string;
  transportArranged: boolean;
  notes?: string | null;
  createdAt: string;
}

export type PrescriptionStatus = 'PENDING' | 'DISPENSED' | 'CANCELLED';

export interface PrescriptionRecord {
  id: string;
  pharmacyStock: { id: string; medicationName: string; genericName: string; dosageForm: string; strength: string; unitOfMeasure: string; quantityInStock: number };
  dosage: string;
  quantity: number;
  instructions: string | null;
  status: PrescriptionStatus;
  prescribedBy: { id: string; firstName: string; lastName: string };
  dispensedBy: { id: string; firstName: string; lastName: string } | null;
  dispensedAt: string | null;
  createdAt: string;
}

export interface PatientChart {
  entry: QueueEntry;
  vitalSigns: VitalSignRecord[];
  observations: ObservationRecord[];
  labResults: LabResultRecord[];
  communicableDiseases: CommunicableDiseaseRecord[];
  transfers: TransferRecord[];
  prescriptions: PrescriptionRecord[];
}

export interface QueueEntriesState {
  list: QueueEntry[];
  totalNumItems: number;
  isLoadingQueue: boolean;
  isCreatingEntry: boolean;
  isUpdatingEntry: boolean;
  isDeletingEntry: boolean;
  queueError: string | null;
  chart: PatientChart | null;
  isLoadingChart: boolean;
}
