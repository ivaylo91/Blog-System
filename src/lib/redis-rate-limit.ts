import { Redis } from '@upstash/redis'

type RateLimitResult = { allowed: boolean; remaining: number }

export async function redisRateLimit(key: string, limit: number, ttl: number): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return { allowed: true, remaining: limit }

  const redis = new Redis({ url, token })
  const now = Date.now()
  const count = Number((await redis.incr(key)) ?? 0)
  if (count === 1) {
    await redis.expire(key, Math.ceil(ttl / 1000))
  }

  return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
}
