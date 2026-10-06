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
