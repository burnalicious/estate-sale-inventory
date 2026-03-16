import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../api/client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

function noContentResponse() {
  return Promise.resolve({
    ok: true,
    status: 204,
    json: () => Promise.reject(),
  } as Response);
}

beforeEach(() => {
  mockFetch.mockReset();
  api.auth.logout();
});

describe('api.sales', () => {
  it('list calls GET /sales', async () => {
    mockFetch.mockReturnValue(jsonResponse([]));
    const result = await api.sales.list();
    expect(result).toEqual([]);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/sales',
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it('list with status filter', async () => {
    mockFetch.mockReturnValue(jsonResponse([]));
    await api.sales.list('ACTIVE');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/sales?status=ACTIVE',
      expect.any(Object)
    );
  });

  it('get calls GET /sales/:id', async () => {
    mockFetch.mockReturnValue(jsonResponse({ id: 1, name: 'Test' }));
    const result = await api.sales.get(1);
    expect(result.name).toBe('Test');
  });

  it('create calls POST /sales', async () => {
    mockFetch.mockReturnValue(jsonResponse({ id: 1 }));
    await api.sales.create({
      name: 'New', address1: '123', city: 'A', state: 'TX',
      zipCode: '78701', saleDate: '2026-01-01', status: 'UPCOMING'
    });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('http://localhost:8080/api/sales');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body).name).toBe('New');
  });

  it('delete calls DELETE /sales/:id', async () => {
    mockFetch.mockReturnValue(noContentResponse());
    await api.sales.delete(5);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('http://localhost:8080/api/sales/5');
    expect(opts.method).toBe('DELETE');
  });
});

describe('api.items', () => {
  it('list calls GET with pagination params', async () => {
    mockFetch.mockReturnValue(jsonResponse({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 }));
    await api.items.list(1, undefined, undefined, 0, 20);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('/sales/1/items');
    expect(url).toContain('page=0');
    expect(url).toContain('size=20');
  });

  it('list with status and category filters', async () => {
    mockFetch.mockReturnValue(jsonResponse({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 20 }));
    await api.items.list(1, 'SOLD', 'Furniture');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('status=SOLD');
    expect(url).toContain('category=Furniture');
  });
});

describe('auth', () => {
  it('login sets auth header on success', async () => {
    mockFetch.mockReturnValue(jsonResponse([]));
    const ok = await api.auth.login('admin', 'admin');
    expect(ok).toBe(true);
    expect(api.auth.isLoggedIn()).toBe(true);
  });

  it('includes auth header after login', async () => {
    mockFetch.mockReturnValue(jsonResponse([]));
    await api.auth.login('admin', 'admin');

    mockFetch.mockReturnValue(jsonResponse([]));
    await api.sales.list();
    const headers = mockFetch.mock.calls[1][1].headers;
    expect(headers.Authorization).toContain('Basic');
  });

  it('logout clears auth', () => {
    api.auth.logout();
    expect(api.auth.isLoggedIn()).toBe(false);
  });
});
