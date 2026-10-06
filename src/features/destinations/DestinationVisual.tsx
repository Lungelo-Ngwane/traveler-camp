import { useState } from 'react';
import type { Destination } from '../../lib/models';
export function DestinationVisual({
  destination,
  sizes = '(max-width: 600px) calc(100vw - 40px), (max-width: 900px) calc((100vw - 105px) / 2), 400px',
}: {
  destination: Destination;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const photo = destination.photo;
  return (
    <div
      className={`destination-visual ${failed || !photo ? 'visual-fallback' : ''}`}
    >
      {photo && !failed ? (
        <img
          src={`/destinations/${photo.path}-480.jpg`}
          srcSet={`/destinations/${photo.path}-480.jpg 480w, /destinations/${photo.path}-960.jpg 960w`}
          sizes={sizes}
          alt={photo.alt}
          width="960"
          height="640"
          loading="lazy"
          decoding="async"
          style={{ objectPosition: photo.position }}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          role="img"
          aria-label={`${destination.name}: illustrated landscape, photograph unavailable`}
          className="landscape-art"
        >
          <span className="landscape-sun" />
          <span className="landscape-ridge" />
          <span className="landscape-caption">
            A little room for imagination
          </span>
        </div>
      )}
    </div>
  );
}
export function PhotoCredit({ destination }: { destination: Destination }) {
  return destination.photo ? (
    <a
      className="photo-credit"
      href={destination.photo.source}
      target="_blank"
      rel="noreferrer"
    >
      Photo: {destination.photo.photographer} / Pexels
      <span className="sr-only"> — {destination.name}, opens in a new tab</span>
    </a>
  ) : null;
}
