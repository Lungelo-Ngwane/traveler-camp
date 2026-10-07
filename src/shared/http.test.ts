import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchJson } from './http';

afterEach(() => vi.unstubAllGlobals());

function abortableFetch() {
  const fetch = vi.fn(
    (_url: string, { signal }: { signal: AbortSignal }) =>
      new Promise<never>((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), {
          once: true,
        });
      }),
  );
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

describe('HTTP lifecycle', () => {
  it('passes cancellation through without converting it to a service error', async () => {
    const fetch = abortableFetch();
    const controller = new AbortController();
    const result = fetchJson('https://example.com', controller.signal);
    const reason = new DOMException('Route left', 'AbortError');
    controller.abort(reason);
    await expect(result).rejects.toBe(reason);
    expect(fetch.mock.calls[0]![1].signal.aborted).toBe(true);
  });

  it('applies the timeout and surfaces an actionable error', async () => {
    const controller = new AbortController();
    const timeout = vi
      .spyOn(AbortSignal, 'timeout')
      .mockReturnValue(controller.signal);
    abortableFetch();
    const result = fetchJson('https://example.com');
    controller.abort(new DOMException('Timed out', 'TimeoutError'));
    await expect(result).rejects.toThrow('Check your connection');
    expect(timeout).toHaveBeenCalledWith(15000);
  });

  it('rejects invalid JSON instead of returning unchecked content', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{invalid', { status: 200 })),
    );
    await expect(fetchJson('https://example.com')).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
