import { Link } from 'react-router-dom';
import type { Country } from '../../lib/models';
import { useFavourites } from '../favourites/context';
export function FavouriteButton({ country }: { country: Country }) {
  const { codes, toggle } = useFavourites();
  const saved = codes.includes(country.code);
  return (
    <button
      className="favourite"
      aria-label={`${saved ? 'Unsave' : 'Save'} ${country.name}`}
      aria-pressed={saved}
      onClick={() => toggle(country.code)}
    >
      <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
    </button>
  );
}
export function CountryCard({ country }: { country: Country }) {
  return (
    <article className="country-card">
      <div className={`card-art region-${country.region.toLowerCase()}`}>
        <span className="country-code" aria-hidden="true">
          {country.code}
        </span>
        {country.flag && (
          <img
            src={country.flag}
            alt=""
            loading="lazy"
            width="72"
            height="48"
          />
        )}
        <FavouriteButton country={country} />
      </div>
      <div className="card-content">
        <span className="eyebrow">{country.region}</span>
        <h3>
          <Link to={`/destinations/${country.code}`}>{country.name}</Link>
        </h3>
        <p>{country.capital.join(', ') || 'No capital listed'}</p>
        <Link
          className="text-link"
          to={`/destinations/${country.code}`}
          aria-label={`Explore ${country.name}`}
        >
          Explore destination <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
