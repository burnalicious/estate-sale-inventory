import { type Page, type Locator, type APIRequestContext } from '@playwright/test';

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
      Authorization: 'Basic ' + btoa('admin:admin'),
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
      Authorization: 'Basic ' + btoa('admin:admin'),
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

/** Must be called BEFORE clicking the delete button */
export function acceptNextDialog(page: Page) {
  page.once('dialog', (d) => d.accept());
}

/** Find an input/select/textarea by its label text (labels aren't linked with for=) */
export function field(page: Page, labelText: string): Locator {
  return page.locator('.form-group').filter({ hasText: labelText }).locator('input, select, textarea').first();
}
