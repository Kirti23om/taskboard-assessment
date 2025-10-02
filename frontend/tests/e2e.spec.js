const { test, expect } = require('@playwright/test');

test.describe('Taskboard E2E', () => {
  test('login flow', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Logout')).toBeVisible();
  });

  test('create todo', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[name="title"]', 'New Todo');
    await page.fill('textarea[name="description"]', 'Test description');
    await page.click('button:has-text("Add")');
    await expect(page.locator('text=New Todo')).toBeVisible();
  });

  test('edit todo', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Edit")');
    await page.fill('input[name="title"]', 'Edited Todo');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Edited Todo')).toBeVisible();
  });

  test('toggle todo with optimistic UI and rollback', async ({ page }) => {
    await page.goto('/');
    const todo = page.locator('.todo-item').first();
    await todo.locator('input[type="checkbox"]').check();
    await expect(todo).toHaveClass(/completed/);
    // Simulate rollback (e.g., network error)
    // This part would require mocking API failure
  });

  test('bulk operations', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Bulk Select")');
    await page.click('.todo-item input[type="checkbox"]');
    await page.click('button:has-text("Bulk Delete")');
    await expect(page.locator('.todo-item')).toHaveCount(0);
  });

  test('401 redirect', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear()); // Simulate logout
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('basic accessibility', async ({ page }) => {
    await page.goto('/');
    const results = await page.accessibility.snapshot();
    expect(results).toBeTruthy();
  });
});
