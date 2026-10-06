import type { ReactNode } from 'react';
import { parseTrip, tripRepository } from '../../lib/storage';
import { useRepository } from '../../lib/useRepository';
import { TripContext } from './context';
import { moveStop } from './calculations';
export function TripProvider({ children }: { children: ReactNode }) {
  const { value: stops, warning, update } = useRepository(tripRepository);
  return (
    <TripContext
      value={{
        stops,
        warning,
        add: (country) => {
          if (!stops.some((stop) => stop.code === country.code))
            update([
              ...stops,
              {
                id: crypto.randomUUID(),
                code: country.code,
                name: country.name,
                arrival: '',
                departure: '',
                notes: '',
              },
            ]);
        },
        remove: (id) => update(stops.filter((stop) => stop.id !== id)),
        edit: (id, changes) =>
          update(
            parseTrip(
              stops.map((stop) =>
                stop.id === id ? { ...stop, ...changes } : stop,
              ),
            ),
          ),
        move: (id, direction) => update(moveStop(stops, id, direction)),
      }}
    >
      {children}
    </TripContext>
  );
}
