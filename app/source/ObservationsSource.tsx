import { processRequest } from './processor';

export const fetchObservationsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'observations', params });

export const createObservationRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'observations', data });

export const updateObservationRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `observations/${id}`, data });

export const deleteObservationRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `observations/${id}` });
