import { processRequest } from './processor';

export const fetchUsersRequest  = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'users', params });

export const fetchUserRequest   = (id: string) =>
  processRequest({ method: 'GET', url: `users/${id}` });

export const createUserRequest  = (data: unknown) =>
  processRequest({ method: 'POST', url: 'users', data });

export const bulkInviteRequest  = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return processRequest({ method: 'POST', url: 'users/bulk-invite', data: form, headers: { 'Content-Type': 'multipart/form-data' } as any });
};

export const updateUserRequest  = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `users/${id}`, data });

export const deleteUserRequest  = (id: string) =>
  processRequest({ method: 'DELETE', url: `users/${id}` });
