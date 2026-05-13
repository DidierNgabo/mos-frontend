export interface VitalSign {
  id: string;
  patient: { id: string; firstName: string; lastName: string; registrationNumber: string };
  station: { id: string; name: string };
  outreach: { id: string; name: string };
  recordedBy: { id: string; firstName: string; lastName: string };
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
  updatedAt: string;
}

export interface VitalSignState {
  list: VitalSign[];
  totalNumItems: number;
  isLoadingVitalSigns: boolean;
  isCreatingVitalSign: boolean;
  isUpdatingVitalSign: boolean;
  isDeletingVitalSign: boolean;
  vitalSignError: string | null;
}
