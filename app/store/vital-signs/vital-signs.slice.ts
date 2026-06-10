import { createSlice } from '@reduxjs/toolkit';
import {
  fetchVitalSigns,
  createVitalSign,
  updateVitalSign,
  deleteVitalSign,
} from './vital-signs.actions';
import { VitalSignState } from './vital-signs.types';

const initialState: VitalSignState = {
  list: [],
  totalNumItems: 0,
  isLoadingVitalSigns: false,
  isCreatingVitalSign: false,
  isUpdatingVitalSign: false,
  isDeletingVitalSign: false,
  vitalSignError: null,
};

const vitalSignsSlice = createSlice({
  name: 'vitalSigns',
  initialState,
  reducers: {
    resetVitalSignsState(state) {
      state.vitalSignError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVitalSigns.pending, (state) => {
        state.isLoadingVitalSigns = true;
        state.vitalSignError = null;
      })
      .addCase(fetchVitalSigns.fulfilled, (state, { payload }) => {
        state.isLoadingVitalSigns = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchVitalSigns.rejected, (state, action) => {
        state.isLoadingVitalSigns = false;
        state.vitalSignError =
          (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(createVitalSign.pending, (state) => {
        state.isCreatingVitalSign = true;
        state.vitalSignError = null;
      })
      .addCase(createVitalSign.fulfilled, (state) => {
        state.isCreatingVitalSign = false;
      })
      .addCase(createVitalSign.rejected, (state, action) => {
        state.isCreatingVitalSign = false;
        state.vitalSignError = (action.payload as string) ?? null;
      })
      .addCase(updateVitalSign.pending, (state) => {
        state.isUpdatingVitalSign = true;
        state.vitalSignError = null;
      })
      .addCase(updateVitalSign.fulfilled, (state) => {
        state.isUpdatingVitalSign = false;
      })
      .addCase(updateVitalSign.rejected, (state, action) => {
        state.isUpdatingVitalSign = false;
        state.vitalSignError = (action.payload as string) ?? null;
      })
      .addCase(deleteVitalSign.pending, (state) => {
        state.isDeletingVitalSign = true;
        state.vitalSignError = null;
      })
      .addCase(deleteVitalSign.fulfilled, (state) => {
        state.isDeletingVitalSign = false;
      })
      .addCase(deleteVitalSign.rejected, (state, action) => {
        state.isDeletingVitalSign = false;
        state.vitalSignError = (action.payload as string) ?? null;
      });
  },
});

export const { resetVitalSignsState } = vitalSignsSlice.actions;
export default vitalSignsSlice.reducer;
