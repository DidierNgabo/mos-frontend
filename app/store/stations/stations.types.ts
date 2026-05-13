export type StationType = 'CLINICAL' | 'LAB' | 'PHARMACY' | 'SCREENING' | 'RADIOLOGY';

export interface Station {
  id: string;
  name: string;
  type: StationType;
  isActive: boolean;
  userCount: number;
  outreach: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface StationState {
  list: Station[];
  totalNumItems: number;
  isLoadingStations: boolean;
  isCreatingStation: boolean;
  isUpdatingStation: boolean;
  isDeletingStation: boolean;
  stationError: string | null;
}
