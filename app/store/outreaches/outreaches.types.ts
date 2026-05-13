export interface OutreachMember {
  id: string;
  firstName: string;
  lastName: string;
}

export interface OutreachCreatedBy {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Outreach {
  id: string;
  name: string;
  location: string;
  status: string;
  date: string;
  createdAt: string;
  createdBy: OutreachCreatedBy | null;
  members: OutreachMember[];
}

export interface OutreachState {
  list: Outreach[];
  totalNumItems: number;
  isLoadingOutreaches: boolean;
  isCreatingOutreach: boolean;
  isUpdatingOutreach: boolean;
  isDeletingOutreach: boolean;
  outreachError: string | null;
}
