export interface Country {
  code: string;
  name: string;
  capital: string[];
  region: string;
  population: number | null;
  coordinates: [number, number] | null;
  languages: string[];
  currencies: string[];
  timezones: string[];
  flag: string | null;
}
export interface TripStop {
  id: string;
  code: string;
  name: string;
  arrival: string;
  departure: string;
  notes: string;
}
