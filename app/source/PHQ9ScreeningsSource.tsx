import { processRequest } from './processor';

export const fetchPHQ9ScreeningsRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'phq9-screenings', params });

export const fetchMentalHealthSessionsRequest = (
  params?: Record<string, unknown>,
) =>
  processRequest({
    method: 'GET',
    url: 'phq9-screenings/sessions',
    params,
  });

export const createPHQ9ScreeningRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'phq9-screenings', data });

export const updatePHQ9ScreeningRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `phq9-screenings/${id}`, data });

export const deletePHQ9ScreeningRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `phq9-screenings/${id}` });
