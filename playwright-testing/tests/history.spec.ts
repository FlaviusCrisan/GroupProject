import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Runs before all tests in order to set page past login
test.describe('History Page', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await page.goto('http://localhost:4200');
    await page.getByPlaceholder('Enter email or username').fill('pagimuly@fxzig.com');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/#\/factor-one/);

    await page.locator('input[type="password"]').fill('tempAccount1234_');
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
    await page.waitForTimeout(30000);
    await expect(page).toHaveURL(/history/);
    await expect(page).not.toHaveURL(/login|factor-one|factor-two/i);
  });

  test('clicking username/avatar navigates to the user profile page', async () => {
    await page.goto('http://localhost:4200/history');
    const acceptedList = page.locator('app-post-list').nth(1);
    const acceptedCards = acceptedList.locator('.post-card');
    if ((await acceptedCards.count()) === 0) {
      await expect(
        acceptedList.locator('h2', { hasText: 'No matches found' })
      ).toBeVisible();
      return;
    }
    const username = acceptedList.locator('.username').first();
    await expect(username).toBeVisible();
    await username.click();
    await expect(page).toHaveURL(/\/user\/\d+/);
  });
  
  test('posts or “No matches found” are shown', async () => {
    await page.goto('http://localhost:4200/history');
    const postLists = page.locator('app-post-list');
    const requestedList = postLists.first();
    const requestedCards = requestedList.locator('.post-card');
    const requestedCount = await requestedCards.count();
    if (requestedCount === 0) {
      await expect(
        requestedList.locator('h2', { hasText: 'No matches found' })
      ).toBeVisible();
      return;
    }
    await expect(requestedCards.first()).toBeVisible();
    await expect(requestedList.locator('.post-title').first()).toBeVisible();
    await expect(requestedList.locator('.username').first()).toBeVisible();
  });

  test('authenticated user should not see login form', async () => {
    await page.goto('http://localhost:4200/history');
    await expect(page.locator('input[placeholder="Enter email or username"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/history/);
  });
});
