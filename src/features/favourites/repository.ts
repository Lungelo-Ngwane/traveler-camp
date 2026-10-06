import { createRepository } from '../../shared/persistence/repository';
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

export const favouritesRepository = createRepository(
  'roamly:favourites:v1',
  [],
  parseFavourites,
  () => window.localStorage,
);
