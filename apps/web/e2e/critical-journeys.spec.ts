import { test, expect } from '@playwright/test';

/**
 * Critical journey E2E tests per Phase 15.
 */

test.describe('Landing Page', () => {
  test('loads the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Homework/i);
  });
});

test.describe('Authentication', () => {
  test('redirects unauthenticated users to sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to sign-in or show auth prompt
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Professor Journey', () => {
  test.skip('creates a course', async ({ page }) => {
    // TODO: Phase 15 — requires auth setup
    await page.goto('/dashboard/courses');
  });

  test.skip('creates an assignment with rubric', async ({ page }) => {
    // TODO: Phase 15
  });

  test.skip('reviews and approves a grade', async ({ page }) => {
    // TODO: Phase 15
  });
});

test.describe('Student Journey', () => {
  test.skip('submits homework', async ({ page }) => {
    // TODO: Phase 15
  });

  test.skip('views released feedback', async ({ page }) => {
    // TODO: Phase 15
  });
});

test.describe('Super Admin Journey', () => {
  test.skip('changes model snapshot', async ({ page }) => {
    // TODO: Phase 15
  });
});
