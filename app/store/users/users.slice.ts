import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers, createUser, updateUser, deleteUser } from './users.actions';
import { UserState } from './users.types';

const initialState: UserState = { 
  list: [], 
  totalNumItems: 0,
  isLoadingUsers: false, 
  isCreatingUser: false,
  isUpdatingUser: false,
  isDeletingUser: false,
  userError: null 
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUsersState(state) { 
      state.userError = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchUsers.pending, (state) => { 
        state.isLoadingUsers = true;  
        state.userError = null; 
      })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => { 
        state.isLoadingUsers = false; 
        state.list = payload?.items || []; 
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchUsers.rejected, (state, action) => { 
        state.isLoadingUsers = false; 
        state.userError = action.payload as string ?? action.error.message ?? null; 
      })
      // Create
      .addCase(createUser.pending, (state) => { state.isCreatingUser = true; state.userError = null; })
      .addCase(createUser.fulfilled, (state) => { state.isCreatingUser = false; })
      .addCase(createUser.rejected, (state, action) => { state.isCreatingUser = false; state.userError = action.payload as string ?? null; })
      // Update
      .addCase(updateUser.pending, (state) => { state.isUpdatingUser = true; state.userError = null; })
      .addCase(updateUser.fulfilled, (state) => { state.isUpdatingUser = false; })
      .addCase(updateUser.rejected, (state, action) => { state.isUpdatingUser = false; state.userError = action.payload as string ?? null; })
      // Delete
      .addCase(deleteUser.pending, (state) => { state.isDeletingUser = true; state.userError = null; })
      .addCase(deleteUser.fulfilled, (state) => { state.isDeletingUser = false; })
      .addCase(deleteUser.rejected, (state, action) => { state.isDeletingUser = false; state.userError = action.payload as string ?? null; });
  },
});

export const { resetUsersState } = usersSlice.actions;
export default usersSlice.reducer;
