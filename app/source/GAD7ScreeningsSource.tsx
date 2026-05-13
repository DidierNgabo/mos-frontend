import { processRequest } from './processor';

export const fetchGAD7ScreeningsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'gad7-screenings', params });

export const createGAD7ScreeningRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'gad7-screenings', data });

export const updateGAD7ScreeningRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `gad7-screenings/${id}`, data });

export const deleteGAD7ScreeningRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `gad7-screenings/${id}` });
