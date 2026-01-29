import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Logic for deterministic testing requirement [cite: 78, 79, 81]
export function getCurrentTime(headers: Headers): number {
  if (process.env.TEST_MODE === '1') {
    const testTime = headers.get('x-test-now-ms');
    if (testTime) return parseInt(testTime);
  }
  return Date.now();
}