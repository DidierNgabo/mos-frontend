import { createSlice } from '@reduxjs/toolkit';
import {
  fetchPharmacyStocks,
  createPharmacyStock,
  updatePharmacyStock,
  deletePharmacyStock,
} from './pharmacy-stock.actions';
import { PharmacyStockState } from './pharmacy-stock.types';

const initialState: PharmacyStockState = {
  list: [],
  totalNumItems: 0,
  isLoadingPharmacyStocks: false,
  isCreatingPharmacyStock: false,
  isUpdatingPharmacyStock: false,
  isDeletingPharmacyStock: false,
  pharmacyStockError: null,
};

const pharmacyStockSlice = createSlice({
  name: 'pharmacyStock',
  initialState,
  reducers: {
    resetPharmacyStockError(state) {
      state.pharmacyStockError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPharmacyStocks.pending, (state) => { state.isLoadingPharmacyStocks = true; state.pharmacyStockError = null; })
      .addCase(fetchPharmacyStocks.fulfilled, (state, { payload }) => {
        state.isLoadingPharmacyStocks = false;
        state.list = payload?.items || [];
        state.totalNumItems = payload?.paginationInfo?.totalNumItems || 0;
      })
      .addCase(fetchPharmacyStocks.rejected, (state, action) => {
        state.isLoadingPharmacyStocks = false;
        state.pharmacyStockError = action.payload as string ?? action.error.message ?? null;
      })
      .addCase(createPharmacyStock.pending, (state) => { state.isCreatingPharmacyStock = true; state.pharmacyStockError = null; })
      .addCase(createPharmacyStock.fulfilled, (state) => { state.isCreatingPharmacyStock = false; })
      .addCase(createPharmacyStock.rejected, (state, action) => { state.isCreatingPharmacyStock = false; state.pharmacyStockError = action.payload as string ?? null; })
      .addCase(updatePharmacyStock.pending, (state) => { state.isUpdatingPharmacyStock = true; state.pharmacyStockError = null; })
      .addCase(updatePharmacyStock.fulfilled, (state) => { state.isUpdatingPharmacyStock = false; })
      .addCase(updatePharmacyStock.rejected, (state, action) => { state.isUpdatingPharmacyStock = false; state.pharmacyStockError = action.payload as string ?? null; })
      .addCase(deletePharmacyStock.pending, (state) => { state.isDeletingPharmacyStock = true; state.pharmacyStockError = null; })
      .addCase(deletePharmacyStock.fulfilled, (state) => { state.isDeletingPharmacyStock = false; })
      .addCase(deletePharmacyStock.rejected, (state, action) => { state.isDeletingPharmacyStock = false; state.pharmacyStockError = action.payload as string ?? null; });
  },
});

export const { resetPharmacyStockError } = pharmacyStockSlice.actions;
export default pharmacyStockSlice.reducer;
