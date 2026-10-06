export function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
export function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}
export function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}
export async function fetchJson(
  url: string,
  signal?: AbortSignal,
): Promise<unknown> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.any([
        AbortSignal.timeout(15000),
        ...(signal ? [signal] : []),
      ]),
    });
    if (!response.ok)
      throw new ApiError(
        response.status === 429
          ? 'The data service is busy. Please try again shortly.'
          : 'The data service is unavailable. Please try again.',
        response.status,
      );
    return (await response.json()) as unknown;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      'We could not reach the data service. Check your connection and try again.',
    );
  }
}
