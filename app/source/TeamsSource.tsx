import { processRequest } from './processor';

export const fetchTeamsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'teams', params });

export const fetchTeamRequest = (id: string) =>
  processRequest({ method: 'GET', url: `teams/${id}` });

export const createTeamRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'teams', data });

export const updateTeamRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `teams/${id}`, data });

export const deleteTeamRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `teams/${id}` });
