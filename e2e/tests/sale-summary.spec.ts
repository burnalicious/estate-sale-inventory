import { test, expect } from '@playwright/test';
import { createSaleViaAPI, createItemViaAPI } from './helpers';

test.describe('Sale Summary', () => {
  test('summary shows correct counts and values', async ({ page, request }) => {
    const saleId = await createSaleViaAPI(request);

    await createItemViaAPI(request, saleId, { name: 'Chair', price: 100, status: 'AVAILABLE' });
    await createItemViaAPI(request, saleId, { name: 'Table', price: 200, status: 'AVAILABLE' });
    await createItemViaAPI(request, saleId, { name: 'Lamp', price: 50, status: 'SOLD' });
    await createItemViaAPI(request, saleId, { name: 'Rug', price: 75, status: 'WITHDRAWN' });

    await page.goto(`/sales/${saleId}`);

    // Use the summary cards — each has a label div with specific text
    const summaryCards = page.locator('.summary-bar .card');
    await expect(summaryCards.filter({ hasText: 'Total Items' })).toContainText('4');
    await expect(summaryCards.filter({ hasText: 'Total Value' })).toContainText('$425.00');
    await expect(summaryCards.filter({ hasText: 'Available' })).toContainText('2');
    await expect(summaryCards.filter({ hasText: 'Withdrawn' })).toContainText('1');
  });
});
