import { processRequest } from './processor';

export const fetchPatientsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'patients', params });

export const fetchPatientRequest = (id: string) =>
  processRequest({ method: 'GET', url: `patients/${id}` });

export const createPatientRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'patients', data });

export const updatePatientRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `patients/${id}`, data });

export const deletePatientRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `patients/${id}` });
