// tests/merchant.spec.js
import { test, expect } from '@playwright/test';

test('Merchant CRM Security & Login Uplink', async ({ page }) => {
  // 1. Navigate to the portal
  await page.goto('http://localhost:5173/?portal=b2b-secure-access');

  const testEmail = process.env.TEST_EMAIL || 'robot-test@veryfryd.com';
  const testPassword = process.env.TEST_PASSWORD;

  if (!testPassword) {
    throw new Error("SECURITY HALT: Test password not found in environment.");
  }

  // 2. Inject credentials
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  
  // 3. Click Login
  await page.click('button[type="submit"]');

  // 4. THE TIME FREEZE
  // This will completely pause the Playwright browser so you can inspect it.
  await page.pause(); 
  
  // (We are commenting out the old checks until we see what the robot's screen actually looks like)
  // await expect(page.locator('text=Sever Connection')).toBeVisible();
});