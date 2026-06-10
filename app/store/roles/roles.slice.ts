import { createSlice } from '@reduxjs/toolkit';
import { fetchRoles, createRole, updateRole, deleteRole } from './roles.actions';
import { RoleState } from './roles.types';

const initialState: RoleState = {
  list: [],
  totalNumItems: 0,
  isLoadingRoles: false,
  isCreatingRole: false,
  isUpdatingRole: false,
  isDeletingRole: false,
  roleError: null,
};

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    resetRolesState(state) {
      state.roleError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => { state.isLoadingRoles = true; state.roleError = null; })
      .addCase(fetchRoles.fulfilled, (state, { payload }) => {
        state.isLoadingRoles = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoadingRoles = false;
        state.roleError = action.payload as string ?? action.error.message ?? null;
      })
      .addCase(createRole.pending, (state) => { state.isCreatingRole = true; state.roleError = null; })
      .addCase(createRole.fulfilled, (state) => { state.isCreatingRole = false; })
      .addCase(createRole.rejected, (state, action) => { state.isCreatingRole = false; state.roleError = action.payload as string ?? null; })
      .addCase(updateRole.pending, (state) => { state.isUpdatingRole = true; state.roleError = null; })
      .addCase(updateRole.fulfilled, (state) => { state.isUpdatingRole = false; })
      .addCase(updateRole.rejected, (state, action) => { state.isUpdatingRole = false; state.roleError = action.payload as string ?? null; })
      .addCase(deleteRole.pending, (state) => { state.isDeletingRole = true; state.roleError = null; })
      .addCase(deleteRole.fulfilled, (state) => { state.isDeletingRole = false; })
      .addCase(deleteRole.rejected, (state, action) => { state.isDeletingRole = false; state.roleError = action.payload as string ?? null; });
  },
});

export const { resetRolesState } = rolesSlice.actions;
export default rolesSlice.reducer;
