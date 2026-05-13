export interface Role {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface RoleState {
  list: Role[];
  totalNumItems: number;
  isLoadingRoles: boolean;
  isCreatingRole: boolean;
  isUpdatingRole: boolean;
  isDeletingRole: boolean;
  roleError: string | null;
}
