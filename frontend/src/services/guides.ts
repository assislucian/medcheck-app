import axios from 'axios';
import { GuideProcedure } from '../types/medical';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface GuidesQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  crm?: string;
  data?: string;
}

export async function getGuides(
  token: string,
  params: GuidesQueryParams = {}
): Promise<{
  procedures: GuideProcedure[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.pageSize) query.append('pageSize', String(params.pageSize));
  if (params.search) query.append('search', params.search);
  if (params.status && params.status !== 'ALL') query.append('status', params.status);
  if (params.crm) query.append('crm', params.crm);
  if (params.data) query.append('data', params.data);
  const url = `${apiUrl}/api/v1/guias${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await axios.get<{
    procedures: GuideProcedure[];
    total: number;
    page: number;
    pageSize: number;
  }>(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

export async function deleteGuide(numeroGuia: string, token: string): Promise<void> {
  await axios.delete(`${apiUrl}/api/v1/guias/${numeroGuia}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function uploadGuides(files: File[], token: string): Promise<any> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file, file.name));
  const res = await axios.post(`${apiUrl}/api/v1/guias/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data; // results: [{ filename, success, ... }]
}
