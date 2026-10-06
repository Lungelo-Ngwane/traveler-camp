import { Link } from 'react-router-dom';
import type { Country } from '../../domain/country';
import type { Destination } from '../../domain/destination';
import { FavouriteButton } from './CountryCard';
import { DestinationVisual, PhotoCredit } from './DestinationVisual';
export function DestinationCard({
  destination,
  country,
}: {
  destination: Destination;
  country?: Country;
}) {
  return (
    <article className="destination-card">
      <div className="destination-image">
        <DestinationVisual destination={destination} />
        <FavouriteButton
          country={
            country ?? {
              code: destination.countryCode,
              name: destination.countryName,
            }
          }
          context={destination.name}
        />
      </div>
      <div className="destination-content">
        <p className="place-metadata">
          {country?.flag && (
            <img
              src={country.flag}
              width="20"
              height="14"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
              alt=""
            />
          )}
          <span>{country?.name ?? destination.countryName}</span>
          <span aria-hidden="true">·</span>
          <span>{destination.region}</span>
        </p>
        <Link
          to={`/places/${destination.slug}`}
          className="destination-link"
          aria-label={`Explore ${destination.name}`}
        >
          <h3>{destination.name}</h3>
          <p>{destination.locality}</p>
          <span className="destination-action">
            Explore this place <span aria-hidden="true">↗</span>
          </span>
        </Link>
        <PhotoCredit destination={destination} />
      </div>
    </article>
  );
}
