import { type Page, type APIRequestContext } from '@playwright/test';

const AUTH_HEADER = 'Basic ' + btoa('admin:admin');

export async function login(page: Page) {
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByPlaceholder('Username').fill('admin');
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.getByText('Logged in as').waitFor();
}

export async function createSaleViaAPI(request: APIRequestContext, name?: string) {
  const response = await request.post('http://localhost:8080/api/sales', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH_HEADER,
    },
    data: {
      name: name || `Test Sale ${Date.now()}`,
      address1: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      saleDate: '2026-05-01',
      status: 'ACTIVE',
    },
  });
  const body = await response.json();
  return body.id as number;
}

export async function createItemViaAPI(
  request: APIRequestContext,
  saleId: number,
  overrides?: Record<string, unknown>,
) {
  const response = await request.post(`http://localhost:8080/api/sales/${saleId}/items`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH_HEADER,
    },
    data: {
      name: `Item ${Date.now()}`,
      price: 100.0,
      status: 'AVAILABLE',
      ...overrides,
    },
  });
  const body = await response.json();
  return body.id as number;
}

export async function deleteSaleViaAPI(request: APIRequestContext, saleId: number) {
  await request.delete(`http://localhost:8080/api/sales/${saleId}`, {
    headers: { Authorization: AUTH_HEADER },
  });
}

/** Must be called BEFORE clicking the delete button */
export function acceptNextDialog(page: Page) {
  page.once('dialog', (d) => d.accept());
}
