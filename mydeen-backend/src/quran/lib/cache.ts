import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || '');

export async function getJSON<T>(key: string): Promise<T | null> {
  const v = await redis.get(key);
  return v ? (JSON.parse(v) as T) : null;
}

export async function setJSON<T>(key: string, value: T, ttlSec = 86400) {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSec);
}

// Stale-While-Revalidate
export async function swr<T>(key: string, producer: () => Promise<T>, ttlSec = 86400): Promise<T> {
  const cached = await getJSON<T>(key);
  if (cached) {
    producer().then(v => setJSON(key, v, ttlSec)).catch(() => {});
    return cached;
  }
  const fresh = await producer();
  await setJSON(key, fresh, ttlSec);
  return fresh;
}
