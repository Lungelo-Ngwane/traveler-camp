import { useEffect, useId, useRef, useState } from 'react';
import type { Country } from '../../domain/country';
import type { Destination } from '../../domain/destination';
import { DestinationCard } from './DestinationCard';

export function DestinationCarousel({
  destinations,
  countries,
}: {
  destinations: Destination[];
  countries?: Country[];
}) {
  const track = useRef<HTMLUListElement>(null);
  const id = useId();
  const [bounds, setBounds] = useState({ start: true, end: true });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () =>
      setBounds({
        start: element.scrollLeft <= 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    update();
    element.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(element);
    return () => {
      element.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [destinations]);
  function move(direction: -1 | 1) {
    const element = track.current;
    if (!element) return;
    const slide = element.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(element).columnGap) || 0;
    element.scrollBy({
      left:
        direction *
        ((slide?.getBoundingClientRect().width ?? element.clientWidth) + gap),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }
  return (
    <div
      className="destination-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured destinations"
    >
      <div className="carousel-toolbar">
        <span>Swipe or use the arrows to explore</span>
        <div className="carousel-controls">
          <button
            type="button"
            aria-label="Previous destinations"
            aria-controls={id}
            disabled={bounds.start}
            onClick={() => move(-1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next destinations"
            aria-controls={id}
            disabled={bounds.end}
            onClick={() => move(1)}
          >
            →
          </button>
        </div>
      </div>
      <ul
        ref={track}
        id={id}
        className="carousel-track"
        tabIndex={0}
        aria-label="Destination cards"
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            move(event.key === 'ArrowRight' ? 1 : -1);
          }
          if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            event.currentTarget.scrollTo({
              left: event.key === 'Home' ? 0 : event.currentTarget.scrollWidth,
              behavior: 'auto',
            });
          }
        }}
      >
        {destinations.map((destination) => (
          <li className="carousel-slide" key={destination.slug}>
            <DestinationCard
              destination={destination}
              country={countries?.find(
                (country) => country.code === destination.countryCode,
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
