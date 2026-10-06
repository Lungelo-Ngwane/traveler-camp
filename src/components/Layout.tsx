import { useEffect, useRef } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigation,
} from 'react-router-dom';
import { useTrip } from '../features/trip/context';
import { useFavourites } from '../features/favourites/context';
export function Layout() {
  const trip = useTrip();
  const favourites = useFavourites();
  const location = useLocation();
  const navigation = useNavigation();
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    const label =
      location.pathname === '/trip'
        ? 'Your trip'
        : location.pathname === '/favourites'
          ? 'Favourites'
          : location.pathname.startsWith('/destinations/')
            ? 'Destination guide'
            : 'Discover';
    document.title = `${label} · Roamly`;
    if (previousPath.current !== location.pathname) {
      main.current?.focus();
      window.scrollTo(0, 0);
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Roamly home">
          <img src="/roamly.svg" width="36" height="36" alt="" />
          roamly<span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink end to="/">
            Discover
          </NavLink>
          <NavLink to="/favourites">
            Favourites <span className="count">{favourites.codes.length}</span>
          </NavLink>
          <NavLink to="/trip">
            My trip <span className="count">{trip.stops.length}</span>
          </NavLink>
        </nav>
      </header>
      {(trip.warning || favourites.warning) && (
        <p className="storage-warning" role="status">
          {trip.warning || favourites.warning}
        </p>
      )}
      <main id="main" ref={main} tabIndex={-1}>
        {navigation.state !== 'idle' && (
          <p role="status">Opening destination...</p>
        )}
        <Outlet />
      </main>
      <footer>
        <Link className="brand" to="/">
          roamly.
        </Link>
        <p>A little curiosity can take you a long way.</p>
        <span>Plans saved locally. Possibilities everywhere.</span>
      </footer>
    </>
  );
}
