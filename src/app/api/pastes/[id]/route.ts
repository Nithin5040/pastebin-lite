import { NextRequest } from 'next/server';
import { redis, getCurrentTime } from '@/lib/redis';

// FIX: Params must be a Promise in the type definition
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // FIX: Await the params before using 'id'
  const { id } = await params;

  // Requirement: Fetch from the persistence layer
  const data: any = await redis.get(`paste:${id}`);
  
  // Requirement: Use the helper to handle the x-test-now-ms header
  const now = getCurrentTime(req.headers);

  // Requirement: If missing, return 404
  if (!data) {
    return Response.json({ error: "Missing paste" }, { status: 404 });
  }

  // Requirement: Check constraints (TTL and View Limits)
  if ((data.expires_at && now > data.expires_at) || 
      (data.max_views && data.view_count >= data.max_views)) {
    return Response.json({ error: "Unavailable" }, { status: 404 });
  }

  // Requirement: Successful API fetch counts as a view
  data.view_count += 1;
  await redis.set(`paste:${id}`, data);

  return Response.json({
    content: data.content,
    remaining_views: data.max_views ? data.max_views - data.view_count : null,
    expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null
  }, { status: 200 });
}