import { test, expect } from '@playwright/test';

test.describe('Home Page Basic UI', () => {

// Needs to run before every test
test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:4200/');
});

  test('should show the correct page title', async({ page}) => {
    // Will check if "Want to start a game" is visible on the screen
    const heading = page.getByText('Want to start a game?');
    await expect(heading).toBeVisible();
  });

  test('post game button should have correct text', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Post your game' });
    await expect(button).toHaveText('Post your game');
  });
  
  test('should only have one main heading', async ({ page }) => {
    const prompts = page.getByText('Want to start a game?');
    await expect(prompts).toHaveCount(1);
  });
  
  test('should have a working "Post your game" button', async ({ page }) => {
    const postButton = page.locator('button', { hasText: 'Post your game'});
    //Verify the button is visible
    await expect(postButton).toBeVisible();
    await expect(postButton).toBeEnabled();
  });
  
  test('should navigate to the post-game page when clicked', async ({ page }) => {
    const postGameBtn = page.getByRole('button', { name: 'Post your game' });
    await postGameBtn.click();
    // Checks to see if the URL changed to /post-game
    await expect(page).toHaveURL(/.*post-game/);
  });
});
