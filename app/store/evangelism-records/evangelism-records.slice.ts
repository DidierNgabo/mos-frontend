import { createSlice } from '@reduxjs/toolkit';
import {
  fetchEvangelismRecords,
  createEvangelismRecord,
  updateEvangelismRecord,
  deleteEvangelismRecord,
} from './evangelism-records.actions';
import { EvangelismRecordState } from './evangelism-records.types';

const initialState: EvangelismRecordState = {
  list: [],
  totalNumItems: 0,
  isLoadingEvangelismRecords: false,
  isCreatingEvangelismRecord: false,
  isUpdatingEvangelismRecord: false,
  isDeletingEvangelismRecord: false,
  evangelismRecordError: null,
};

const evangelismRecordsSlice = createSlice({
  name: 'evangelismRecords',
  initialState,
  reducers: {
    resetEvangelismRecordsState(state) {
      state.evangelismRecordError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvangelismRecords.pending, (state) => {
        state.isLoadingEvangelismRecords = true;
        state.evangelismRecordError = null;
      })
      .addCase(fetchEvangelismRecords.fulfilled, (state, { payload }) => {
        state.isLoadingEvangelismRecords = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchEvangelismRecords.rejected, (state, action) => {
        state.isLoadingEvangelismRecords = false;
        state.evangelismRecordError =
          (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(createEvangelismRecord.pending, (state) => {
        state.isCreatingEvangelismRecord = true;
        state.evangelismRecordError = null;
      })
      .addCase(createEvangelismRecord.fulfilled, (state) => {
        state.isCreatingEvangelismRecord = false;
      })
      .addCase(createEvangelismRecord.rejected, (state, action) => {
        state.isCreatingEvangelismRecord = false;
        state.evangelismRecordError = (action.payload as string) ?? null;
      })
      .addCase(updateEvangelismRecord.pending, (state) => {
        state.isUpdatingEvangelismRecord = true;
        state.evangelismRecordError = null;
      })
      .addCase(updateEvangelismRecord.fulfilled, (state) => {
        state.isUpdatingEvangelismRecord = false;
      })
      .addCase(updateEvangelismRecord.rejected, (state, action) => {
        state.isUpdatingEvangelismRecord = false;
        state.evangelismRecordError = (action.payload as string) ?? null;
      })
      .addCase(deleteEvangelismRecord.pending, (state) => {
        state.isDeletingEvangelismRecord = true;
        state.evangelismRecordError = null;
      })
      .addCase(deleteEvangelismRecord.fulfilled, (state) => {
        state.isDeletingEvangelismRecord = false;
      })
      .addCase(deleteEvangelismRecord.rejected, (state, action) => {
        state.isDeletingEvangelismRecord = false;
        state.evangelismRecordError = (action.payload as string) ?? null;
      });
  },
});

export const { resetEvangelismRecordsState } = evangelismRecordsSlice.actions;
export default evangelismRecordsSlice.reducer;
