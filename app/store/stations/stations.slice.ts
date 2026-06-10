import { createSlice } from '@reduxjs/toolkit';
import { fetchStations, createStation, updateStation, deleteStation } from './stations.actions';
import { StationState } from './stations.types';

const initialState: StationState = {
  list: [],
  totalNumItems: 0,
  isLoadingStations: false,
  isCreatingStation: false,
  isUpdatingStation: false,
  isDeletingStation: false,
  stationError: null,
};

const stationsSlice = createSlice({
  name: 'stations',
  initialState,
  reducers: {
    resetStationsState(state) {
      state.stationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStations.pending, (state) => { state.isLoadingStations = true; state.stationError = null; })
      .addCase(fetchStations.fulfilled, (state, { payload }) => {
        state.isLoadingStations = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchStations.rejected, (state, action) => {
        state.isLoadingStations = false;
        state.stationError = action.payload as string ?? action.error.message ?? null;
      })
      .addCase(createStation.pending, (state) => { state.isCreatingStation = true; state.stationError = null; })
      .addCase(createStation.fulfilled, (state) => { state.isCreatingStation = false; })
      .addCase(createStation.rejected, (state, action) => { state.isCreatingStation = false; state.stationError = action.payload as string ?? null; })
      .addCase(updateStation.pending, (state) => { state.isUpdatingStation = true; state.stationError = null; })
      .addCase(updateStation.fulfilled, (state) => { state.isUpdatingStation = false; })
      .addCase(updateStation.rejected, (state, action) => { state.isUpdatingStation = false; state.stationError = action.payload as string ?? null; })
      .addCase(deleteStation.pending, (state) => { state.isDeletingStation = true; state.stationError = null; })
      .addCase(deleteStation.fulfilled, (state) => { state.isDeletingStation = false; })
      .addCase(deleteStation.rejected, (state, action) => { state.isDeletingStation = false; state.stationError = action.payload as string ?? null; });
  },
});

export const { resetStationsState } = stationsSlice.actions;
export default stationsSlice.reducer;
