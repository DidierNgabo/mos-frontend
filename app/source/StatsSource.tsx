import axios from 'axios';
import { processRequest } from './processor';

export const fetchAdminStatsRequest = (outreachId: string) =>
  processRequest({ method: 'GET', url: 'stats/admin', params: { outreachId } });

export const fetchMyStatsRequest = (outreachId: string) =>
  processRequest({ method: 'GET', url: 'stats/me', params: { outreachId } });

export const downloadReportRequest = async (
  type: string,
  format: string,
  outreachId?: string,
  startDate?: string,
  endDate?: string,
): Promise<ArrayBuffer> => {
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken');
  const params: Record<string, string> = { format };
  if (outreachId) params.outreachId = outreachId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/reports/${type}`,
    {
      params,
      responseType: 'arraybuffer',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  return response.data as ArrayBuffer;
};
