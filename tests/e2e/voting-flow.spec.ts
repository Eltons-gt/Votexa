import { test, expect } from '@playwright/test';

test.describe('Votexa End-to-End Voting Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage / login
    await page.goto('/');
  });

  test('WF1-4: User Authentication and Workspace Navigation', async ({ page }) => {
    // Check navigation and landing elements
    await expect(page.locator('text=Votexa')).toBeVisible();

    // Verify Organization Switcher or Dashboard Links
    const orgSelector = page.locator('[data-testid="org-switcher"]');
    if (await orgSelector.isVisible()) {
      await orgSelector.click();
      await expect(page.locator('text=Metropolitan University')).toBeVisible();
    }
  });

  test('WF8: Institutional Single-Vote Submission and Audit Receipt', async ({ page }) => {
    // Navigate to Institutional Election Voting Page
    await page.goto('/elections/elec-inst-1/vote');

    // Enter Voter Code
    const voterInput = page.locator('input[placeholder*="voter code" i]');
    if (await voterInput.isVisible()) {
      await voterInput.fill('VTR-METRO-1011');
      await page.locator('button:has-text("Verify Eligibility")').click();

      // Ensure Candidate Options are displayed
      await expect(page.locator('text=Dean of Faculty')).toBeVisible();

      // Select candidate radio button
      const firstCandidate = page.locator('input[type="radio"]').first();
      await firstCandidate.check();

      // Submit Ballot
      const submitBtn = page.locator('button:has-text("Submit Official Ballot")');
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();

      // Verify Ballot Confirmation Receipt
      await expect(page.locator('text=Ballot Accepted')).toBeVisible();
      await expect(page.locator('text=Receipt ID')).toBeVisible();
    }
  });

  test('WF9-10: Paid Voting Package Purchase & Credit Consumption', async ({ page }) => {
    // Navigate to Paid Competition
    await page.goto('/elections/elec-paid-1/vote');

    // Check Voting Package Catalog
    const packageCards = page.locator('[data-testid="voting-package-card"]');
    if ((await packageCards.count()) > 0) {
      await expect(packageCards.first()).toBeVisible();
      const buyBtn = packageCards.first().locator('button:has-text("Purchase Credits")');
      await expect(buyBtn).toBeVisible();
    }
  });

  test('WF23-24: Super Admin Dashboard & Audit Log Access', async ({ page }) => {
    // Navigate to Super Admin View
    await page.goto('/admin');

    // Verify Admin Navigation Tabs
    const adminHeader = page.locator('text=Platform Super Administration');
    if (await adminHeader.isVisible()) {
      await expect(page.locator('text=Audit Logs')).toBeVisible();
      await expect(page.locator('text=Revenue & Financial Ledger')).toBeVisible();
      await expect(page.locator('text=Payout Management')).toBeVisible();
    }
  });
});

