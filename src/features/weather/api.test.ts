import { describe, it, expect } from 'vitest';
import { weatherFixture } from '../../../tests/fixtures';
import { parseWeather, weatherDescription } from './api';
describe('weather boundary', () => {
  it('maps explicit Celsius and km/h units', () => {
    expect(parseWeather(weatherFixture)).toEqual({
      temperature: 22.5,
      wind: 8,
      code: 2,
      time: '2026-10-06T12:00',
    });
  });
  it('rejects malformed data and incorrect units', () => {
    expect(() => parseWeather({})).toThrow();
    expect(() =>
      parseWeather({
        ...weatherFixture,
        current_units: { temperature_2m: '°F', wind_speed_10m: 'mph' },
      }),
    ).toThrow();
    expect(() =>
      parseWeather({
        ...weatherFixture,
        current: { ...weatherFixture.current, time: 'invalid' },
      }),
    ).toThrow();
  });
  it('does not describe unknown weather as clear', () => {
    expect(weatherDescription(999)).toBe('Conditions unavailable');
    expect(weatherDescription(95)).toBe('Thunderstorms');
  });
});
