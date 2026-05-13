import { processRequest } from './processor';

export const fetchPharmacyStocksRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'pharmacy-stock', params });

export const fetchPharmacyStockRequest = (id: string) =>
  processRequest({ method: 'GET', url: `pharmacy-stock/${id}` });

export const createPharmacyStockRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'pharmacy-stock', data });

export const updatePharmacyStockRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `pharmacy-stock/${id}`, data });

export const deletePharmacyStockRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `pharmacy-stock/${id}` });

export const recordStockTransactionRequest = (stockId: string, data: unknown) =>
  processRequest({ method: 'POST', url: `pharmacy-stock/${stockId}/transactions`, data });

export const fetchStockTransactionsRequest = (stockId: string, params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: `pharmacy-stock/${stockId}/transactions`, params });
