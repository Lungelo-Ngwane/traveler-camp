import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it } from 'vitest';
import { countriesFixture } from '../../../tests/fixtures';
import { FavouritesProvider } from '../favourites/Provider';
import { Discovery } from './Discovery';
import { parseCountries } from './api';
it('submits labelled keyboard search and toggles an accessible favourite', async () => {
  window.localStorage.clear();
  const client = new QueryClient();
  client.setQueryData(['countries'], parseCountries(countriesFixture));
  render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <FavouritesProvider>
          <Discovery />
        </FavouritesProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
  const user = userEvent.setup();
  await user.type(
    screen.getByLabelText('Search places, countries or capitals'),
    'Tokyo{Enter}',
  );
  expect(screen.getByRole('heading', { name: 'Japan' })).toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'Portugal' }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Save Japan' }));
  expect(screen.getByRole('button', { name: 'Unsave Japan' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(window.localStorage.getItem('roamly:favourites:v1')).toContain('JPN');
});

it('retains search text that happens to match the default sort value', async () => {
  const client = new QueryClient();
  client.setQueryData(
    ['countries'],
    parseCountries([{ ...countriesFixture[0], name: { common: 'Suriname' } }]),
  );
  render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <FavouritesProvider>
          <Discovery />
        </FavouritesProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
  await userEvent.type(
    screen.getByLabelText('Search places, countries or capitals'),
    'name{Enter}',
  );
  expect(
    screen.getByLabelText('Search places, countries or capitals'),
  ).toHaveValue('name');
});
