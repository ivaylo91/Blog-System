const buckets = new Map<string, { count: number; expiresAt: number }>();

export async function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  // In-memory rate limiter only — removed Upstash/Redis integration
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
