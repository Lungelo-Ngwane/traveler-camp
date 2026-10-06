import type { Country } from '../../domain/country';
export const regions = [
  'Africa',
  'Americas',
  'Asia',
  'Europe',
  'Oceania',
  'Antarctic',
];
export function filterCountries(
  countries: Country[],
  params: URLSearchParams,
  favourites: string[],
  onlyFavourites = false,
): Country[] {
  const q = (params.get('q') ?? '').trim().toLocaleLowerCase();
  const region = params.get('region') ?? '';
  const filtered = countries.filter(
    (country) =>
      (!onlyFavourites || favourites.includes(country.code)) &&
      (!region || !regions.includes(region) || country.region === region) &&
      [country.name, ...country.capital].some((text) =>
        text.toLocaleLowerCase().includes(q),
      ),
  );
  return params.get('sort') === 'population'
    ? filtered.sort((a, b) => (b.population ?? -1) - (a.population ?? -1))
    : filtered;
}
export function pageNumber(
  params: URLSearchParams,
  totalPages: number,
): number {
  const page = Number(params.get('page') ?? 1);
  return Number.isInteger(page) && page > 0
    ? Math.min(page, Math.max(1, totalPages))
    : 1;
}
