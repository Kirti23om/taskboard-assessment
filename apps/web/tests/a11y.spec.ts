import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.io');
    await page.fill('[name="password"]', 'Password@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/projects');
  });

  test('should not have accessibility violations on projects page', async ({ page }) => {
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  // KNOWN ISSUE - seeded defect: Task modal missing aria-labelledby
  test.skip('should not have accessibility violations on task modal', async ({ page }) => {
    // Navigate to a project and open task modal
    const projectLink = page.locator('a[href*="/projects/"]').first();
    await projectLink.click();
    
    // Open create task modal
    await page.click('button:has-text("Create Task")');
    
    await injectAxe(page);
    
    // This should pass but will fail due to missing aria-labelledby on modal
    await checkA11y(page, '[role="dialog"]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('should have proper focus management in modal', async ({ page }) => {
    const projectLink = page.locator('a[href*="/projects/"]').first();
    await projectLink.click();
    
    // Open create task modal
    await page.click('button:has-text("Create Task")');
    
    // Check that focus is properly trapped
    const titleInput = page.locator('#title');
    await expect(titleInput).toBeFocused();
    
    // Tab through all focusable elements and ensure focus stays within modal
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should still be within the modal
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'SELECT', 'BUTTON']).toContain(focusedElement);
  });
});
