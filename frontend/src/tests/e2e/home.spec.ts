import { expect, test } from '@playwright/test';
import { attachE2EDiagnostics, gotoAppPage } from './helpers/e2ePage';

test('loads the DVA CLIK operations console', async ({ page }) => {
  attachE2EDiagnostics(page);
  await page.route('**/api/service-records', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await gotoAppPage(page, '/');
  await expect(page.getByRole('heading', { name: 'Policy publishing and platform health console' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: '2,000-page policy upload queue' })).toBeVisible();
  await expect(page.getByText('Available', { exact: true })).toBeVisible();
});

test('shows a clear message when operational data is unavailable', async ({ page }) => {
  attachE2EDiagnostics(page);
  await page.route('**/api/service-records', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unavailable' }),
    });
  });

  await gotoAppPage(page, '/');
  await expect(page.getByRole('heading', { name: 'Operational data cannot be loaded' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: '2,000-page policy upload queue' })).toBeHidden();
});
