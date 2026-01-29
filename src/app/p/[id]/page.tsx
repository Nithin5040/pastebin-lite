import { redis } from '@/lib/redis';
import { notFound } from 'next/navigation';

// CRITICAL: Disable caching so the view count updates on every refresh
export const revalidate = 0;

export default async function ViewPaste({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const data: any = await redis.get(`paste:${id}`);

  if (!data) {
    notFound();
  }

  const now = Date.now();

  // 1. Check constraints BEFORE incrementing
  if (data.expires_at && now > data.expires_at) {
    notFound();
  }

  if (data.max_views && data.view_count >= data.max_views) {
    notFound();
  }

  // 2. INCREMENT AND SAVE: This makes the view counter work
  data.view_count += 1;
  await redis.set(`paste:${id}`, data);

  return (
    <main className="min-h-screen p-8 bg-zinc-50 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h1 className="text-xl font-bold mb-4 text-zinc-800 border-b pb-2">View Paste</h1>
        
        <pre className="p-4 bg-zinc-50 rounded border border-zinc-200 overflow-x-auto whitespace-pre-wrap font-mono text-zinc-900">
          {data.content}
        </pre>
        
        <div className="mt-4 text-sm text-zinc-500 flex gap-4">
          {/* We show the updated data.view_count here */}
          {data.max_views && (
            <span>Views: {data.view_count} / {data.max_views}</span>
          )}
          {data.expires_at && (
            <span>Expires: {new Date(data.expires_at).toLocaleString()}</span>
          )}
        </div>
      </div>
    </main>
  );
}