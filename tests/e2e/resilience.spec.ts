import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';
import { countriesFixture } from '../fixtures';
test('discovery and planner meet automated WCAG AA checks without horizontal overflow', async ({
  page,
}) => {
  await page.route('https://restcountries.conventus.de/**', (route) =>
    route.fulfill({ json: countriesFixture }),
  );
  await page.route('https://flagcdn.com/**', (route) => route.abort());
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Tokyo', exact: true }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto('/destinations/JPN');
  await page.getByRole('button', { name: 'Add to my trip' }).click();
  await page.getByRole('link', { name: 'View in your trip' }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test('storage failure keeps session state usable and unknown routes recover', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage disabled');
      },
    });
  });
  await page.route('https://restcountries.conventus.de/**', (route) =>
    route.fulfill({ json: countriesFixture }),
  );
  await page.goto('/destinations/JPN');
  await page.getByRole('button', { name: 'Add to my trip' }).click();
  await expect(
    page.getByText(
      'Your changes are available in this session, but could not be saved.',
      { exact: false },
    ),
  ).toBeVisible();
  await page.getByRole('link', { name: 'View in your trip' }).click();
  await expect(
    page.getByRole('heading', { name: 'Japan', exact: true }),
  ).toBeVisible();
  await page.goto('/unknown');
  await expect(
    page.getByRole('heading', { name: 'That path leads somewhere else' }),
  ).toBeVisible();
});
