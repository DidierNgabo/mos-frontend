import { processRequest } from './processor';

export const fetchCommunicableDiseasesRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'communicable-diseases', params });

export const createCommunicableDiseaseRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'communicable-diseases', data });

export const updateCommunicableDiseaseRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `communicable-diseases/${id}`, data });

export const deleteCommunicableDiseaseRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `communicable-diseases/${id}` });
