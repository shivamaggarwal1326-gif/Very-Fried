import { test, expect } from '@playwright/test';

test('NFC Real-Time Order & Master Wipe Flow', async ({ browser }) => {
  // =========================================================
  // BROWSER 1: THE MERCHANT COMMAND CENTER
  // =========================================================
  const merchantContext = await browser.newContext();
  const merchantPage = await merchantContext.newPage();
  
  // 1. Merchant logs in using the dedicated test account
  await merchantPage.goto('http://localhost:5173/merchant');
  await merchantPage.fill('input[type="email"]', 'testmerchant@veryfryd.com'); 
  await merchantPage.fill('input[type="password"]', 'TestPassword123!');
  await merchantPage.click('button:has-text("Initialize System")');

  // Wait for the dashboard to securely load after authenticating
  await merchantPage.waitForSelector('text=Table POS', { timeout: 10000 });

  // 2. Navigate to the POS Grid
  await merchantPage.click('text=Table POS');
  
  // Verify Table 4 is currently VACANT before the customer arrives
  const table4 = merchantPage.locator('button', { hasText: 'T-4' });
  await expect(table4).toContainText('VACANT');


  // =========================================================
  // BROWSER 2: THE CUSTOMER PHONE (NFC TAP)
  // =========================================================
  const customerContext = await browser.newContext({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });
  const customerPage = await customerContext.newPage();

  // 1. Customer sits down and taps the NFC tag for Table 4
  await customerPage.goto('http://localhost:5173/?t=4');

  // 2. The Gamified Entry Flow based on your UI
  await customerPage.click('text=ROOKIE (SIGN UP)'); 
  
  // 3. Select the Deployment Zone Partner
  await customerPage.click('text=SO TAMMY');

  // 4. Verify the Floating Smart Tab appears and is locked to Table 4
  const activeTab = customerPage.locator('text=Table 4 Tab');
  await expect(activeTab).toBeVisible({ timeout: 10000 });

  // 5. Customer orders a dish
  // NOTE: If Churros isn't the exact name on your screen, change it to a real item!
  await customerPage.click('text=Churros'); 
  
  // Progress through the game stages
  await customerPage.click('button:has-text("Start")'); 
  await customerPage.click('button:has-text("Complete")'); 

  // 6. Verify it hits the Smart Batching "Pending" holding pen
  await expect(customerPage.locator('text=Pending Batch')).toBeVisible();
  
  // Wait for the 15-second batch timer to hit zero and fire to the kitchen
  await customerPage.waitForTimeout(16000); 
  await expect(customerPage.locator('text=Fired to Kitchen')).toBeVisible();


  // =========================================================
  // BACK TO BROWSER 1: VERIFY MERCHANT RECEIVED IT & WIPES IT
  // =========================================================
  
  // 1. Verify Table 4 instantly changed to OCCUPIED via WebSockets
  await expect(table4).toContainText('OCCUPIED');
  
  // 2. Merchant clicks Table 4 to open the Ledger
  await table4.click(); 

  // 3. Merchant clicks Settle Bill (The Master Wipe)
  await merchantPage.click('button:has-text("Finalize & Wipe Session")');

  // 4. Verify Table 4 resets to VACANT, locking out the customer
  await expect(table4).toContainText('VACANT');
});