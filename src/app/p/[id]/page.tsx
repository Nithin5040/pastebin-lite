import { redis } from '@/lib/redis';
import { notFound } from 'next/navigation';

export default async function ViewPaste({ params }: { params: { id: string } }) {
  // Await params in Next.js 15+ 
  const { id } = await params;
  
  // Requirement: Fetch from persistence layer [cite: 86]
  const data: any = await redis.get(`paste:${id}`);

  // Requirement: If paste is missing, return HTTP 404 [cite: 67, 71]
  if (!data) {
    notFound();
  }

  const now = Date.now();

  // Requirement: If expired, return HTTP 404 [cite: 68, 71, 75]
  if (data.expires_at && now > data.expires_at) {
    notFound();
  }

  // Requirement: If view limit exceeded, return HTTP 404 [cite: 69, 71, 75]
  if (data.max_views && data.view_count >= data.max_views) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8 bg-zinc-50 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h1 className="text-xl font-bold mb-4 text-zinc-800 border-b pb-2">View Paste</h1>
        
        {/* Requirement: Render content safely (No script execution)  */}
        {/* React escapes strings in curly braces {} by default, preventing XSS */}
        <pre className="p-4 bg-zinc-50 rounded border border-zinc-200 overflow-x-auto whitespace-pre-wrap font-mono text-zinc-900">
          {data.content}
        </pre>
        
        <div className="mt-4 text-sm text-zinc-500 flex gap-4">
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