import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Runs before all tests in order to set page past login
test.describe('History Page', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('http://localhost:4200');
    await page.getByPlaceholder('Enter email or username').fill('lamudu@denipl.com');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/#\/factor-one/);

    await page.locator('input[type="password"]').fill('pAsSwOrD123_');
    await page.getByRole('button', { name: /continue|sign in|login/i }).click();
    await page.waitForTimeout(5000);

    await expect(page).toHaveURL('http://localhost:4200/home');
  });

  test.afterAll(async () => {
    await page.context().close();
  });
  
  test('should navigate to history page directly', async () => {
    await page.goto('http://localhost:4200/history');
    await expect(page).toHaveURL(/history/);
  });

  test('history page should show History text', async () => {
    await page.goto('http://localhost:4200/history');
    await expect(page.locator('p', { hasText: 'History' })).toBeVisible();
  });
  
  test('history page should show the requested and accepted games history', async () => {
    await page.goto('http://localhost:4200/history');
    await expect(page.getByText('Requested')).toBeVisible();
    await expect(page.getByText('Accepted')).toBeVisible();
  });

  test('history still loads after refresh', async () => {
    await page.goto('http://localhost:4200/history');
    await page.reload();
    await expect(page).toHaveURL(/history/);
  });

  test('page should load within acceptable time', async () => {
    const start = Date.now();
    await page.goto('http://localhost:4200/history');
    await expect(page.locator('p', { hasText: 'History' }).first()).toBeVisible();
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(8000);
  });
  
  test('should be stable across multiple reloads', async () => {
    await page.goto('http://localhost:4200/history');
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await expect(page).toHaveURL(/history/);
      await expect(page.locator('p', { hasText: 'History' }).first()).toBeVisible();
    }
  });

  test('page should stay authenticated during long idle period', async () => {
    await page.goto('http://localhost:4200/history');
    await page.waitForTimeout(50000);
    await expect(page).toHaveURL(/history/);
    await expect(page).not.toHaveURL(/login|factor-one|factor-two/i);
  });
});
