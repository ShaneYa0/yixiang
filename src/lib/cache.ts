/**
 * Simple in-memory cache with TTL.
 * Used for APIs whose data changes only by date (Huangli, Fortune).
 */

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();

/** Store a value with a TTL in seconds. */
export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/** Get a cached value. Returns undefined if missing or expired. */
export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

/** Get or compute a value with caching. */
export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  compute: () => T | Promise<T>,
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== undefined) return cached;

  const value = await compute();
  cacheSet(key, value, ttlSeconds);
  return value;
}

/** Generate a cache key for daily data: prefix + YYYY-MM-DD */
export function dailyKey(prefix: string, date = new Date()): string {
  return `${prefix}:${date.toISOString().slice(0, 10)}`;
}
