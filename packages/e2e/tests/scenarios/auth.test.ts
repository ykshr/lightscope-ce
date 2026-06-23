import { expect, test } from '@playwright/test';

// Use an empty storage state to simulate an unauthenticated user
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication Flows', () => {
  test('should load the SignIn page and handle form interactions', async ({ page }) => {
    await page.goto('/singin');

    // Verify title
    await expect(page.locator('h1')).toHaveText('SingIn');

    // Verify form elements exist
    const emailInput = page.getByTestId('email-input');
    const passwordInput = page.getByTestId('password-input');
    const signInBtn = page.getByTestId('submit-btn');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(signInBtn).toBeVisible();

    // Fill invalid credentials
    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await signInBtn.click();

    // Wait for the error message
    await expect(page.locator('.text-destructive')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to SignUp page and handle form interactions', async ({ page }) => {
    await page.goto('/singin');

    // Click "SingUp" link
    await page.getByRole('link', { name: 'SingUp', exact: true }).click();

    // Verify navigation to signup
    await expect(page).toHaveURL(/.*\/signup/);

    // Verify title
    await expect(page.locator('h1', { hasText: 'SingUp' })).toBeVisible();

    // Verify form elements exist
    const emailInput = page.getByTestId('email-input');
    const passwordInput = page.getByTestId('password-input');
    const signUpBtn = page.getByTestId('submit-btn');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(signUpBtn).toBeVisible();

    // Test navigation back to SignIn
    await page.getByRole('link', { name: 'Login', exact: true }).click();
  });
});
