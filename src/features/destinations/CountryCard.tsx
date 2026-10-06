import { Link } from 'react-router-dom';
import type { Country } from '../../lib/models';
import { useFavourites } from '../favourites/context';
export function FavouriteButton({
  country,
  context,
}: {
  country: Pick<Country, 'code' | 'name'>;
  context?: string;
}) {
  const { codes, toggle } = useFavourites();
  const saved = codes.includes(country.code);
  const label = `${saved ? 'Unsave' : 'Save'} ${country.name}${context ? ` from ${context}` : ''}`;
  return (
    <button
      className="favourite"
      aria-label={label}
      title={`${saved ? 'Remove' : 'Save'} ${country.name} ${saved ? 'from' : 'to'} your country shortlist`}
      aria-pressed={saved}
      onClick={() => toggle(country.code)}
    >
      <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
    </button>
  );
}
/** Country reference rows intentionally have no photographic hero. */
export function CountryCard({ country }: { country: Country }) {
  return (
    <article className="country-reference">
      <div>
        <p className="place-metadata">
          {country.flag && (
            <img
              src={country.flag}
              alt=""
              loading="lazy"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
              width="20"
              height="14"
            />
          )}
          <span>{country.region}</span>
          <span>Country guide</span>
        </p>
        <h3 aria-label={country.name}>
          <Link
            to={`/destinations/${country.code}`}
            aria-label={`Explore ${country.name}`}
          >
            {country.name}
            <span aria-hidden="true"> ↗</span>
          </Link>
        </h3>
        <p>{country.capital.join(', ') || 'No capital listed'}</p>
      </div>
      <FavouriteButton country={country} />
    </article>
  );
}
