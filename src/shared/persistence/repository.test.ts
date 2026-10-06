import { describe, it, expect } from 'vitest';
import { createRepository } from './repository';
import { parseFavourites } from '../../features/favourites/repository';
import { parseTrip } from '../../features/trip/repository';
import { validDate } from '../date';
import type { StoragePort } from './repository';
const stop = {
  id: 'one',
  code: 'JPN',
  name: 'Japan',
  arrival: '2026-10-06',
  departure: '2026-10-10',
  notes: 'Explore',
};
describe('versioned persistence', () => {
  function memory(): StoragePort {
    const values = new Map<string, string>();
    return {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => {
        values.set(key, value);
      },
    };
  }
  it('round trips a trip independently of browser APIs', () => {
    const storage = memory();
    const repo = createRepository('trip', [], parseTrip, () => storage);
    expect(repo.load()).toEqual({ value: [], warning: '' });
    expect(repo.save([stop])).toBe('');
    expect(repo.load().value).toEqual([stop]);
  });
  it('recovers safely from corrupt data without overwriting it on load', () => {
    const storage = memory();
    storage.setItem('trip', '{invalid');
    const repo = createRepository('trip', [], parseTrip, () => storage);
    expect(repo.load().warning).toBeTruthy();
    expect(storage.getItem('trip')).toBe('{invalid');
    storage.setItem('trip', JSON.stringify({ version: 99, data: [stop] }));
    expect(repo.load().value).toEqual([]);
  });
  it('reports inaccessible storage and quota failures', () => {
    const repo = createRepository('trip', [], parseTrip, () => {
      throw new Error('Access denied');
    });
    expect(repo.load().warning).toBeTruthy();
    expect(repo.save([stop])).toContain('session');
  });
  it('validates stored trip dates, duplicate stops and favourites', () => {
    expect(() => parseTrip([stop, stop])).toThrow();
    expect(() => parseTrip([{ ...stop, departure: '2026-10-01' }])).toThrow();
    expect(() => parseFavourites(['not-a-code'])).toThrow();
    expect(parseFavourites(['JPN', 'JPN'])).toEqual(['JPN']);
    expect(validDate('2026-02-30')).toBe(false);
  });
});
