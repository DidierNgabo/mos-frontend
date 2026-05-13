import { processRequest } from './processor';

export const fetchRolesRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'roles', params });

export const fetchRoleRequest = (id: string) =>
  processRequest({ method: 'GET', url: `roles/${id}` });

export const createRoleRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'roles', data });

export const updateRoleRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `roles/${id}`, data });

export const deleteRoleRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `roles/${id}` });
