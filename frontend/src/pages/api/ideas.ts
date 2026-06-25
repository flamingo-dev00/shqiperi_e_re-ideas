import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const apiUrl = import.meta.env.APPS_SCRIPT_API_URL;

  if (!apiUrl) {
    return new Response(
      JSON.stringify({ error: 'API URL not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const res = await fetch(`${apiUrl}?format=json`);
    if (!res.ok) throw new Error(`Upstream error: ${res.status}`);
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ ideas: [], stats: { approved: 0, pending: 0, rejected: 0 } }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
