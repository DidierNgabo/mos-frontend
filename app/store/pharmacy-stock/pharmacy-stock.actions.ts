import { createAsyncThunk } from '@reduxjs/toolkit';
import { PharmacyStockSource } from '@/app/source';

export const fetchPharmacyStocks = createAsyncThunk(
  'pharmacyStock/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await PharmacyStockSource.fetchPharmacyStocksRequest(params);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Request failed');
    }
  },
);

export const createPharmacyStock = createAsyncThunk(
  'pharmacyStock/create',
  async (data: unknown, { rejectWithValue }) => {
    try {
      return await PharmacyStockSource.createPharmacyStockRequest(data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Create failed');
    }
  },
);

export const updatePharmacyStock = createAsyncThunk(
  'pharmacyStock/update',
  async ({ id, data }: { id: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await PharmacyStockSource.updatePharmacyStockRequest(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Update failed');
    }
  },
);

export const deletePharmacyStock = createAsyncThunk(
  'pharmacyStock/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await PharmacyStockSource.deletePharmacyStockRequest(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Delete failed');
    }
  },
);

export const recordStockTransaction = createAsyncThunk(
  'pharmacyStock/recordTransaction',
  async ({ stockId, data }: { stockId: string; data: unknown }, { rejectWithValue }) => {
    try {
      return await PharmacyStockSource.recordStockTransactionRequest(stockId, data);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Transaction failed');
    }
  },
);
