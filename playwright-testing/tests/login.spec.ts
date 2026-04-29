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
      
        await page.getByPlaceholder('Enter email or username').fill('pagimuly@fxzig.com');
        await page.getByRole('button', { name: 'Continue' }).click();
      
        await expect(page).toHaveURL(/#\/factor-one/);
        await page.locator('input[type="password"]').fill('tempAccount1234_');
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
    
    test('login page should load in acceptable time', async ({ page }) => {
        const start = Date.now();
      
        await page.goto('http://localhost:4200');
        await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
      
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(8000);
    });

    test('login page should be stable across multiple reloads', async ({ page }) => {
        await page.goto('http://localhost:4200');
      
        for (let i = 0; i < 3; i++) {
          await page.reload();
          await expect(page).toHaveURL('http://localhost:4200/');
          await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
        }
    });
    test('user can navigate through the login page with keyboard', async ({ page }) => {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab'); 
        const continueBtn = page.getByRole('button', { name: 'Continue' });
        await continueBtn.focus();
        await expect(continueBtn).toBeFocused();
    });

    test('Discord/Github/Google buttons are visible', async ({ page }) => {
        await expect(page.getByRole('button', { name: /discord/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    });
    
    test('email is cleared on reload', async ({ page }) => {
        const email = page.getByPlaceholder('Enter email or username');
        await email.fill('test@test.com');
        await page.reload();
        await expect(email).toHaveValue('');
    });
    test('user can paste email and password in', async ({ page }) => {
   
        const email = page.getByPlaceholder('Enter email or username');
        await email.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
      
        await page.evaluate(async (value) => {
          await navigator.clipboard.writeText(value);
        }, 'pagimuly@fxzig.com');
      
        await page.keyboard.press('Control+V');
        await expect(email).toHaveValue('pagimuly@fxzig.com');
      

        await page.getByRole('button', { name: 'Continue' }).click();
        await expect(page).toHaveURL(/#\/factor-one/);
      

        const password = page.getByPlaceholder('Enter your password');
        await expect(password).toBeVisible();
      
        await password.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
      
        await page.evaluate(async (value) => {
          await navigator.clipboard.writeText(value);
        }, 'tempAccount1234_');
      
        await page.keyboard.press('Control+V');
        await expect(password).toHaveValue('tempAccount1234_');
    });
});
