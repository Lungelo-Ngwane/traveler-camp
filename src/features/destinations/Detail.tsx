import { Link, useParams } from 'react-router-dom';
import { useCountries } from './api';
import { Feedback, NotFound } from '../../components/Feedback';
import { FavouriteButton } from './CountryCard';
import { useTrip } from '../trip/context';
import { WeatherPanel } from '../weather/WeatherPanel';
export function Component() {
  const { countryCode } = useParams();
  const query = useCountries();
  const trip = useTrip();
  if (query.isPending)
    return <Feedback title="Opening your destination guide…" />;
  if (query.isError && !query.data)
    return (
      <Feedback
        title="This guide could not be loaded"
        retry={() => {
          void query.refetch();
        }}
      >
        <p>{query.error.message}</p>
      </Feedback>
    );
  const country = query.data?.find(
    (item) => item.code === countryCode?.toUpperCase(),
  );
  if (!country) return <NotFound />;
  const added = trip.stops.some((stop) => stop.code === country.code);
  const facts = [
    ['Capital', country.capital.join(', ') || 'Not listed'],
    ['Region', country.region],
    [
      'Population',
      country.population === null
        ? 'Not listed'
        : new Intl.NumberFormat('en').format(country.population),
    ],
    ['Languages', country.languages.join(', ') || 'Not listed'],
    ['Currencies', country.currencies.join(', ') || 'Not listed'],
    ['Time zones', country.timezones.join(', ') || 'Not listed'],
    [
      'Coordinates',
      country.coordinates?.map((value) => `${value}°`).join(', ') ||
        'Not listed',
    ],
  ];
  return (
    <div className="detail-page">
      <Link className="back-link" to="/">
        ← All destinations
      </Link>
      <section className="destination-heading">
        <div>
          <span className="eyebrow">{country.region} / Destination guide</span>
          <h1>{country.name}</h1>
          <p>A new place. A fresh perspective. Start with the essentials.</p>
          <div className="actions">
            {added ? (
              <Link className="button" to="/trip">
                View in your trip →
              </Link>
            ) : (
              <button onClick={() => trip.add(country)}>
                Add to my trip +
              </button>
            )}
            <FavouriteButton country={country} />
          </div>
          <p role="status">
            {added ? `${country.name} is in your itinerary.` : ''}
          </p>
        </div>
        {country.flag && (
          <img
            className="detail-flag"
            src={country.flag}
            alt={`Flag of ${country.name}`}
            width="240"
            height="160"
          />
        )}
      </section>
      <div className="detail-columns">
        <section className="facts">
          <span className="eyebrow">Know before you go</span>
          <h2>The essentials</h2>
          <dl>
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="muted">
            Country metadata is a starting point. Check official travel advice,
            entry requirements, and local conditions before booking.
          </p>
          <a
            href="https://restcountries.conventus.de/"
            target="_blank"
            rel="noreferrer"
          >
            Country data: REST Countries / Conventus mirror
          </a>
        </section>
        <WeatherPanel coordinates={country.coordinates} />
      </div>
    </div>
  );
}
