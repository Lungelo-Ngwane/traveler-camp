import { describe, it, expect, vi } from 'vitest';
import { countriesFixture } from '../../../tests/fixtures';
import { parseCountries, filterCountries, pageNumber } from './api';
import { fetchJson } from '../../lib/api';
describe('country boundary', () => {
  it('maps response fields to domain data and discards invalid rows', () => {
    const data = parseCountries([
      ...countriesFixture,
      { name: { common: 'Unknown' } },
    ]);
    expect(data).toHaveLength(3);
    expect(data[0]).toMatchObject({
      code: 'JPN',
      languages: ['Japanese'],
      currencies: ['Japanese yen (JPY)'],
      coordinates: [36, 138],
    });
  });
  it('rejects service error envelopes and empty responses', () => {
    expect(() => parseCountries({ success: false, data: null })).toThrow();
    expect(() => parseCountries([])).toThrow();
  });
  it('handles missing optional fields and rejects unsafe flag URLs', () => {
    const [country] = parseCountries([
      {
        ...countriesFixture[0],
        flags: { svg: 'javascript:alert(1)' },
        latlng: [100, 22],
        population: -1,
        currencies: null,
        languages: null,
      },
    ]);
    expect(country).toMatchObject({
      flag: null,
      coordinates: null,
      population: null,
      currencies: [],
      languages: [],
    });
  });
  it('maps upstream rate limiting to an actionable error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 429 })),
    );
    await expect(fetchJson('https://example.com')).rejects.toThrow('busy');
    vi.unstubAllGlobals();
  });
});
describe('URL search', () => {
  const data = parseCountries(countriesFixture);
  it('combines capital search, region and favourites', () => {
    expect(
      filterCountries(
        data,
        new URLSearchParams('q=cape&region=Africa'),
        ['ZAF'],
        true,
      ).map((country) => country.code),
    ).toEqual(['ZAF']);
    expect(
      filterCountries(
        data,
        new URLSearchParams('q=Japan&region=Africa'),
        [],
        false,
      ),
    ).toEqual([]);
  });
  it('sorts population and ignores unsupported regions', () => {
    expect(
      filterCountries(
        data,
        new URLSearchParams('sort=population&region=invalid'),
        [],
      ).map((country) => country.code),
    ).toEqual(['JPN', 'ZAF', 'PRT']);
  });
  it('bounds invalid and stale page parameters', () => {
    for (const value of ['-1', 'no', '1.5'])
      expect(pageNumber(new URLSearchParams(`page=${value}`), 3)).toBe(1);
    expect(pageNumber(new URLSearchParams('page=99'), 3)).toBe(3);
  });
});
