import { processRequest } from './processor';

export const fetchLabResultsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'lab-results', params });

export const createLabResultRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'lab-results', data });

export const updateLabResultRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `lab-results/${id}`, data });

export const deleteLabResultRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `lab-results/${id}` });
