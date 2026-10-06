import { record } from '../http';
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export interface Repository<T> {
  key: string;
  load(): { value: T; warning: string };
  save(value: T): string;
}
export function createRepository<T>(
  key: string,
  empty: T,
  parse: (value: unknown) => T,
  getStorage: () => StoragePort,
): Repository<T> {
  return {
    key,
    load() {
      try {
        const raw = getStorage().getItem(key);
        if (raw === null) return { value: empty, warning: '' };
        const envelope = record(JSON.parse(raw) as unknown);
        if (envelope.version !== 1)
          throw new Error('Unsupported storage version');
        return { value: parse(envelope.data), warning: '' };
      } catch {
        return {
          value: empty,
          warning:
            'Saved data could not be loaded. Changes will stay in this session unless browser storage is available.',
        };
      }
    },
    save(value) {
      try {
        getStorage().setItem(key, JSON.stringify({ version: 1, data: value }));
        return '';
      } catch {
        return 'Your changes are available in this session, but could not be saved. Browser storage may be full or disabled.';
      }
    },
  };
}
