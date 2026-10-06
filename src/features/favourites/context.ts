import { createContext, useContext } from 'react';
export interface FavouritesState {
  codes: string[];
  warning: string;
  toggle(code: string): void;
}
export const FavouritesContext = createContext<FavouritesState | null>(null);
export function useFavourites() {
  const value = useContext(FavouritesContext);
  if (!value) throw new Error('FavouritesProvider is required');
  return value;
}
