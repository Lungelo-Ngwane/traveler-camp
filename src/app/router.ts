import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { RouteError } from './RouteError';
import { LoadingPage, NotFound } from '../shared/ui/Feedback';
export const router = createBrowserRouter([
  {
    Component: Layout,
    ErrorBoundary: RouteError,
    HydrateFallback: LoadingPage,
    children: [
      { index: true, lazy: () => import('../features/destinations/Discovery') },
      {
        path: 'destinations/:countryCode',
        lazy: () => import('../features/destinations/Detail'),
      },
      {
        path: 'places/:destinationSlug',
        lazy: () => import('../features/destinations/Detail'),
      },
      {
        path: 'favourites',
        lazy: () => import('../features/favourites/FavouritesPage'),
      },
      { path: 'trip', lazy: () => import('../features/trip/TripPage') },
      { path: '*', Component: NotFound },
    ],
  },
]);
