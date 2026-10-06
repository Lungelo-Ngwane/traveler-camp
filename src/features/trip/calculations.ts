import type { TripStop } from '../../domain/trip';
import { validDate } from '../../shared/date';
export function nights(arrival: string, departure: string): number {
  return validDate(arrival) && validDate(departure) && departure >= arrival
    ? (Date.parse(departure) - Date.parse(arrival)) / 86400000
    : 0;
}
export function tripSummary(stops: TripStop[]) {
  const dated = stops.filter((stop) => stop.arrival && stop.departure);
  const arrivals = dated.map((stop) => stop.arrival).sort();
  const departures = dated.map((stop) => stop.departure).sort();
  const start = arrivals[0] ?? '';
  const end = departures.at(-1) ?? '';
  return {
    nights: stops.reduce(
      (sum, stop) => sum + nights(stop.arrival, stop.departure),
      0,
    ),
    span: start && end ? nights(start, end) + 1 : 0,
    undated: stops.length - dated.length,
  };
}
export function moveStop(
  stops: TripStop[],
  id: string,
  direction: -1 | 1,
): TripStop[] {
  const index = stops.findIndex((stop) => stop.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= stops.length) return stops;
  const result = [...stops];
  const current = result[index];
  const other = result[target];
  if (current && other) {
    result[index] = other;
    result[target] = current;
  }
  return result;
}
