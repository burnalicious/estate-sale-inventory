import { test, expect } from '@playwright/test';
import { createSaleViaAPI, createItemViaAPI } from './helpers';

test.describe('Items Filtering & Pagination', () => {
  let saleId: number;

  test.beforeEach(async ({ request }) => {
    saleId = await createSaleViaAPI(request);
  });

  test('filter items by status', async ({ page, request }) => {
    await createItemViaAPI(request, saleId, { name: 'Available Thing', status: 'AVAILABLE' });
    await createItemViaAPI(request, saleId, { name: 'Sold Thing', status: 'SOLD' });
    await createItemViaAPI(request, saleId, { name: 'Withdrawn Thing', status: 'WITHDRAWN' });

    await page.goto(`/sales/${saleId}`);

    // All items visible initially
    await expect(page.getByText('Available Thing')).toBeVisible();
    await expect(page.getByText('Sold Thing')).toBeVisible();
    await expect(page.getByText('Withdrawn Thing')).toBeVisible();

    // Filter to AVAILABLE only
    await page.getByRole('button', { name: 'AVAILABLE' }).click();
    await expect(page.getByText('Available Thing')).toBeVisible();
    await expect(page.getByText('Sold Thing')).not.toBeVisible();
    await expect(page.getByText('Withdrawn Thing')).not.toBeVisible();

    // Filter to SOLD only
    await page.getByRole('button', { name: 'SOLD' }).click();
    await expect(page.getByText('Sold Thing')).toBeVisible();
    await expect(page.getByText('Available Thing')).not.toBeVisible();

    // Back to all
    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.getByText('Available Thing')).toBeVisible();
    await expect(page.getByText('Sold Thing')).toBeVisible();
  });

  test('filter items by category', async ({ page, request }) => {
    await createItemViaAPI(request, saleId, { name: 'Oak Table', category: 'Furniture' });
    await createItemViaAPI(request, saleId, { name: 'Gold Ring', category: 'Jewelry' });

    await page.goto(`/sales/${saleId}`);

    await page.getByPlaceholder('Filter by category').fill('Furniture');
    await expect(page.getByText('Oak Table')).toBeVisible();
    await expect(page.getByText('Gold Ring')).not.toBeVisible();

    await page.getByPlaceholder('Filter by category').fill('Jewelry');
    await expect(page.getByText('Gold Ring')).toBeVisible();
    await expect(page.getByText('Oak Table')).not.toBeVisible();
  });

  test('clear filters resets view', async ({ page, request }) => {
    await createItemViaAPI(request, saleId, { name: 'Filter Test', status: 'SOLD', category: 'Art' });
    await createItemViaAPI(request, saleId, { name: 'Other Item', status: 'AVAILABLE' });

    await page.goto(`/sales/${saleId}`);
    await page.getByRole('button', { name: 'SOLD' }).click();
    await expect(page.getByText('Other Item')).not.toBeVisible();

    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByText('Filter Test')).toBeVisible();
    await expect(page.getByText('Other Item')).toBeVisible();
  });

  test('pagination works with many items', async ({ page, request }) => {
    // Create 25 items (default page size is 20)
    for (let i = 1; i <= 25; i++) {
      await createItemViaAPI(request, saleId, { name: `Paginated Item ${i}`, price: i });
    }

    await page.goto(`/sales/${saleId}`);
    await expect(page.getByText('Page 1 of 2')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Page 2 of 2')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
