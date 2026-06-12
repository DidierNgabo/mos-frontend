export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TeamLeader {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  outreach: { id: string; name: string };
  parent: { id: string; name: string } | null;
  children: Team[];
  leader: TeamLeader | null;
  members: TeamMember[];
  station: { id: string; name: string; type: string } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamState {
  list: Team[];
  totalNumItems: number;
  isLoading: boolean;
  error: string | null;
}
