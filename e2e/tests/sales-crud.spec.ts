import { test, expect } from '@playwright/test';
import { login, field, createSaleViaAPI, acceptNextDialog } from './helpers';

test.describe('Sales CRUD', () => {
  test('sales list page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Estate Sales' })).toBeVisible();
  });

  test('create a new sale via form', async ({ page }) => {
    const name = `E2E Sale ${Date.now()}`;
    await page.goto('/');
    await login(page);
    await page.getByRole('link', { name: '+ New Sale' }).click();

    await field(page, 'Sale Name').fill(name);
    await field(page, 'Address Line 1').fill('456 Oak Ave');
    await field(page, 'City').fill('Dallas');
    await field(page, 'State').fill('TX');
    await field(page, 'Zip Code').fill('75201');
    await field(page, 'Sale Date').fill('2026-06-15');
    await page.getByRole('button', { name: 'Create Sale' }).click();

    // Should navigate to sale detail page
    await expect(page.getByRole('heading', { name })).toBeVisible();
  });

  test('view sale detail page', async ({ page, request }) => {
    const name = `Detail Sale ${Date.now()}`;
    const saleId = await createSaleViaAPI(request, name);
    await page.goto(`/sales/${saleId}`);
    await expect(page.getByRole('heading', { name })).toBeVisible();
    await expect(page.getByText('Austin')).toBeVisible();
    await expect(page.getByText('ACTIVE')).toBeVisible();
  });

  test('edit a sale', async ({ page, request }) => {
    const saleId = await createSaleViaAPI(request, `Edit Me ${Date.now()}`);
    await page.goto(`/sales/${saleId}/edit`);
    await login(page);

    await expect(field(page, 'Sale Name')).toBeVisible();
    const newName = `Edited Sale ${Date.now()}`;
    await field(page, 'Sale Name').fill(newName);
    await page.getByRole('button', { name: 'Update Sale' }).click();

    // After update, navigates to sale detail
    await expect(page.getByText(newName)).toBeVisible({ timeout: 10000 });
  });

  test('delete a sale', async ({ page, request }) => {
    const name = `Delete Me ${Date.now()}`;
    const saleId = await createSaleViaAPI(request, name);
    await page.goto(`/sales/${saleId}`);
    await login(page);

    acceptNextDialog(page);
    await page.getByRole('button', { name: 'Delete' }).click();

    // Should navigate back to sales list
    await expect(page.getByRole('heading', { name: 'Estate Sales' })).toBeVisible();
  });

  test('filter sales by status', async ({ page, request }) => {
    await createSaleViaAPI(request, `Active Sale ${Date.now()}`);
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
