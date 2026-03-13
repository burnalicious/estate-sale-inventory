import type { Sale, SaleCreate, Item, ItemCreate, SaleStatus, ItemStatus } from './types';

const BASE = 'http://localhost:8080/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
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
  },
  items: {
    list: (saleId: number, status?: ItemStatus, category?: string) => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (category) params.set('category', category);
      const qs = params.toString();
      return request<Item[]>(`/sales/${saleId}/items${qs ? `?${qs}` : ''}`);
    },
    get: (saleId: number, itemId: number) =>
      request<Item>(`/sales/${saleId}/items/${itemId}`),
    create: (saleId: number, data: ItemCreate) =>
      request<Item>(`/sales/${saleId}/items`, { method: 'POST', body: JSON.stringify(data) }),
    update: (saleId: number, itemId: number, data: ItemCreate) =>
      request<Item>(`/sales/${saleId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (saleId: number, itemId: number) =>
      request<void>(`/sales/${saleId}/items/${itemId}`, { method: 'DELETE' }),
  },
};
