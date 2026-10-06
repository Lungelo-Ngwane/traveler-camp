import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { TripStop } from '../../lib/models';
import { validDate } from '../../lib/storage';
import { Feedback } from '../../components/Feedback';
import { useTrip } from './context';
import { nights, tripSummary } from './calculations';
function StopEditor({
  stop,
  index,
  total,
}: {
  stop: TripStop;
  index: number;
  total: number;
}) {
  const trip = useTrip();
  const [draft, setDraft] = useState({
    arrival: stop.arrival,
    departure: stop.departure,
    notes: stop.notes,
  });
  const [message, setMessage] = useState('');
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      (draft.arrival && !validDate(draft.arrival)) ||
      (draft.departure && !validDate(draft.departure)) ||
      (draft.departure && !draft.arrival) ||
      (draft.arrival && draft.departure && draft.departure < draft.arrival)
    ) {
      setMessage('Choose an arrival date and a departure on or after arrival.');
      return;
    }
    trip.edit(stop.id, draft);
    setMessage('Stop saved.');
  }
  return (
    <li className="trip-stop">
      <div className="stop-heading">
        <span className="stop-number">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div>
          <span className="eyebrow">Your next stop</span>
          <h2>
            <Link to={`/destinations/${stop.code}`}>{stop.name}</Link>
          </h2>
          <p>
            {stop.arrival && stop.departure
              ? `${nights(stop.arrival, stop.departure)} nights`
              : 'Dates to be decided'}
          </p>
        </div>
      </div>
      <form onSubmit={submit} aria-label={`Plan ${stop.name}`}>
        <div className="date-fields">
          <label>
            Arrival
            <input
              type="date"
              value={draft.arrival}
              onChange={(event) => {
                setDraft({ ...draft, arrival: event.target.value });
                setMessage('');
              }}
            />
          </label>
          <label>
            Departure
            <input
              type="date"
              min={draft.arrival || undefined}
              value={draft.departure}
              onChange={(event) => {
                setDraft({ ...draft, departure: event.target.value });
                setMessage('');
              }}
            />
          </label>
        </div>
        <label>
          Ideas & notes
          <textarea
            value={draft.notes}
            maxLength={2000}
            placeholder="A trail to walk, a place to stay, a dish to try…"
            onChange={(event) => {
              setDraft({ ...draft, notes: event.target.value });
              setMessage('');
            }}
          />
        </label>
        <div className="stop-actions">
          <button type="submit">Save stop</button>
          <button
            type="button"
            className="secondary"
            disabled={index === 0}
            aria-label={`Move ${stop.name} up`}
            onClick={() => trip.move(stop.id, -1)}
          >
            ↑ Move up
          </button>
          <button
            type="button"
            className="secondary"
            disabled={index === total - 1}
            aria-label={`Move ${stop.name} down`}
            onClick={() => trip.move(stop.id, 1)}
          >
            ↓ Move down
          </button>
          <button
            type="button"
            className="text-button danger"
            onClick={() => trip.remove(stop.id)}
            aria-label={`Remove ${stop.name}`}
          >
            Remove
          </button>
        </div>
        <p role="status">{message}</p>
      </form>
    </li>
  );
}
export function Component() {
  const { stops } = useTrip();
  const summary = tripSummary(stops);
  return (
    <section className="trip-page">
      <span className="eyebrow">Make room for adventure</span>
      <h1>Your journey, taking shape.</h1>
      <p>Build a simple itinerary. Your saved plans stay in this browser.</p>
      {!stops.length ? (
        <Feedback title="Every journey starts somewhere">
          <p>Add a destination from its guide to start planning.</p>
          <Link className="button" to="/">
            Find your first stop →
          </Link>
        </Feedback>
      ) : (
        <div className="trip-columns">
          <ol className="trip-list">
            {stops.map((stop, index) => (
              <StopEditor
                key={stop.id}
                stop={stop}
                index={index}
                total={stops.length}
              />
            ))}
          </ol>
          <aside className="trip-summary">
            <span className="eyebrow">At a glance</span>
            <h2>The adventure so far</h2>
            <dl>
              <div>
                <dt>Destinations</dt>
                <dd>{stops.length}</dd>
              </div>
              <div>
                <dt>Planned nights</dt>
                <dd>{summary.nights}</dd>
              </div>
              <div>
                <dt>Calendar span</dt>
                <dd>
                  {summary.span
                    ? `${summary.span} days`
                    : 'Dates to be decided'}
                </dd>
              </div>
            </dl>
            {summary.undated > 0 && (
              <p>{summary.undated} stops still need dates.</p>
            )}
            <p className="muted">
              Nights are summed across stops. Overlapping dates count twice;
              gaps are included in the calendar span. Reordering does not change
              dates.
            </p>
            <Link className="button light" to="/">
              Add another destination →
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
