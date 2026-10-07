import { test, expect } from '@playwright/test';
import { countriesFixture, weatherFixture } from '../fixtures';
test.beforeEach(async ({ context }) => {
  await context.route('https://restcountries.conventus.de/**', (route) =>
    route.fulfill({ json: countriesFixture }),
  );
  await context.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ json: weatherFixture }),
  );
  await context.route('https://flagcdn.com/**', (route) =>
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
  await page.getByLabel('Search places, countries or capitals').fill('Tokyo');
  await page.getByLabel('Search places, countries or capitals').press('Enter');
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
  await page.locator('.country-directory > summary').click();
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
  await expect(
    page.getByLabel('Search places, countries or capitals'),
  ).toHaveValue('lisbon');
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

test('photo-led place discovery, keyboard region filters and graceful missing images', async ({
  page,
}) => {
  await page.route('**/destinations/tokyo-*.jpg', (route) =>
    route.fulfill({ status: 404, body: '' }),
  );
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Featured destinations' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Tokyo', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Japan', exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByRole('img', {
      name: 'Tokyo: illustrated landscape, photograph unavailable',
    }),
  ).toBeVisible();
  const region = page.getByRole('button', { name: 'Europe', exact: true });
  await region.focus();
  await region.press('Enter');
  await expect(page).toHaveURL(/region=Europe/);
  await expect(
    page.getByRole('heading', { name: 'Lisbon', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Tokyo', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByRole('link', { name: 'Explore Tokyo', exact: true }).focus();
  await page
    .getByRole('link', { name: 'Explore Tokyo', exact: true })
    .press('Enter');
  await expect(page).toHaveURL(/\/places\/tokyo$/);
  await expect(
    page.getByRole('heading', { name: 'Tokyo', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Model conditions near Tokyo.', { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Add Japan to my trip' }).click();
  await page.getByRole('link', { name: 'View in your trip' }).click();
  await expect(
    page.getByRole('heading', { name: 'Japan', exact: true }),
  ).toBeVisible();
});

test('carousel controls and keyboard navigation respect bounds and retain card actions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const track = page.getByRole('list', { name: 'Destination cards' });
  const previous = page.getByRole('button', { name: 'Previous destinations' });
  const next = page.getByRole('button', { name: 'Next destinations' });
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  await next.click();
  await expect
    .poll(() => track.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await track.focus();
  await track.press('End');
  await expect(next).toBeDisabled();
  await track.press('Home');
  await expect(previous).toBeDisabled();
  await track.press('ArrowRight');
  await expect(previous).toBeEnabled();
  await track.press('ArrowLeft');
  await expect(previous).toBeDisabled();
  const favourite = page.getByRole('button', {
    name: 'Save South Africa from Cape Town',
    exact: true,
  });
  await favourite.focus();
  await favourite.press('Space');
  await expect(
    page.getByRole('button', {
      name: 'Unsave South Africa from Cape Town',
      exact: true,
    }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('saved collections synchronize across tabs and reject malformed stored data', async ({
  page,
  context,
}) => {
  await page.goto('/destinations/JPN');
  const second = await context.newPage();
  try {
    await second.goto('/favourites');
    await page.getByRole('button', { name: 'Save Japan', exact: true }).click();
    await expect(
      second.getByRole('button', { name: 'Unsave Japan', exact: true }),
    ).toBeVisible();
    await second.goto('/trip');
    await expect(
      second.getByRole('heading', { name: 'Every journey starts somewhere' }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Add to my trip' }).click();
    await expect(
      second.getByRole('heading', { name: 'Japan', exact: true }),
    ).toBeVisible();
    await page.evaluate(() =>
      localStorage.setItem('roamly:trip:v1', '{invalid'),
    );
    await expect(
      second.getByRole('heading', { name: 'Every journey starts somewhere' }),
    ).toBeVisible();
    await expect(
      second.getByText('Saved data could not be loaded.', { exact: false }),
    ).toBeVisible();
    await second.reload();
    await expect(
      second.getByRole('heading', { name: 'Every journey starts somewhere' }),
    ).toBeVisible();
    expect(
      await second.evaluate(() => localStorage.getItem('roamly:trip:v1')),
    ).toBe('{invalid');
    await page.evaluate(() => localStorage.clear());
    await second.goto('/favourites');
    await expect(
      second.getByRole('heading', { name: 'Your someday list starts here' }),
    ).toBeVisible();
  } finally {
    await second.close();
  }
});
