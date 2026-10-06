import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavouritesProvider } from '../features/favourites/FavouritesProvider';
import { TripProvider } from '../features/trip/TripProvider';
const queryClient = new QueryClient();
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <FavouritesProvider>
        <TripProvider>{children}</TripProvider>
      </FavouritesProvider>
    </QueryClientProvider>
  );
}
