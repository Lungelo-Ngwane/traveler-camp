import { useSearchParams } from 'react-router-dom';
import { useCountries, filterCountries, regions, pageNumber } from './api';
import { useFavourites } from '../favourites/context';
import { CountryCard } from './CountryCard';
import { Feedback, LoadingCards } from '../../components/Feedback';

export function Discovery({
  favouritesOnly = false,
}: {
  favouritesOnly?: boolean;
}) {
  const [params, setParams] = useSearchParams();
  const query = useCountries();
  const { codes } = useFavourites();
  const filtered = filterCountries(
    query.data ?? [],
    params,
    codes,
    favouritesOnly,
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const page = pageNumber(params, pages);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams(params);
    for (const key of ['q', 'region', 'sort']) {
      const value = String(data.get(key) ?? '').trim();
      if (value && (key !== 'sort' || value !== 'name')) next.set(key, value);
      else next.delete(key);
    }
    next.delete('page');
    setParams(next);
  }
  return (
    <>
      {!favouritesOnly && (
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">For the curious at heart</span>
            <h1>
              A little further.
              <br />
              <em>A lot to discover.</em>
            </h1>
            <p>
              Find somewhere that moves you. Explore the world, keep your
              favourites, and turn a little curiosity into your next journey.
            </p>
            <a className="button light" href="#explore">
              Find your next destination <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div className="hero-image">
            <img
              src="/camp-lake.jpg"
              alt="A view from a camping tent into a sunlit forest"
              width="1100"
              height="640"
              fetchPriority="high"
            />
            <span className="image-caption">Take the scenic route.</span>
          </div>
        </section>
      )}
      <section id="explore" className="discovery">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {favouritesOnly
                ? 'Your personal shortlist'
                : 'The world is wide open'}
            </span>
            <h1 hidden={!favouritesOnly}>Saved for someday</h1>
            {!favouritesOnly && <h2>Where will curiosity take you?</h2>}
          </div>
          <p>
            {favouritesOnly
              ? 'Places you want to come back to.'
              : 'Country guides. Real information. Your next possibility.'}
          </p>
        </div>
        <form
          className="filters"
          onSubmit={submit}
          key={params.toString()}
          aria-label="Filter destinations"
        >
          <label className="search-label">
            Search countries or capitals
            <input
              type="search"
              name="q"
              defaultValue={params.get('q') ?? ''}
              placeholder="Try Japan or Cape Town"
              maxLength={100}
            />
          </label>
          <label>
            Region
            <select
              name="region"
              defaultValue={
                regions.includes(params.get('region') ?? '')
                  ? params.get('region')!
                  : ''
              }
            >
              <option value="">Everywhere</option>
              {regions.map((region) => (
                <option key={region}>{region}</option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select
              name="sort"
              defaultValue={
                params.get('sort') === 'population' ? 'population' : 'name'
              }
            >
              <option value="name">Name A–Z</option>
              <option value="population">Population</option>
            </select>
          </label>
          <button type="submit">Explore</button>
        </form>
        {query.isPending ? (
          <LoadingCards />
        ) : query.isError && !query.data ? (
          <Feedback
            title="The world can wait a moment"
            retry={() => {
              void query.refetch();
            }}
          >
            <p>{query.error.message}</p>
          </Feedback>
        ) : (
          <>
            {query.isError && (
              <p role="status">
                Showing previously loaded country information. Refresh failed.{' '}
                <button
                  className="text-button"
                  onClick={() => {
                    void query.refetch();
                  }}
                >
                  Retry
                </button>
              </p>
            )}
            <div className="results-line">
              <p role="status">
                {filtered.length}{' '}
                {filtered.length === 1 ? 'destination' : 'destinations'}
                {filtered.length > 0 && ` · Page ${page} of ${pages}`}
              </p>
              {params.toString() && (
                <button className="text-button" onClick={() => setParams({})}>
                  Clear filters
                </button>
              )}
            </div>
            {filtered.length ? (
              <div className="cards">
                {filtered.slice((page - 1) * 12, page * 12).map((country) => (
                  <CountryCard key={country.code} country={country} />
                ))}
              </div>
            ) : (
              <Feedback
                title={
                  favouritesOnly && !codes.length
                    ? 'Your someday list starts here'
                    : 'No destinations found'
                }
              >
                <p>
                  {favouritesOnly && !codes.length
                    ? 'Tap the heart on any destination to keep it here.'
                    : 'Try a different country, capital, or region.'}
                </p>
              </Feedback>
            )}
            {pages > 1 && (
              <nav className="pagination" aria-label="Destination pages">
                <button
                  disabled={page === 1}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set('page', String(page - 1));
                    setParams(next);
                  }}
                >
                  ← Previous
                </button>
                <span>
                  {page} / {pages}
                </span>
                <button
                  disabled={page === pages}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set('page', String(page + 1));
                    setParams(next);
                  }}
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}
export function Component() {
  return <Discovery />;
}
