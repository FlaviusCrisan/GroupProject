import { test, expect } from '@playwright/test';


test.describe('Post Game', () => {

    test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/post-game');
    });

    test('UI should be visible to the user', async ({ page }) => {

        await expect(page.getByPlaceholder('title')).toBeVisible();
        await expect(page.getByPlaceholder('description')).toBeVisible();
        await expect(page.getByRole('button', { name: 'post' })).toBeVisible();
    });



});
