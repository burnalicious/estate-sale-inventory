import type { Sale, SaleCreate, Item, ItemCreate, SaleStatus, ItemStatus, PaginatedResponse, SaleSummary } from './types';

const BASE = 'http://localhost:8080/api';

let authHeader: string | null = null;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) headers['Authorization'] = authHeader;
  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      authHeader = 'Basic ' + btoa(`${username}:${password}`);
      try {
        await request<Sale[]>('/sales');
        return true;
      } catch {
        authHeader = null;
        return false;
      }
    },
    logout: () => { authHeader = null; },
    isLoggedIn: () => authHeader !== null,
  },
  sales: {
    list: (status?: SaleStatus) =>
      request<Sale[]>(`/sales${status ? `?status=${status}` : ''}`),
    get: (id: number) =>
      request<Sale>(`/sales/${id}`),
    create: (data: SaleCreate) =>
      request<Sale>('/sales', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: SaleCreate) =>
      request<Sale>(`/sales/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<void>(`/sales/${id}`, { method: 'DELETE' }),
    summary: (id: number) =>
      request<SaleSummary>(`/sales/${id}/summary`),
  },
  items: {
    list: (saleId: number, status?: ItemStatus, category?: string, page: number = 0, size: number = 20) => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (category) params.set('category', category);
      params.set('page', String(page));
      params.set('size', String(size));
      return request<PaginatedResponse<Item>>(`/sales/${saleId}/items?${params.toString()}`);
    },
    get: (saleId: number, itemId: number) =>
      request<Item>(`/sales/${saleId}/items/${itemId}`),
    create: (saleId: number, data: ItemCreate) => {
      const body = { ...data, tags: data.tags?.join(',') || null };
      return request<Item>(`/sales/${saleId}/items`, { method: 'POST', body: JSON.stringify(body) });
    },
    update: (saleId: number, itemId: number, data: ItemCreate) => {
      const body = { ...data, tags: data.tags?.join(',') || null };
      return request<Item>(`/sales/${saleId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify(body) });
    },
    delete: (saleId: number, itemId: number) =>
      request<void>(`/sales/${saleId}/items/${itemId}`, { method: 'DELETE' }),
    uploadPhoto: async (saleId: number, itemId: number, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${BASE}/sales/${saleId}/items/${itemId}/photo`, {
        method: 'POST',
        headers: authHeader ? { 'Authorization': authHeader } : {},
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Upload failed: ${res.status}`);
      }
      return res.json() as Promise<Item>;
    },
  },
};
