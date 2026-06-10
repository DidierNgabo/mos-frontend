import { processRequest } from './processor';

export const fetchEvangelismRecordsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'evangelism-records', params });

export const fetchEvangelismRecordRequest = (id: string) =>
  processRequest({ method: 'GET', url: `evangelism-records/${id}` });

export const createEvangelismRecordRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'evangelism-records', data });

export const updateEvangelismRecordRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `evangelism-records/${id}`, data });

export const deleteEvangelismRecordRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `evangelism-records/${id}` });
