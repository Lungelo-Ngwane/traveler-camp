import { record } from '../../shared/http';
import { validDate } from '../../shared/date';
import type { TripStop } from '../../domain/trip';
import { createRepository } from '../../shared/persistence/repository';
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

export const tripRepository = createRepository(
  'roamly:trip:v1',
  [],
  parseTrip,
  () => window.localStorage,
);
