import { createContext, useContext } from 'react';
import type { Country, TripStop } from '../../lib/models';
export interface TripState {
  stops: TripStop[];
  warning: string;
  add(country: Country): void;
  remove(id: string): void;
  edit(
    id: string,
    changes: Pick<TripStop, 'arrival' | 'departure' | 'notes'>,
  ): void;
  move(id: string, direction: -1 | 1): void;
}
export const TripContext = createContext<TripState | null>(null);
export function useTrip() {
  const value = useContext(TripContext);
  if (!value) throw new Error('TripProvider is required');
  return value;
}
