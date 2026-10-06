import { record } from './api';
import type { TripStop } from './models';
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export interface Repository<T> {
  key: string;
  load(): { value: T; warning: string };
  save(value: T): string;
}
export function createRepository<T>(
  key: string,
  empty: T,
  parse: (value: unknown) => T,
  getStorage: () => StoragePort,
): Repository<T> {
  return {
    key,
    load() {
      try {
        const raw = getStorage().getItem(key);
        if (raw === null) return { value: empty, warning: '' };
        const envelope = record(JSON.parse(raw) as unknown);
        if (envelope.version !== 1)
          throw new Error('Unsupported storage version');
        return { value: parse(envelope.data), warning: '' };
      } catch {
        return {
          value: empty,
          warning:
            'Saved data could not be loaded. Changes will stay in this session unless browser storage is available.',
        };
      }
    },
    save(value) {
      try {
        getStorage().setItem(key, JSON.stringify({ version: 1, data: value }));
        return '';
      } catch {
        return 'Your changes are available in this session, but could not be saved. Browser storage may be full or disabled.';
      }
    },
  };
}
export function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function parseFavourites(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    !value.every(
      (code): code is string =>
        typeof code === 'string' && /^[A-Z]{3}$/.test(code),
    )
  )
    throw new Error('Invalid favourites');
  return [...new Set(value)];
}
export function parseTrip(value: unknown): TripStop[] {
  if (!Array.isArray(value)) throw new Error('Invalid itinerary');
  const items = value.map((item) => {
    const stop = record(item);
    if (
      typeof stop.id !== 'string' ||
      !stop.id ||
      typeof stop.code !== 'string' ||
      !/^[A-Z]{3}$/.test(stop.code) ||
      typeof stop.name !== 'string' ||
      !stop.name ||
      typeof stop.notes !== 'string' ||
      stop.notes.length > 2000 ||
      typeof stop.arrival !== 'string' ||
      typeof stop.departure !== 'string' ||
      (stop.arrival !== '' && !validDate(stop.arrival)) ||
      (stop.departure !== '' && !validDate(stop.departure)) ||
      (stop.arrival && stop.departure && stop.departure < stop.arrival)
    )
      throw new Error('Invalid itinerary stop');
    return {
      id: stop.id,
      code: stop.code,
      name: stop.name,
      notes: stop.notes,
      arrival: stop.arrival,
      departure: stop.departure,
    };
  });
  if (
    new Set(items.map((item) => item.id)).size !== items.length ||
    new Set(items.map((item) => item.code)).size !== items.length
  )
    throw new Error('Duplicate itinerary stops');
  return items;
}
export const favouritesRepository = createRepository(
  'roamly:favourites:v1',
  [],
  parseFavourites,
  () => window.localStorage,
);
export const tripRepository = createRepository(
  'roamly:trip:v1',
  [],
  parseTrip,
  () => window.localStorage,
);
