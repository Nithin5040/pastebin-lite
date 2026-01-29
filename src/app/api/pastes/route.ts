import { nanoid } from 'nanoid';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, ttl_seconds, max_views } = body;

    // Requirement: content is required and must be a non-empty string [cite: 44]
    if (!content || typeof content !== 'string' || content.trim() === "") {
      return Response.json({ error: "content is required and must be a non-empty string" }, { status: 400 });
    }

    // Requirement: Validate ttl_seconds and max_views if present 
    if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
      return Response.json({ error: "ttl_seconds must be an integer >= 1" }, { status: 400 });
    }
    if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
      return Response.json({ error: "max_views must be an integer >= 1" }, { status: 400 });
    }

    const id = nanoid(10);
    const now = Date.now();
    const expiresAt = ttl_seconds ? now + (ttl_seconds * 1000) : null;

    const pasteData = {
      content,
      max_views: max_views || null,
      view_count: 0,
      expires_at: expiresAt,
    };

    // Requirement: Persistence must survive across requests 
    await redis.set(`paste:${id}`, pasteData);
    
    // Optional: Auto-delete from Redis after TTL + buffer for testing
    if (ttl_seconds) {
      await redis.expire(`paste:${id}`, ttl_seconds + 3600); 
    }

    // Requirement: Return JSON with id and url [cite: 50, 51]
    const baseUrl = new URL(req.url).origin;
    return Response.json({ 
      id, 
      url: `${baseUrl}/p/${id}` 
    }, { status: 201 });

  } catch (error) {
    return Response.json({ error: "Invalid JSON input" }, { status: 400 }); // [cite: 53]
  }
}