import { processRequest } from './processor';

export const fetchTransfersRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'transfers', params });

export const createTransferRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'transfers', data });

export const updateTransferRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `transfers/${id}`, data });

export const deleteTransferRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `transfers/${id}` });
