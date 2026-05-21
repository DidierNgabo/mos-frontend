export interface UserRole {
  id: string;
  name: string;
}

export interface UserStation {
  id: string;
  name: string;
  type: string;
}

export interface UserOutreach {
  id: string;
  name: string;
  location: string;
  status: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  roles: UserRole[];
  station: UserStation | null;
  outreaches?: UserOutreach[];
}

export interface UserState {
  list: User[];
  totalNumItems: number;
  isLoadingUsers: boolean;
  isCreatingUser: boolean;
  isUpdatingUser: boolean;
  isDeletingUser: boolean;
  userError: string | null;
}
