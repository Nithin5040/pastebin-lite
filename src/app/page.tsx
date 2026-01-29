"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [result, setResult] = useState<{ url: string; id: string } | null>(null);
  const [error, setError] = useState("");
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  // Requirement: UI should reflect health/connectivity [cite: 26, 31, 120]
  useEffect(() => {
    fetch("/api/healthz")
      .then((res) => res.json())
      .then((data) => setIsHealthy(data.ok))
      .catch(() => setIsHealthy(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    // Requirement: Content must be a non-empty string 
    if (!content.trim()) {
      setError("Content cannot be empty.");
      return;
    }

    try {
      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          ttl_seconds: ttl ? parseInt(ttl) : undefined,
          max_views: maxViews ? parseInt(maxViews) : undefined,
        }),
      });

      const data = await response.json();

      // Requirement: Handle invalid inputs with 4xx status [cite: 53, 111]
      if (!response.ok) {
        throw new Error(data.error || "Failed to create paste");
      }

      setResult(data);
      setContent("");
      setTtl("");
      setMaxViews("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-zinc-50 text-zinc-900">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Pastebin-Lite</h1>
          {/* Health Signal [cite: 89, 90] */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isHealthy ? 'System Online' : 'System Offline'}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-zinc-700">Paste Content</label>
            <textarea
              placeholder="Paste your arbitrary text here..."
              className="p-4 border border-zinc-300 rounded-lg h-48 focus:ring-2 focus:ring-black outline-none transition-all resize-none text-zinc-800"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-700">Expiry (Seconds)</label>
              <input
                type="number"
                placeholder="Optional TTL (e.g. 60)"
                className="p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-zinc-800"
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                min="1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-700">View Limit</label>
              <input
                type="number"
                placeholder="Optional (e.g. 5)"
                className="p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-zinc-800"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="bg-zinc-900 text-white p-4 rounded-lg font-bold hover:bg-zinc-800 active:scale-[0.98] transition-all"
          >
            Create Shareable Link
          </button>
        </form>

        {/* Error Feedback [cite: 119] */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Success Result [cite: 16, 51, 93] */}
        {result && (
          <div className="mt-8 p-6 bg-white border-2 border-green-500 rounded-xl shadow-md">
            <h2 className="text-lg font-bold text-green-700 mb-2">Paste Created!</h2>
            <p className="text-sm text-zinc-600 mb-4">Anyone with this link can view your paste until it expires or hits the view limit.</p>
            <div className="flex items-center gap-2 p-3 bg-zinc-100 rounded-lg border border-zinc-200">
              <input 
                readOnly 
                value={result.url} 
                className="bg-transparent flex-1 text-sm font-mono truncate outline-none"
              />
              <a 
                href={result.url} 
                target="_blank" 
                className="bg-zinc-900 text-white px-4 py-2 rounded text-xs font-bold hover:bg-zinc-800"
              >
                Open
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}