import { processRequest } from './processor';

export const fetchQueueEntriesRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'queue-entries', params });

export const fetchMyQueueRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'queue-entries/my-queue', params });

export const createQueueEntryRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'queue-entries', data });

export const updateQueueEntryRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `queue-entries/${id}`, data });

export const moveQueueEntryRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `queue-entries/${id}/move`, data });

export const updateQueueStatusRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `queue-entries/${id}/status`, data });

export const fetchPatientChartRequest = (id: string) =>
  processRequest({ method: 'GET', url: `queue-entries/${id}/chart` });

export const deleteQueueEntryRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `queue-entries/${id}` });

export const fetchPublicQueueRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'queue-entries/public', params, showErrorToaster: false });
