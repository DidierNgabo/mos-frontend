import { processRequest } from './processor';

export const fetchObservationsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'observations', params });

export const fetchMyObservationsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'observations/my-observations', params });

export const searchDiagnosesRequest = (query: string, limit = 30) =>
  processRequest({
    method: 'GET',
    url: 'observations/diagnoses/search',
    params: { query, limit },
    showErrorToaster: false,
  });

export const createObservationRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'observations', data });

export const updateObservationRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `observations/${id}`, data });

export const deleteObservationRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `observations/${id}` });
