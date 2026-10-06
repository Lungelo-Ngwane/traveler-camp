import { Link, useParams } from 'react-router-dom';
import { useCountries } from '../countries/api';
import { destinations } from './catalogue';
import { DestinationVisual, PhotoCredit } from './DestinationVisual';
import { Feedback, NotFound } from '../../shared/ui/Feedback';
import { FavouriteButton } from './CountryCard';
import { useTrip } from '../trip/context';
import { WeatherPanel } from '../weather/WeatherPanel';
export function Component() {
  const { countryCode, destinationSlug } = useParams();
  const destination = destinations.find(
    (place) => place.slug === destinationSlug,
  );
  const query = useCountries();
  const trip = useTrip();
  if (destinationSlug && !destination) return <NotFound />;
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
    (item) =>
      item.code === (destination?.countryCode ?? countryCode?.toUpperCase()),
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
    <div className={`detail-page ${destination ? 'place-detail' : ''}`}>
      <Link className="back-link" to="/">
        ← Discover places
      </Link>
      <section className="destination-heading">
        <div>
          <span className="eyebrow">
            {country.region} / {destination ? country.name : 'Country guide'}
          </span>
          <h1>{destination?.name ?? country.name}</h1>
          <p>
            {destination?.description ??
              'A fresh perspective. Start with the country essentials.'}
          </p>
          <div className="actions">
            {added ? (
              <Link className="button" to="/trip">
                View in your trip →
              </Link>
            ) : (
              <button onClick={() => trip.add(country)}>
                {destination
                  ? `Add ${country.name} to my trip +`
                  : 'Add to my trip +'}
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
      {destination && (
        <section
          className="place-photo"
          aria-label={`${destination.name} photograph`}
        >
          <DestinationVisual
            destination={destination}
            sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1320px) calc(100vw - 80px), 1240px"
          />
          <PhotoCredit destination={destination} />
          <p className="muted">
            {destination.locality} · Plans and favourites currently save the
            country, {country.name}.
          </p>
        </section>
      )}
      <div className="detail-columns">
        <section className="facts">
          <span className="eyebrow">Know before you go</span>
          <h2>The essentials</h2>
          {destination && (
            <p className="muted">Country information for {country.name}</p>
          )}
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
        <WeatherPanel
          coordinates={destination?.coordinates ?? country.coordinates}
          locationName={destination?.name}
        />
      </div>
    </div>
  );
}
