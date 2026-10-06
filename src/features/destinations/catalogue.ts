import { regions } from './api';
import type { Destination } from '../../lib/models';
export const destinations: Destination[] = [
  {
    slug: 'cape-town',
    name: 'Cape Town',
    countryCode: 'ZAF',
    countryName: 'South Africa',
    region: 'Africa',
    locality: 'Western Cape',
    coordinates: [-33.9249, 18.4241],
    description:
      'Follow the coast, take in the mountain, and leave room for the unexpected.',
    photo: {
      path: 'cape-town',
      alt: 'Cape Town coastline with rocky cliffs and Table Mountain in the distance',
      photographer: 'Zak H',
      source:
        'https://www.pexels.com/photo/scenic-cape-town-coastline-with-table-mountain-view-33641515/',
    },
  },
  {
    slug: 'tokyo',
    name: 'Tokyo',
    countryCode: 'JPN',
    countryName: 'Japan',
    region: 'Asia',
    locality: 'Kantō',
    coordinates: [35.6762, 139.6503],
    description:
      'Find quiet neighbourhoods, lively streets, and a city with another story around every corner.',
    photo: {
      path: 'tokyo',
      alt: 'Tokyo Tower and the surrounding skyline at twilight',
      photographer: 'Sachith Ravishka Kodikara',
      source:
        'https://www.pexels.com/photo/tokyo-tower-over-buildings-in-city-19035816/',
      position: 'center 15%',
    },
  },
  {
    slug: 'bali',
    name: 'Bali',
    countryCode: 'IDN',
    countryName: 'Indonesia',
    region: 'Asia',
    locality: 'Lesser Sunda Islands',
    coordinates: [-8.4095, 115.1889],
    description:
      'Slow down among lakeside temples, green landscapes, and island paths.',
    photo: {
      path: 'bali',
      alt: 'Ulun Danu Bratan temple beside a lake in Bali',
      photographer: 'Сергей Сергеев',
      source:
        'https://www.pexels.com/photo/enchanting-bali-temple-amidst-lush-greenery-35160281/',
    },
  },
  {
    slug: 'paris',
    name: 'Paris',
    countryCode: 'FRA',
    countryName: 'France',
    region: 'Europe',
    locality: 'Île-de-France',
    coordinates: [48.8566, 2.3522],
    description:
      'Walk along the river, linger at a café, and explore the city one neighbourhood at a time.',
    photo: {
      path: 'paris',
      alt: 'Eiffel Tower above the Paris cityscape in daylight',
      photographer: 'Diego F. Parra',
      source:
        'https://www.pexels.com/photo/paris-cityscape-with-eiffel-tower-15452269/',
    },
  },
  {
    slug: 'lisbon',
    name: 'Lisbon',
    countryCode: 'PRT',
    countryName: 'Portugal',
    region: 'Europe',
    locality: 'Lisbon region',
    coordinates: [38.7223, -9.1393],
    description:
      'Take the long way through hillside streets and pause for a view across the Tagus.',
    photo: {
      path: 'lisbon',
      alt: 'Lisbon skyline and the Ponte 25 de Abril bridge at sunset',
      photographer: 'Mo Eid',
      source: 'https://www.pexels.com/photo/cityscape-of-lisbon-17887579/',
    },
  },
  {
    slug: 'zanzibar',
    name: 'Zanzibar',
    countryCode: 'TZA',
    countryName: 'Tanzania',
    region: 'Africa',
    locality: 'Zanzibar archipelago',
    coordinates: [-6.1659, 39.2026],
    description:
      'Make time for the coast, shaded lanes, and the changing colours of the Indian Ocean.',
    photo: {
      path: 'zanzibar',
      alt: 'Palm trees along the sandy shoreline in Zanzibar',
      photographer: 'Taryn Elliott',
      source:
        'https://www.pexels.com/photo/palm-trees-on-the-beach-shore-5993367/',
      position: 'center 85%',
    },
  },
];
export function filterDestinations(params: URLSearchParams): Destination[] {
  const q = (params.get('q') ?? '').trim().toLocaleLowerCase();
  const region = params.get('region') ?? '';
  return destinations.filter(
    (place) =>
      (!region || !regions.includes(region) || place.region === region) &&
      [place.name, place.countryName, place.locality].some((value) =>
        value.toLocaleLowerCase().includes(q),
      ),
  );
}
