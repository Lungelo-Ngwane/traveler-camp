import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { createRepository } from './repository';
import { useRepository } from './useRepository';

it('accepts relevant localStorage updates and clear, ignores session storage, and cleans up', () => {
  window.localStorage.clear();
  const repository = createRepository(
    'test:saved',
    [] as string[],
    (value) => {
      if (
        !Array.isArray(value) ||
        !value.every((item) => typeof item === 'string')
      )
        throw new Error('Invalid collection');
      return value as string[];
    },
    () => window.localStorage,
  );
  const remove = vi.spyOn(window, 'removeEventListener');
  const { result, unmount } = renderHook(() => useRepository(repository));
  act(() => result.current.update(['session draft']));
  repository.save(['external change']);
  const dispatch = (key: string | null, storageArea: Storage) =>
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key, storageArea }));
    });
  dispatch(repository.key, window.sessionStorage);
  expect(result.current.value).toEqual(['session draft']);
  dispatch('unrelated', window.localStorage);
  expect(result.current.value).toEqual(['session draft']);
  dispatch(repository.key, window.localStorage);
  expect(result.current.value).toEqual(['external change']);
  window.localStorage.setItem(repository.key, '{invalid');
  dispatch(repository.key, window.localStorage);
  expect(result.current.value).toEqual([]);
  expect(result.current.warning).toBeTruthy();
  window.localStorage.clear();
  dispatch(null, window.localStorage);
  expect(result.current.warning).toBe('');
  const receive = remove.mock.calls.find(([type]) => type === 'storage');
  expect(receive).toBeUndefined();
  unmount();
  expect(remove).toHaveBeenCalledWith('storage', expect.any(Function));
});
