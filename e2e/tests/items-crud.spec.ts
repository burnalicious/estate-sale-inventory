import { test, expect } from '@playwright/test';
import { login, field, createSaleViaAPI, createItemViaAPI, acceptNextDialog } from './helpers';

test.describe('Items CRUD', () => {
  let saleId: number;

  test.beforeEach(async ({ request }) => {
    saleId = await createSaleViaAPI(request);
  });

  test('add an item with all fields', async ({ page }) => {
    await page.goto(`/sales/${saleId}`);
    await login(page);

    await page.getByRole('link', { name: '+ Add Item' }).click();
    await field(page, 'Item Name').fill('Antique Oak Dresser');
    await field(page, 'Description').fill('Beautiful 1920s oak dresser');
    await field(page, 'Price').fill('275');
    await field(page, 'Category').fill('Furniture');
    await field(page, 'Condition').selectOption('GOOD');
    await field(page, 'Status').selectOption('AVAILABLE');
    await page.getByRole('button', { name: 'Add Item' }).click();

    // Should navigate back to sale detail and show the item
    const itemCard = page.locator('.items-list .card').filter({ hasText: 'Antique Oak Dresser' });
    await expect(itemCard).toBeVisible();
    await expect(itemCard).toContainText('$275.00');
    await expect(itemCard).toContainText('Furniture');
  });

  test('add an item with minimal fields', async ({ page }) => {
    await page.goto(`/sales/${saleId}`);
    await login(page);

    await page.getByRole('link', { name: '+ Add Item' }).click();
    await field(page, 'Item Name').fill('Mystery Box');
    await field(page, 'Price').fill('5');
    await page.getByRole('button', { name: 'Add Item' }).click();

    const itemCard = page.locator('.items-list .card').filter({ hasText: 'Mystery Box' });
    await expect(itemCard).toBeVisible();
    await expect(itemCard).toContainText('$5.00');
  });

  test('edit an item', async ({ page, request }) => {
    await createItemViaAPI(request, saleId, { name: 'Old Name', price: 50 });
    await page.goto(`/sales/${saleId}`);
    await login(page);

    // Click the Edit link inside the item card (not the sale Edit button)
    await page.locator('.items-list .card').first().getByRole('link', { name: 'Edit' }).click();
    await field(page, 'Item Name').fill('Updated Name');
    await field(page, 'Price').fill('99');
    await field(page, 'Status').selectOption('SOLD');
    await page.getByRole('button', { name: 'Update Item' }).click();

    const itemCard = page.locator('.items-list .card').filter({ hasText: 'Updated Name' });
    await expect(itemCard).toBeVisible();
    await expect(itemCard).toContainText('$99.00');
    await expect(itemCard).toContainText('SOLD');
  });

  test('delete an item', async ({ page, request }) => {
    const itemName = `Delete Item ${Date.now()}`;
    await createItemViaAPI(request, saleId, { name: itemName });
    await page.goto(`/sales/${saleId}`);
    await login(page);

    await expect(page.getByText(itemName)).toBeVisible();
    acceptNextDialog(page);
    await page.getByRole('button', { name: 'Delete' }).first().click();

    await expect(page.getByText(itemName)).not.toBeVisible();
  });

  test('add item with tags', async ({ page }) => {
    await page.goto(`/sales/${saleId}`);
    await login(page);

    await page.getByRole('link', { name: '+ Add Item' }).click();
    await field(page, 'Item Name').fill('Tagged Vase');
    await field(page, 'Price').fill('40');
    await field(page, 'Tags').fill('antique, ceramic, blue');
    await page.getByRole('button', { name: 'Add Item' }).click();

    await expect(page.getByText('Tagged Vase')).toBeVisible();
    await expect(page.getByText('antique')).toBeVisible();
    await expect(page.getByText('ceramic')).toBeVisible();
    await expect(page.getByText('blue')).toBeVisible();
  });

  test('add items with every condition', async ({ page }) => {
    const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];
    await page.goto(`/sales/${saleId}`);
    await login(page);

    for (const cond of conditions) {
      await page.getByRole('link', { name: '+ Add Item' }).click();
      await field(page, 'Item Name').fill(`${cond} Item`);
      await field(page, 'Price').fill('10');
      await field(page, 'Condition').selectOption(cond);
      await page.getByRole('button', { name: 'Add Item' }).click();
      await expect(page.getByText(`${cond} Item`)).toBeVisible();
    }
  });

  test('add items with every status', async ({ page }) => {
    const statuses = ['AVAILABLE', 'SOLD', 'WITHDRAWN'];
    await page.goto(`/sales/${saleId}`);
    await login(page);

    for (const st of statuses) {
      await page.getByRole('link', { name: '+ Add Item' }).click();
      await field(page, 'Item Name').fill(`${st} Item`);
      await field(page, 'Price').fill('10');
      await field(page, 'Status').selectOption(st);
      await page.getByRole('button', { name: 'Add Item' }).click();
      await expect(page.getByText(`${st} Item`)).toBeVisible();
    }
  });
});
