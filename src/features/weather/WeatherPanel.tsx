import { useWeather, weatherDescription } from './api';
export function WeatherPanel({
  coordinates,
  locationName,
}: {
  coordinates: [number, number] | null;
  locationName?: string;
}) {
  const query = useWeather(coordinates);
  return (
    <section className="weather-panel" aria-labelledby="weather-heading">
      <span className="eyebrow">A glimpse outside</span>
      <h2 id="weather-heading">Current weather</h2>
      {!coordinates ? (
        <p>No destination coordinates are available.</p>
      ) : query.isPending ? (
        <p role="status">Checking the skies…</p>
      ) : query.isError && !query.data ? (
        <div role="status">
          <p>
            Weather could not be loaded. Your destination guide is still
            available.
          </p>
          <button
            onClick={() => {
              void query.refetch();
            }}
          >
            Retry weather
          </button>
        </div>
      ) : (
        query.data && (
          <>
            <p className="temperature">
              {Math.round(query.data.temperature)}
              <span> °C</span>
            </p>
            <p>
              {weatherDescription(query.data.code)} · Wind{' '}
              {Math.round(query.data.wind)} km/h
            </p>
            <p className="muted">
              {locationName
                ? `Model conditions near ${locationName}.`
                : 'Model conditions at the country coordinates, not a city forecast.'}{' '}
              Updated {query.data.time.replace('T', ' ')} UTC.
            </p>
            {query.isError && (
              <p role="status">
                Weather refresh failed; showing the last available conditions.{' '}
                <button
                  onClick={() => {
                    void query.refetch();
                  }}
                >
                  Retry weather
                </button>
              </p>
            )}
          </>
        )
      )}
      <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
        Weather data by Open-Meteo
      </a>
    </section>
  );
}
