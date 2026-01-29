import { NextRequest } from 'next/server'; // Use NextRequest for better type safety
import { redis, getCurrentTime } from '@/lib/redis';

// Change: params is now a Promise
export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> } 
) {
  // Change: You must await the params
  const { id } = await params;
  
  const data: any = await redis.get(`paste:${id}`);
  const now = getCurrentTime(req.headers);

  if (!data) return Response.json({ error: "Missing paste" }, { status: 404 });

  if ((data.expires_at && now > data.expires_at) || 
      (data.max_views && data.view_count >= data.max_views)) {
    return Response.json({ error: "Unavailable" }, { status: 404 });
  }

  data.view_count += 1;
  await redis.set(`paste:${id}`, data);

  return Response.json({
    content: data.content,
    remaining_views: data.max_views ? data.max_views - data.view_count : null,
    expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null
  }, { status: 200 });
}