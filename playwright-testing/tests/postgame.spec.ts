import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Runs before all tests in order to set page past login
test.describe('Post Game', () => {
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

  test('UI should be visible to the user', async () => {
    await page.goto('http://localhost:4200/post-game');
    await expect(page).toHaveURL(/post-game/);
  
    await expect(page.getByPlaceholder('title')).toBeVisible();
    await expect(page.getByPlaceholder('description')).toBeVisible();
    await expect(page.getByRole('button', { name: /post/i })).toBeVisible();
  });

  test('post-game page should have correct url', async () => {
    await page.goto('http://localhost:4200/post-game');
    await expect(page).toHaveURL(/post-game/);
  });
  
  test('title input should be empty on first load', async () => {
    await page.goto('http://localhost:4200/post-game');
    await expect(page.getByPlaceholder('title')).toHaveValue('');
  });
  
  test('description input should be empty on first load', async () => {
    await page.goto('http://localhost:4200/post-game');
    await expect(page.getByPlaceholder('description')).toHaveValue('');
  });
  
  test('user can type into title input', async () => {
    await page.goto('http://localhost:4200/post-game');
    const title = page.getByPlaceholder('title');
    await title.fill('Fortnite');
    await expect(title).toHaveValue('Fortnite');
  });
  
  test('user can type into description input', async () => {
    await page.goto('http://localhost:4200/post-game');
    const description = page.getByPlaceholder('description');
    await description.fill('Casual match');
    await expect(description).toHaveValue('Casual match');
  });
  
  test('post button should be enabled when page loads', async () => {
    await page.goto('http://localhost:4200/post-game');
    await expect(page.getByRole('button', { name: /post/i })).toBeEnabled();
  });
  
  test('title and description should stay visible after reload', async () => {
    await page.goto('http://localhost:4200/post-game');
    await page.reload();
    await expect(page.getByPlaceholder('title')).toBeVisible();
    await expect(page.getByPlaceholder('description')).toBeVisible();
  });

  test('title field should clear correctly', async () => {
    await page.goto('http://localhost:4200/post-game');
    const title = page.getByPlaceholder('title');
    await title.fill('Temporary title');
    await title.clear();
    await expect(title).toHaveValue('');
  });

  test('description field should clear correctly', async () => {
    await page.goto('http://localhost:4200/post-game');
    const description = page.getByPlaceholder('description');
    await description.fill('Temporary description');
    await description.clear();
    await expect(description).toHaveValue('');
  });

  test('post button should be visible after filling fields', async () => {
    await page.goto('http://localhost:4200/post-game');
    await page.getByPlaceholder('title').fill('Fortnite');
    await page.getByPlaceholder('description').fill('Casual match');
    await expect(page.getByRole('button', { name: /post/i })).toBeVisible();
  });

  test('postgame page should load within 10 seconds', async () => {
    const start = Date.now();
    await page.goto('http://localhost:4200/post-game');
    await expect(page.getByText('Create a new post')).toBeVisible();
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10000);
  });

  test('page should stay authenticated during long idle period', async () => {
    await page.goto('http://localhost:4200/post-game');
    await page.waitForTimeout(15000);
    await expect(page).toHaveURL('http://localhost:4200/post-game');
    await expect(page).not.toHaveURL(/login|factor-one|factor-two/i);
  });
});
