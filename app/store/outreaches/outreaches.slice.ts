import { createSlice } from '@reduxjs/toolkit';
import { fetchOutreaches, createOutreach, updateOutreach, deleteOutreach } from './outreaches.actions';
import { OutreachState } from './outreaches.types';

const initialState: OutreachState = { 
  list: [], 
  totalNumItems: 0,
  isLoadingOutreaches: false, 
  isCreatingOutreach: false,
  isUpdatingOutreach: false,
  isDeletingOutreach: false,
  outreachError: null 
};

const outreachesSlice = createSlice({
  name: 'outreaches',
  initialState,
  reducers: {
    resetOutreachesState(state) { 
      state.outreachError = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchOutreaches.pending, (state) => { 
        state.isLoadingOutreaches = true;  
        state.outreachError = null; 
      })
      .addCase(fetchOutreaches.fulfilled, (state, { payload }) => { 
        state.isLoadingOutreaches = false; 
        state.list = payload?.items || []; 
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchOutreaches.rejected, (state, action) => { 
        state.isLoadingOutreaches = false; 
        state.outreachError = action.payload as string ?? action.error.message ?? null; 
      })
      // Create
      .addCase(createOutreach.pending, (state) => { state.isCreatingOutreach = true; state.outreachError = null; })
      .addCase(createOutreach.fulfilled, (state) => { state.isCreatingOutreach = false; })
      .addCase(createOutreach.rejected, (state, action) => { state.isCreatingOutreach = false; state.outreachError = action.payload as string ?? null; })
      // Update
      .addCase(updateOutreach.pending, (state) => { state.isUpdatingOutreach = true; state.outreachError = null; })
      .addCase(updateOutreach.fulfilled, (state) => { state.isUpdatingOutreach = false; })
      .addCase(updateOutreach.rejected, (state, action) => { state.isUpdatingOutreach = false; state.outreachError = action.payload as string ?? null; })
      // Delete
      .addCase(deleteOutreach.pending, (state) => { state.isDeletingOutreach = true; state.outreachError = null; })
      .addCase(deleteOutreach.fulfilled, (state) => { state.isDeletingOutreach = false; })
      .addCase(deleteOutreach.rejected, (state, action) => { state.isDeletingOutreach = false; state.outreachError = action.payload as string ?? null; });
  },
});

export const { resetOutreachesState } = outreachesSlice.actions;
export default outreachesSlice.reducer;
