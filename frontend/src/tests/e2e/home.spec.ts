import { expect, test } from '@playwright/test';
import { attachE2EDiagnostics, gotoAppPage } from './helpers/e2ePage';

test('loads the DVA CLIK operations console', async ({ page }) => {
  attachE2EDiagnostics(page);
  await gotoAppPage(page, '/');
  await expect(page.getByRole('heading', { name: 'Policy publishing and platform health console' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: '2,000-page policy upload queue' })).toBeVisible();
  await expect(page.getByText('Drupal 10 + GovCMS', { exact: true })).toBeVisible();
});
