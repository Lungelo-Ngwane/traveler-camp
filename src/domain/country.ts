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
