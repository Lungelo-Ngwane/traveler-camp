import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { destinations, filterDestinations } from './catalogue';
import { DestinationVisual } from './DestinationVisual';
describe('curated travel discovery', () => {
  it('searches places and locality independently of country metadata', () => {
    expect(
      filterDestinations(new URLSearchParams('q=bali')).map(
        (place) => place.countryCode,
      ),
    ).toEqual(['IDN']);
    expect(
      filterDestinations(
        new URLSearchParams('q=Western Cape&region=Africa'),
      ).map((place) => place.slug),
    ).toEqual(['cape-town']);
    expect(
      filterDestinations(new URLSearchParams('q=Japan&region=Europe')),
    ).toEqual([]);
    expect(
      filterDestinations(new URLSearchParams('region=invalid')),
    ).toHaveLength(destinations.length);
  });
  it('uses a deliberate accessible illustration when a photograph fails', () => {
    const destination = destinations[0]!;
    render(<DestinationVisual destination={destination} />);
    fireEvent.error(screen.getByRole('img', { name: destination.photo!.alt }));
    expect(
      screen.getByRole('img', {
        name: `${destination.name}: illustrated landscape, photograph unavailable`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: destination.photo!.alt }),
    ).not.toBeInTheDocument();
  });
  it('supports a place without any image mapping', () => {
    render(
      <DestinationVisual
        destination={{ ...destinations[0]!, photo: undefined }}
      />,
    );
    expect(
      screen.getByRole('img', { name: /illustrated landscape/ }),
    ).toBeInTheDocument();
  });
});
