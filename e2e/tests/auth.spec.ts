import { test, expect } from '@playwright/test';
import { login, field } from './helpers';

test.describe('Authentication', () => {
  test('homepage loads with app title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Estate Sale Inventory')).toBeVisible();
  });

  test('login button is visible when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('successful login shows logged-in state', async ({ page }) => {
    await page.goto('/');
    await login(page);
    await expect(page.getByText('Logged in as admin')).toBeVisible();
  });

  test('wrong credentials show error', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByPlaceholder('Username').fill('admin');
    await page.getByPlaceholder('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('logout clears logged-in state', async ({ page }) => {
    await page.goto('/');
    await login(page);
    await expect(page.getByText('Logged in as')).toBeVisible();
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('creating a sale without auth shows error', async ({ page }) => {
    await page.goto('/sales/new');
    await field(page, 'Sale Name').fill('Unauthorized Sale');
    await field(page, 'Address Line 1').fill('123 Main');
    await field(page, 'City').fill('Austin');
    await field(page, 'State').fill('TX');
    await field(page, 'Zip Code').fill('78701');
    await field(page, 'Sale Date').fill('2026-05-01');
    await page.getByRole('button', { name: 'Create Sale' }).click();
    await expect(page.locator('.error')).toBeVisible();
  });
});
