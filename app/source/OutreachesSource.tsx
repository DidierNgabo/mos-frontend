import { processRequest } from './processor';

export const fetchOutreachesRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'outreaches', params });

export const fetchOutreachRequest   = (id: string) =>
  processRequest({ method: 'GET', url: `outreaches/${id}` });

export const createOutreachRequest  = (data: unknown) =>
  processRequest({ method: 'POST', url: 'outreaches', data });

export const updateOutreachRequest  = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `outreaches/${id}`, data });

export const deleteOutreachRequest  = (id: string) =>
  processRequest({ method: 'DELETE', url: `outreaches/${id}` });

export const addMembersRequest      = (id: string, userIds: string[]) =>
  processRequest({ method: 'POST', url: `outreaches/${id}/members`, data: { userIds } });

export const removeMembersRequest   = (id: string, userIds: string[]) =>
  processRequest({ method: 'DELETE', url: `outreaches/${id}/members`, data: { userIds } });
