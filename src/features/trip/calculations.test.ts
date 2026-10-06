import { describe, it, expect } from 'vitest';
import { moveStop, nights, tripSummary } from './calculations';
const first = {
  id: '1',
  code: 'JPN',
  name: 'Japan',
  arrival: '2026-10-06',
  departure: '2026-10-10',
  notes: '',
};
const second = {
  ...first,
  id: '2',
  code: 'PRT',
  name: 'Portugal',
  arrival: '2026-10-12',
  departure: '2026-10-15',
};
describe('itinerary calculations', () => {
  it('counts nights across daylight-saving changes with date-only UTC values', () => {
    expect(nights('2026-10-24', '2026-10-27')).toBe(3);
    expect(nights('', '')).toBe(0);
    expect(nights('2026-10-10', '2026-10-01')).toBe(0);
  });
  it('distinguishes calendar span from planned nights', () => {
    expect(
      tripSummary([
        first,
        second,
        { ...first, id: '3', arrival: '', departure: '' },
      ]),
    ).toEqual({ nights: 7, span: 10, undated: 1 });
  });
  it('reorders without mutating stops and ignores invalid movements', () => {
    const stops = [first, second];
    expect(moveStop(stops, '2', -1)).toEqual([second, first]);
    expect(stops[0]).toBe(first);
    expect(moveStop(stops, '1', -1)).toBe(stops);
  });
});
