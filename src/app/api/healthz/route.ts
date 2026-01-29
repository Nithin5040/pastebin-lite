import { redis } from '@/lib/redis';
export async function GET() {
  try {
    await redis.ping();
    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    return Response.json({ ok: false }, { status: 500 });
  }
}