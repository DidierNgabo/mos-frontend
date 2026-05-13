import { processRequest } from './processor';

export const fetchPrescriptionsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'prescriptions', params });

export const createPrescriptionRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'prescriptions', data });

export const dispensePrescriptionRequest = (id: string) =>
  processRequest({ method: 'PATCH', url: `prescriptions/${id}/dispense`, data: {} });

export const cancelPrescriptionRequest = (id: string) =>
  processRequest({ method: 'PATCH', url: `prescriptions/${id}/cancel`, data: {} });
