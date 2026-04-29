import { test, expect, Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Runs before all tests in order to set page past login
test.describe('Home Page Basic UI', () => {
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

  test('should show the correct page title', async () => {
    await expect(page.getByText('Want to start a game?')).toBeVisible();
  });

  test('post game button should have correct text', async () => {
    await expect(page.getByRole('button', { name: 'Post your game' })).toHaveText('Post your game');
  });

  test('should only have one main heading', async () => {
    const prompts = page.getByText('Want to start a game?');
    await expect(prompts).toHaveCount(1);
  });
  
  test('should have a working "Post your game" button', async () => {
    const postButton = page.locator('button', { hasText: 'Post your game' });
    //Verify the button is visible
    await expect(postButton).toBeVisible();
    await expect(postButton).toBeEnabled();
  });
  
  test('should navigate to the post-game page when clicked', async () => {
    const postGameBtn = page.getByRole('button', { name: 'Post your game' });
    await postGameBtn.click();
    // Checks to see if the URL changed to /post-game
    await expect(page).toHaveURL(/.*post-game/);
  });

  test('main heading should contain start game text', async () => {
    await page.goto('http://localhost:4200/home');
    const heading = page.getByText('Want to start a game?');
    await expect(heading).toContainText('start a game');
  });
  
  test('post game button should stay visible on home page reload', async () => {
    await page.goto('http://localhost:4200/home');
    await page.reload();
    const button = page.getByRole('button', { name: 'Post your game' });
    await expect(button).toBeVisible();
  });
  
  test('post game button should be present only once', async () => {
    await page.goto('http://localhost:4200/home');
    const button = page.getByRole('button', { name: 'Post your game' });
    await expect(button).toHaveCount(1);
  });
  
  test('returning to home manually should show heading again', async () => {
    await page.goto('http://localhost:4200/post-game');
    await page.goto('http://localhost:4200/home');
    await expect(page.getByText('Want to start a game?')).toBeVisible();
  });

  test('home page should load within 10 seconds', async () => {
    const start = Date.now();
    await page.goto('http://localhost:4200/home');
    await expect(page.getByText('Want to start a game?')).toBeVisible();
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10000);
  });

  test('page should stay authenticated during long idle period', async () => {
    await page.goto('http://localhost:4200/home');
    await page.waitForTimeout(15000);
    await expect(page).toHaveURL('http://localhost:4200/home');
    await expect(page).not.toHaveURL(/login|factor-one|factor-two/i);
  });

  test('clicking username/avatar navigates to the user profile page', async () => {
    await page.goto('http://localhost:4200/home');
    const postList = page.locator('app-post-list').first();
    const postCards = postList.locator('.post-card');
    if ((await postCards.count()) === 0) {
      await expect(
        postList.locator('h2', { hasText: 'No matches found' })
      ).toBeVisible();
      return;
    }
    const username = postList.locator('.username').first();
    await expect(username).toBeVisible();
    await username.click();
    await expect(page).toHaveURL(/\/user\/\d+/);
  });

  test('filters UI is visible', async () => {
    await page.goto('http://localhost:4200/home');
    await expect(page.locator('app-post-info-selectors')).toBeVisible();
  });

  test('posts or “No matches found” are shown', async () => {
    await page.goto('http://localhost:4200/home');
    const postList = page.locator('app-post-list').first();
    const postCards = postList.locator('.post-card');
    const cardsCount = await postCards.count();
    if (cardsCount === 0) {
      await expect(postList.locator('h2', { hasText: 'No matches found' })).toBeVisible();
    } else {
      await expect(postCards.first()).toBeVisible();
    }
  });
});
