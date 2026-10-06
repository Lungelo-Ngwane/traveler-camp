import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { FavouritesProvider } from './features/favourites/Provider';
import { TripProvider } from './features/trip/Provider';
import { Layout } from './components/Layout';
import { RouteError } from './components/RouteError';
import { LoadingPage, NotFound } from './components/Feedback';
import './styles.css';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    Component: Layout,
    ErrorBoundary: RouteError,
    HydrateFallback: LoadingPage,
    children: [
      { index: true, lazy: () => import('./features/destinations/Discovery') },
      {
        path: 'destinations/:countryCode',
        lazy: () => import('./features/destinations/Detail'),
      },
      {
        path: 'places/:destinationSlug',
        lazy: () => import('./features/destinations/Detail'),
      },
      { path: 'favourites', lazy: () => import('./features/favourites/Page') },
      { path: 'trip', lazy: () => import('./features/trip/Page') },
      { path: '*', Component: NotFound },
    ],
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FavouritesProvider>
        <TripProvider>
          <RouterProvider router={router} />
        </TripProvider>
      </FavouritesProvider>
    </QueryClientProvider>
  </StrictMode>,
);
