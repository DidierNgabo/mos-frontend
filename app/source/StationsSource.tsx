import { processRequest } from './processor';

export const fetchStationsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'stations', params });

export const fetchStationRequest = (id: string) =>
  processRequest({ method: 'GET', url: `stations/${id}` });

export const createStationRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'stations', data });

export const updateStationRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `stations/${id}`, data });

export const deleteStationRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `stations/${id}` });

export const assignUsersRequest = (id: string, userIds: string[]) =>
  processRequest({ method: 'POST', url: `stations/${id}/users`, data: { userIds } });

export const removeUsersRequest = (id: string, userIds: string[]) =>
  processRequest({ method: 'DELETE', url: `stations/${id}/users`, data: { userIds } });
