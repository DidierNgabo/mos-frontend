export interface EvangelismRecord {
  id: string;
  outreach: { id: string; name: string };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    registrationNumber: string;
  } | null;
  name: string;
  healingRequest?: string | null;
  sinsToConfess?: string | null;
  isSaved: boolean;
  acceptedJesus: boolean;
  continueTheJourney: boolean;
  followUp: boolean;
  notSure: boolean;
  declined: boolean;
  prayerRequest?: string | null;
  doneBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface EvangelismRecordState {
  list: EvangelismRecord[];
  totalNumItems: number;
  isLoadingEvangelismRecords: boolean;
  isCreatingEvangelismRecord: boolean;
  isUpdatingEvangelismRecord: boolean;
  isDeletingEvangelismRecord: boolean;
  evangelismRecordError: string | null;
}
