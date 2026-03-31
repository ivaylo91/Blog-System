import { redisRateLimit } from './redis-rate-limit'

const buckets = new Map<string, { count: number; expiresAt: number }>();

export async function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  // Prefer Redis-backed limiter in production if configured
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      return await redisRateLimit(key, limit, windowMs)
    }
  } catch (e) {
    // fall back to in-memory implementation on error
    // eslint-disable-next-line no-console
    console.warn('Redis rate limit failed, using in-memory fallback', e)
  }

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.expiresAt <= now) {
    buckets.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.expiresAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - existing.count), resetAt: existing.expiresAt };
}
