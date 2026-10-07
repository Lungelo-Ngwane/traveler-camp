import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { countriesFixture } from '../../../tests/fixtures';
import { parseCountries } from '../countries/api';
import { FavouritesProvider } from '../favourites/FavouritesProvider';
import { TripProvider } from '../trip/TripProvider';
import { Component as Detail } from './Detail';

afterEach(() => vi.unstubAllGlobals());

it('retains cached country details and reports a failed background refresh', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response('{}', { status: 503 })),
  );
  const client = new QueryClient();
  client.setQueryData(['countries'], parseCountries(countriesFixture), {
    updatedAt: Date.now() - 48 * 60 * 60 * 1000,
  });
  const { unmount } = render(
    <MemoryRouter initialEntries={['/destinations/JPN']}>
      <QueryClientProvider client={client}>
        <FavouritesProvider>
          <TripProvider>
            <Routes>
              <Route path="/destinations/:countryCode" element={<Detail />} />
            </Routes>
          </TripProvider>
        </FavouritesProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Japan' })).toBeInTheDocument();
  await screen.findByText(/Country refresh failed/, {}, { timeout: 4000 });
  expect(
    screen.getByRole('button', { name: 'Retry country information' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Japanese yen (JPY)')).toBeInTheDocument();
  unmount();
  client.clear();
});
