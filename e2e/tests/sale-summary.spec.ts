import { test, expect } from '@playwright/test';
import { createSaleViaAPI, createItemViaAPI, deleteSaleViaAPI } from './helpers';

test.describe('Sale Summary', () => {
  test('summary shows correct counts and values', async ({ page, request }) => {
    const saleId = await createSaleViaAPI(request);

    await createItemViaAPI(request, saleId, { name: 'Chair', price: 100, status: 'AVAILABLE' });
    await createItemViaAPI(request, saleId, { name: 'Table', price: 200, status: 'AVAILABLE' });
    await createItemViaAPI(request, saleId, { name: 'Lamp', price: 50, status: 'SOLD' });
    await createItemViaAPI(request, saleId, { name: 'Rug', price: 75, status: 'WITHDRAWN' });

    await page.goto(`/sales/${saleId}`);

    await expect(page.getByTestId('summary-total-items')).toContainText('4');
    await expect(page.getByTestId('summary-total-value')).toContainText('$425.00');
    await expect(page.getByTestId('summary-available')).toContainText('2');
    await expect(page.getByTestId('summary-withdrawn')).toContainText('1');

    // Cleanup
    await deleteSaleViaAPI(request, saleId);
  });
});
