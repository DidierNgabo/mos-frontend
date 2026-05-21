import { createSlice } from '@reduxjs/toolkit';
import { fetchTeams, createTeam, updateTeam, deleteTeam } from './teams.actions';
import { TeamState } from './teams.types';

const initialState: TeamState = {
  list: [],
  totalNumItems: 0,
  isLoading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    resetTeamsState(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTeams.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchTeams.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? action.error.message ?? null;
      })
      // Create
      .addCase(createTeam.pending, (state) => { state.error = null; })
      .addCase(createTeam.fulfilled, (state) => { state.error = null; })
      .addCase(createTeam.rejected, (state, action) => { state.error = (action.payload as string) ?? null; })
      // Update
      .addCase(updateTeam.pending, (state) => { state.error = null; })
      .addCase(updateTeam.fulfilled, (state) => { state.error = null; })
      .addCase(updateTeam.rejected, (state, action) => { state.error = (action.payload as string) ?? null; })
      // Delete
      .addCase(deleteTeam.pending, (state) => { state.error = null; })
      .addCase(deleteTeam.fulfilled, (state, { payload }) => {
        state.list = state.list.filter((t) => t.id !== payload);
      })
      .addCase(deleteTeam.rejected, (state, action) => { state.error = (action.payload as string) ?? null; });
  },
});

export const { resetTeamsState } = teamsSlice.actions;
export default teamsSlice.reducer;
