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
export interface DestinationPhoto {
  path: string;
  alt: string;
  photographer: string;
  source: string;
  position?: string;
}
/** Editorial travel places, independently curated rather than inferred from country records. */
export interface Destination {
  slug: string;
  name: string;
  countryCode: string;
  countryName: string;
  region: string;
  locality: string;
  description: string;
  coordinates: [number, number];
  photo?: DestinationPhoto;
}
