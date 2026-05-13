export interface Patient {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  phoneNumber?: string;
  nationalId?: string;
  village: string;
  district: string;
  sector: string | null;
  cell: string | null;
  province: string;
  outreach: { id: string; name: string };
  registeredBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface PatientState {
  list: Patient[];
  totalNumItems: number;
  isLoadingPatients: boolean;
  isCreatingPatient: boolean;
  isUpdatingPatient: boolean;
  isDeletingPatient: boolean;
  patientError: string | null;
}
