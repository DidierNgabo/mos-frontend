import { processRequest } from './processor';

export const fetchPCL5ScreeningsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'pcl5-screenings', params });

export const createPCL5ScreeningRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'pcl5-screenings', data });

export const updatePCL5ScreeningRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `pcl5-screenings/${id}`, data });

export const deletePCL5ScreeningRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `pcl5-screenings/${id}` });
