import { redis, getCurrentTime } from '@/lib/redis';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const data: any = await redis.get(`paste:${params.id}`);
  const now = getCurrentTime(req.headers); // Requirement for deterministic testing [cite: 81]

  if (!data) return Response.json({ error: "Missing paste" }, { status: 404 }); 
  // Requirement: Check constraints [cite: 23, 109]
  if ((data.expires_at && now > data.expires_at) || 
      (data.max_views && data.view_count >= data.max_views)) {
    return Response.json({ error: "Unavailable" }, { status: 404 }); 
  }

  // Requirement: Successful API fetch counts as a view [cite: 65]
  data.view_count += 1;
  await redis.set(`paste:${params.id}`, data);

  return Response.json({
    content: data.content,
    remaining_views: data.max_views ? data.max_views - data.view_count : null,
    expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null 
  }, { status: 200 });
}