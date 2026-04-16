import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {

    test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
    });
    
    test('page loads with correct button', async ({ page }) => {
        const button = page.getByRole('button', {name: 'Continue' });
        await expect(button).toBeVisible();
    });
    
    test('logs in through email + password flow', async ({ page }) => {
        await page.goto('http://localhost:4200');
      
        await page.getByPlaceholder('Enter email or username').fill('lamudu@denipl.com');
        await page.getByRole('button', { name: 'Continue' }).click();
      
        await expect(page).toHaveURL(/#\/factor-one/);
        await page.locator('input[type="password"]').fill('pAsSwOrD123_');
        await page.getByRole('button', { name: /continue|sign in|login/i }).click();
        await expect(page).toHaveURL(/#\/factor-two/);
        await page.pause();
        await expect(page).toHaveURL('http://localhost:4200/home');
      });

    test('user is able to type in the email field', async ({ page }) => {
        const input = page.getByPlaceholder('Enter email or username');
        await input.fill('test@test.com');
        await expect(input).toHaveValue('test@test.com');
    });

    test('sign up link is visible', async ({ page }) => {
        await expect(page.getByText('Sign up')).toBeVisible();
    });

    test('header has correct text and is visible', async ({ page }) => {
        const header = page.getByRole('heading', { name: 'Sign in to Project Management' });
        await expect(header).toBeVisible();
    });

    test('welcome subtext is visible', async ({ page }) => {
        await expect(page.getByText('Welcome back! Please sign in to continue')).toBeVisible();
    });

    test('divider is visible', async ({ page }) => {
        await expect(page.getByText('or', {exact : true})).toBeVisible();
    });

    test('footer question is visible', async ({ page }) => {
        await expect(page.getByText(/don.?t have an account/i)).toBeVisible();
    });

});
