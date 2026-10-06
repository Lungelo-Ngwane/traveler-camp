import { useSearchParams } from 'react-router-dom';
import { useCountries, filterCountries, regions, pageNumber } from './api';
import { useFavourites } from '../favourites/context';
import { CountryCard } from './CountryCard';
import { DestinationCarousel } from './DestinationCarousel';
import { filterDestinations } from './catalogue';
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
  const places = filterDestinations(params);
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const page = pageNumber(params, pages);
  const hasFilters = ['q', 'region', 'sort', 'page'].some((key) =>
    params.has(key),
  );
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
  function setRegion(region: string) {
    const next = new URLSearchParams(params);
    if (region) next.set('region', region);
    else next.delete('region');
    next.delete('page');
    setParams(next);
  }
  function changePage(value: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(value));
    setParams(next);
  }
  const countryResults = (
    <>
      <div className="results-line">
        <p role="status">
          {filtered.length}{' '}
          {filtered.length === 1 ? 'country guide' : 'country guides'}
          {filtered.length > 0 && ` · Page ${page} of ${pages}`}
        </p>
      </div>
      {filtered.length ? (
        <div className="country-grid">
          {filtered.slice((page - 1) * 12, page * 12).map((country) => (
            <CountryCard key={country.code} country={country} />
          ))}
        </div>
      ) : (
        <Feedback
          title={
            favouritesOnly && !codes.length
              ? 'Your someday list starts here'
              : 'No countries found'
          }
        >
          <p>
            {favouritesOnly && !codes.length
              ? 'Tap the heart on a place or country guide to save its country here.'
              : 'Try a different country, capital, or region.'}
          </p>
        </Feedback>
      )}
      {pages > 1 && (
        <nav className="pagination" aria-label="Country guide pages">
          <button disabled={page === 1} onClick={() => changePage(page - 1)}>
            ← Previous
          </button>
          <span>
            {page} / {pages}
          </span>
          <button
            disabled={page === pages}
            onClick={() => changePage(page + 1)}
          >
            Next →
          </button>
        </nav>
      )}
    </>
  );
  return (
    <>
      {!favouritesOnly && (
        <section className="hero discovery-hero">
          <div className="hero-copy">
            <span className="eyebrow">For the curious at heart</span>
            <h1>
              A little further.
              <br />
              <em>A lot to discover.</em>
            </h1>
            <p>
              Coastal mornings. City wanderings. Somewhere you haven’t been yet.
              Find a place that moves you, then make it part of your journey.
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
                : 'Follow your curiosity'}
            </span>
            {favouritesOnly ? (
              <h1>Saved for someday</h1>
            ) : (
              <h2>Find your next somewhere.</h2>
            )}
          </div>
          <p>
            {favouritesOnly
              ? 'Your saved countries, ready for a closer look.'
              : 'A few places to inspire you. A whole world to explore.'}
          </p>
        </div>
        <form
          className="filters"
          onSubmit={submit}
          key={params.toString()}
          aria-label="Filter destinations"
        >
          <label className="search-label">
            Search places, countries or capitals
            <input
              type="search"
              name="q"
              defaultValue={params.get('q') ?? ''}
              placeholder="Try Bali, Japan or Cape Town"
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
            Country sort
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
        {hasFilters && (
          <div className="active-filters">
            <p>
              Showing matches
              {params.get('q') && (
                <>
                  {' '}
                  for <strong>“{params.get('q')}”</strong>
                </>
              )}
              {params.get('region') && <> in {params.get('region')}</>}
            </p>
            <button className="text-button" onClick={() => setParams({})}>
              Clear filters
            </button>
          </div>
        )}
        {!favouritesOnly && (
          <>
            <section
              className="featured-section"
              aria-labelledby="featured-heading"
            >
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    A starting point, not a ranking
                  </span>
                  <h2 id="featured-heading">
                    {hasFilters ? 'Places to explore' : 'Featured destinations'}
                  </h2>
                </div>
                <p>
                  {hasFilters
                    ? `${places.length} curated ${places.length === 1 ? 'place' : 'places'} match your search.`
                    : 'Six handpicked places. Find your own kind of adventure.'}
                </p>
              </div>
              {places.length ? (
                <DestinationCarousel
                  key={params.toString()}
                  destinations={places}
                  countries={query.data}
                />
              ) : (
                <Feedback title="No curated places match yet">
                  <p>
                    Our collection is small. Explore the country guides below
                    for more possibilities.
                  </p>
                </Feedback>
              )}
            </section>
            <section
              className="region-section"
              aria-labelledby="region-heading"
            >
              <h2 id="region-heading">Explore by region</h2>
              <div className="region-options">
                <button
                  className="region-option"
                  aria-pressed={!params.get('region')}
                  onClick={() => setRegion('')}
                >
                  Everywhere
                </button>
                {regions.map((region) => (
                  <button
                    key={region}
                    className="region-option"
                    aria-pressed={params.get('region') === region}
                    onClick={() => setRegion(region)}
                  >
                    {region}
                    <span aria-hidden="true"> ↗</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
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
            <p>Your curated places above are still available.</p>
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
            {favouritesOnly ? (
              <div className="country-directory">{countryResults}</div>
            ) : (
              <details
                className="country-directory"
                open={hasFilters}
                key={params.toString()}
              >
                <summary>
                  <span>
                    <span className="eyebrow">Go beyond the shortlist</span>
                    <span className="directory-title">Explore the world</span>
                    <span className="directory-description">
                      {filtered.length} country guides · currencies, languages &
                      the essentials
                    </span>
                  </span>
                  <span className="directory-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="directory-results">
                  <p className="directory-intro">
                    Country reference guides help you plan further. They are
                    separate from our curated places; hearts save countries to
                    your shortlist.
                  </p>
                  {countryResults}
                </div>
              </details>
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
