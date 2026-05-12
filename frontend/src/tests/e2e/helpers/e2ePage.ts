import { expect, type Page } from '@playwright/test';

export function attachE2EDiagnostics(page: Page) {
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      console.warn(`BROWSER ${message.type().toUpperCase()}: ${message.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    console.error(`BROWSER PAGE ERROR: ${error.message}`);
  });
}

export async function gotoAppPage(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app > *')).toBeVisible({ timeout: 15_000 });
}