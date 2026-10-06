import { useQuery } from '@tanstack/react-query';
import { ApiError, fetchJson, finite, record } from '../../shared/http';
export interface Weather {
  temperature: number;
  wind: number;
  code: number;
  time: string;
}
export function parseWeather(payload: unknown): Weather {
  const data = record(payload);
  const current = record(data.current);
  const units = record(data.current_units);
  if (
    !finite(current.temperature_2m) ||
    !finite(current.wind_speed_10m) ||
    current.wind_speed_10m < 0 ||
    !finite(current.weather_code) ||
    typeof current.time !== 'string' ||
    !Number.isFinite(Date.parse(current.time)) ||
    units.temperature_2m !== '°C' ||
    units.wind_speed_10m !== 'km/h'
  )
    throw new ApiError('Weather is currently unavailable for this location.');
  return {
    temperature: current.temperature_2m,
    wind: current.wind_speed_10m,
    code: current.weather_code,
    time: current.time,
  };
}
export function weatherDescription(code: number): string {
  if (code === 0) return 'Clear skies';
  if ([1, 2, 3].includes(code)) return 'Partly cloudy to overcast';
  if ([45, 48].includes(code)) return 'Foggy';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunderstorms';
  return 'Conditions unavailable';
}
export function useWeather(coordinates: [number, number] | null) {
  return useQuery({
    queryKey: ['weather', coordinates],
    enabled: coordinates !== null,
    queryFn: async ({ signal }) => {
      if (!coordinates) throw new ApiError('No coordinates available.');
      const params = new URLSearchParams({
        latitude: String(coordinates[0]),
        longitude: String(coordinates[1]),
        current: 'temperature_2m,wind_speed_10m,weather_code',
        temperature_unit: 'celsius',
        wind_speed_unit: 'kmh',
        timezone: 'GMT',
      });
      return parseWeather(
        await fetchJson(
          `https://api.open-meteo.com/v1/forecast?${params}`,
          signal,
        ),
      );
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
