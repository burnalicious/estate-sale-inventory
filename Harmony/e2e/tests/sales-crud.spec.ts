import { test, expect } from '@playwright/test';
import { login, createSaleViaAPI, acceptNextDialog, deleteSaleViaAPI } from './helpers';

test.describe('Sales CRUD', () => {
  const createdSaleIds: number[] = [];

  test.afterAll(async ({ request }) => {
    for (const id of createdSaleIds) {
      await deleteSaleViaAPI(request, id).catch(() => {});
    }
  });

  test('sales list page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Estate Sales' })).toBeVisible();
  });

  test('create a new sale via form', async ({ page, request }) => {
    const name = `E2E Sale ${Date.now()}`;
    await page.goto('/');
    await login(page);
    await page.getByRole('link', { name: '+ New Sale' }).click();

    await page.getByLabel('Sale Name').fill(name);
    await page.getByLabel('Address Line 1').fill('456 Oak Ave');
    await page.getByLabel('City').fill('Dallas');
    await page.getByLabel('State').fill('TX');
    await page.getByLabel('Zip Code').fill('75201');
    await page.getByLabel('Sale Date').fill('2026-06-15');
    await page.getByRole('button', { name: 'Create Sale' }).click();

    // Should navigate to sale detail page
    await expect(page.getByRole('heading', { name })).toBeVisible();

    // Track for cleanup — extract sale ID from URL
    const saleId = Number(page.url().split('/sales/')[1]);
    createdSaleIds.push(saleId);
  });

  test('view sale detail page', async ({ page, request }) => {
    const name = `Detail Sale ${Date.now()}`;
    const saleId = await createSaleViaAPI(request, name);
    createdSaleIds.push(saleId);

    await page.goto(`/sales/${saleId}`);
    await expect(page.getByRole('heading', { name })).toBeVisible();
    await expect(page.getByText('Austin')).toBeVisible();
    await expect(page.getByText('ACTIVE')).toBeVisible();
  });

  test('edit a sale', async ({ page, request }) => {
    const saleId = await createSaleViaAPI(request, `Edit Me ${Date.now()}`);
    createdSaleIds.push(saleId);

    await page.goto(`/sales/${saleId}/edit`);
    await login(page);

    await expect(page.getByLabel('Sale Name')).toBeVisible();
    const newName = `Edited Sale ${Date.now()}`;
    await page.getByLabel('Sale Name').fill(newName);
    await page.getByRole('button', { name: 'Update Sale' }).click();

    // After update, navigates to sale detail
    await expect(page.getByText(newName)).toBeVisible({ timeout: 10000 });
  });

  test('delete a sale', async ({ page, request }) => {
    const name = `Delete Me ${Date.now()}`;
    const saleId = await createSaleViaAPI(request, name);
    // No need to track — the test itself deletes it

    await page.goto(`/sales/${saleId}`);
    await login(page);

    acceptNextDialog(page);
    await page.getByRole('button', { name: 'Delete' }).click();

    // Should navigate back to sales list
    await expect(page.getByRole('heading', { name: 'Estate Sales' })).toBeVisible();
  });

  test('filter sales by status', async ({ page, request }) => {
    const saleId = await createSaleViaAPI(request, `Active Sale ${Date.now()}`);
    createdSaleIds.push(saleId);

    await page.goto('/');

    await page.getByRole('button', { name: 'Active' }).click();
    await expect(page.locator('.card')).not.toHaveCount(0);

    await page.getByRole('button', { name: 'Completed' }).click();
    // May or may not have results, but should not error
    await expect(page.locator('.error')).not.toBeVisible();
  });

  test('navigating to nonexistent sale shows error', async ({ page }) => {
    await page.goto('/sales/999999');
    await expect(page.locator('.error')).toBeVisible();
  });
});
