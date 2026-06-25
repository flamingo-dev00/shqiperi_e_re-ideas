import type { APIRoute } from 'astro';
import { emptyIdeasPayload, fetchIdeas } from '../../lib/ideas';

export const GET: APIRoute = async () => {
  try {
    const data = await fetchIdeas(import.meta.env.APPS_SCRIPT_API_URL);

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    });
  } catch (error) {
    console.error('Ideas API error:', error);

    return new Response(
      JSON.stringify({
        ...emptyIdeasPayload(),
        error: 'Burimi i të dhënave nuk është i disponueshëm.',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      },
    );
  }
};
