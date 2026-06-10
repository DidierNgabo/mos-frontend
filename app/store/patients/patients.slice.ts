import { createSlice } from '@reduxjs/toolkit';
import { fetchPatients, createPatient, updatePatient, deletePatient } from './patients.actions';
import { PatientState } from './patients.types';

const initialState: PatientState = {
  list: [],
  totalNumItems: 0,
  isLoadingPatients: false,
  isCreatingPatient: false,
  isUpdatingPatient: false,
  isDeletingPatient: false,
  patientError: null,
};

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    resetPatientsState(state) {
      state.patientError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => { state.isLoadingPatients = true; state.patientError = null; })
      .addCase(fetchPatients.fulfilled, (state, { payload }) => {
        state.isLoadingPatients = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoadingPatients = false;
        state.patientError = action.payload as string ?? action.error.message ?? null;
      })
      .addCase(createPatient.pending, (state) => { state.isCreatingPatient = true; state.patientError = null; })
      .addCase(createPatient.fulfilled, (state) => { state.isCreatingPatient = false; })
      .addCase(createPatient.rejected, (state, action) => { state.isCreatingPatient = false; state.patientError = action.payload as string ?? null; })
      .addCase(updatePatient.pending, (state) => { state.isUpdatingPatient = true; state.patientError = null; })
      .addCase(updatePatient.fulfilled, (state) => { state.isUpdatingPatient = false; })
      .addCase(updatePatient.rejected, (state, action) => { state.isUpdatingPatient = false; state.patientError = action.payload as string ?? null; })
      .addCase(deletePatient.pending, (state) => { state.isDeletingPatient = true; state.patientError = null; })
      .addCase(deletePatient.fulfilled, (state) => { state.isDeletingPatient = false; })
      .addCase(deletePatient.rejected, (state, action) => { state.isDeletingPatient = false; state.patientError = action.payload as string ?? null; });
  },
});

export const { resetPatientsState } = patientsSlice.actions;
export default patientsSlice.reducer;
