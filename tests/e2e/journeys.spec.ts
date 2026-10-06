import { test, expect } from '@playwright/test';
import { countriesFixture, weatherFixture } from '../fixtures';
test.beforeEach(async ({ page }) => {
  await page.route('https://restcountries.conventus.de/**', (route) =>
    route.fulfill({ json: countriesFixture }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ json: weatherFixture }),
  );
  await page.route('https://flagcdn.com/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="48"><rect width="72" height="48" fill="white"/><circle cx="36" cy="24" r="12" fill="red"/></svg>',
    }),
  );
});
test('URL search, favourites, trip edits and reload persistence', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'A little further. A lot to discover.' }),
  ).toBeVisible();
  await page.getByLabel('Search countries or capitals').fill('Tokyo');
  await page.getByLabel('Search countries or capitals').press('Enter');
  await expect(page).toHaveURL(/q=Tokyo/);
  await expect(
    page.getByRole('heading', { name: 'Japan', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Portugal', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Save Japan', exact: true }).click();
  await page.getByRole('link', { name: 'Explore Japan', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Current weather' }),
  ).toBeVisible();
  await expect(page.getByText('23 °C')).toBeVisible();
  await page.getByRole('button', { name: 'Add to my trip' }).click();
  await page.getByRole('link', { name: 'View in your trip' }).click();
  await page.getByLabel('Arrival', { exact: true }).fill('2026-10-06');
  await page.getByLabel('Departure', { exact: true }).fill('2026-10-10');
  await page.getByLabel('Ideas & notes').fill('Walk the old town');
  await page.getByRole('button', { name: 'Save stop' }).click();
  await expect(page.getByText('4 nights', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Ideas & notes')).toHaveValue(
    'Walk the old town',
  );
  await page.getByRole('link', { name: 'Favourites' }).click();
  await expect(
    page.getByRole('heading', { name: 'Japan', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Unsave Japan' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your someday list starts here' }),
  ).toBeVisible();
});
test('country failure can recover, and weather failure leaves details usable', async ({
  page,
}) => {
  await page.route('https://restcountries.conventus.de/**', (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'The world can wait a moment' }),
  ).toBeVisible();
  await page.route('https://restcountries.conventus.de/**', (route) =>
    route.fulfill({ json: countriesFixture }),
  );
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(
    page.getByRole('heading', { name: 'Japan', exact: true }),
  ).toBeVisible();
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.goto('/destinations/JPN');
  await expect(
    page.getByText('Weather could not be loaded.', { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'The essentials' }),
  ).toBeVisible();
  await expect(
    page.getByText('Japanese yen (JPY)', { exact: true }),
  ).toBeVisible();
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ json: weatherFixture }),
  );
  await page.getByRole('button', { name: 'Retry weather' }).click();
  await expect(page.getByText('23 °C')).toBeVisible();
});
test('bookmarked filters, back navigation, itinerary ordering and removal', async ({
  page,
}) => {
  await page.goto('/?region=Europe&q=lisbon');
  await expect(
    page.getByRole('heading', { name: 'Portugal', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.goBack();
  await expect(page.getByLabel('Search countries or capitals')).toHaveValue(
    'lisbon',
  );
  await page.goto('/destinations/JPN');
  await page.getByRole('button', { name: 'Add to my trip' }).click();
  await page.goto('/destinations/PRT');
  await page.getByRole('button', { name: 'Add to my trip' }).click();
  await page.getByRole('link', { name: 'View in your trip' }).click();
  await page.getByRole('button', { name: 'Move Portugal up' }).click();
  await expect(
    page
      .getByRole('listitem')
      .first()
      .getByRole('heading', { name: 'Portugal' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Remove Japan', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Japan', exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Portugal', exact: true }),
  ).toBeVisible();
});
