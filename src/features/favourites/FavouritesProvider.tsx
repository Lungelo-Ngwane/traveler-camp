import type { ReactNode } from 'react';
import { favouritesRepository } from './repository';
import { useRepository } from '../../shared/persistence/useRepository';
import { FavouritesContext } from './context';
export function FavouritesProvider({ children }: { children: ReactNode }) {
  const { value: codes, warning, update } = useRepository(favouritesRepository);
  return (
    <FavouritesContext
      value={{
        codes,
        warning,
        toggle: (code) =>
          update(
            codes.includes(code)
              ? codes.filter((item) => item !== code)
              : [...codes, code],
          ),
      }}
    >
      {children}
    </FavouritesContext>
  );
}
