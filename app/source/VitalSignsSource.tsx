import { processRequest } from './processor';

export const fetchVitalSignsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'vital-signs', params });

export const createVitalSignRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'vital-signs', data });

export const updateVitalSignRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `vital-signs/${id}`, data });

export const deleteVitalSignRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `vital-signs/${id}` });
