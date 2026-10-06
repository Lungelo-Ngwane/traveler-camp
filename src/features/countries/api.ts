import { queryOptions, useQuery } from '@tanstack/react-query';
import {
  ApiError,
  fetchJson,
  finite,
  record,
  strings,
} from '../../shared/http';
import type { Country } from '../../domain/country';

export const COUNTRIES_URL =
  'https://restcountries.conventus.de/v3.1/all?fields=name,cca3,capital,region,population,latlng,languages,currencies,timezones,flags';
export function parseCountries(payload: unknown): Country[] {
  if (!Array.isArray(payload))
    throw new ApiError('The country service returned an unexpected response.');
  const countries = payload
    .map((value): Country | null => {
      const item = record(value);
      const name = record(item.name).common;
      if (
        typeof name !== 'string' ||
        !name ||
        typeof item.cca3 !== 'string' ||
        !/^[A-Z]{3}$/.test(item.cca3) ||
        typeof item.region !== 'string'
      )
        return null;
      const coords = item.latlng;
      const coordinates: Country['coordinates'] =
        Array.isArray(coords) &&
        finite(coords[0]) &&
        finite(coords[1]) &&
        Math.abs(coords[0]) <= 90 &&
        Math.abs(coords[1]) <= 180
          ? [coords[0], coords[1]]
          : null;
      const flag = record(item.flags).svg;
      return {
        code: item.cca3,
        name,
        capital: strings(item.capital),
        region: item.region,
        population:
          finite(item.population) && item.population >= 0
            ? item.population
            : null,
        coordinates,
        languages: strings(Object.values(record(item.languages))),
        currencies: Object.entries(record(item.currencies)).map(
          ([code, currency]) =>
            `${typeof record(currency).name === 'string' ? record(currency).name : code} (${code})`,
        ),
        timezones: strings(item.timezones),
        flag:
          typeof flag === 'string' && /^https:\/\//.test(flag) ? flag : null,
      };
    })
    .filter((item): item is Country => item !== null);
  if (!countries.length)
    throw new ApiError('No usable country information was returned.');
  return Array.from(
    new Map(countries.map((country) => [country.code, country])).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));
}
export const countriesOptions = queryOptions({
  queryKey: ['countries'],
  queryFn: async ({ signal }) =>
    parseCountries(await fetchJson(COUNTRIES_URL, signal)),
  staleTime: 24 * 60 * 60 * 1000,
  gcTime: 24 * 60 * 60 * 1000,
  retry: 1,
});
export function useCountries() {
  return useQuery(countriesOptions);
}
