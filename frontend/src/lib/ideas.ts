export interface Idea {
  timestamp: string;
  name: string;
  idea: string;
  status: 'APPROVED';
  score: number;
  reason: string;
}

export interface Stats {
  approved: number;
  pending: number;
  rejected: number;
}

export interface IdeasPayload {
  ideas: Idea[];
  stats: Stats;
}

const EMPTY_PAYLOAD: IdeasPayload = {
  ideas: [],
  stats: { approved: 0, pending: 0, rejected: 0 },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parsePayload(value: unknown): IdeasPayload {
  if (!isRecord(value) || !Array.isArray(value.ideas) || !isRecord(value.stats)) {
    throw new Error('Apps Script returned an unexpected JSON shape.');
  }

  if (value.ok === false) {
    throw new Error(
      typeof value.error === 'string'
        ? value.error
        : 'Apps Script reported an unknown error.',
    );
  }

  const ideas = value.ideas
    .filter(isRecord)
    .filter((item) => item.status === 'APPROVED')
    .map((item) => ({
      timestamp: typeof item.timestamp === 'string' ? item.timestamp : '',
      name: typeof item.name === 'string' ? item.name : 'Anonim',
      idea: typeof item.idea === 'string' ? item.idea : '',
      status: 'APPROVED' as const,
      score: isFiniteNumber(item.score) ? item.score : 0,
      reason: typeof item.reason === 'string' ? item.reason : '',
    }))
    .filter((item) => item.idea.length > 0);

  const { stats } = value;
  if (
    !isFiniteNumber(stats.approved) ||
    !isFiniteNumber(stats.pending) ||
    !isFiniteNumber(stats.rejected)
  ) {
    throw new Error('Apps Script returned invalid statistics.');
  }

  return {
    ideas,
    stats: {
      approved: stats.approved,
      pending: stats.pending,
      rejected: stats.rejected,
    },
  };
}

export function emptyIdeasPayload(): IdeasPayload {
  return {
    ideas: [...EMPTY_PAYLOAD.ideas],
    stats: { ...EMPTY_PAYLOAD.stats },
  };
}

export async function fetchIdeas(apiUrl: string | undefined): Promise<IdeasPayload> {
  if (!apiUrl) {
    throw new Error('APPS_SCRIPT_API_URL is not configured.');
  }

  const url = new URL(apiUrl);
  url.searchParams.set('format', 'json');

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });

  const contentType = response.headers.get('content-type') ?? '';
  const redirectedToLogin =
    response.redirected && response.url.includes('accounts.google.com');

  if (redirectedToLogin) {
    throw new Error(
      'Apps Script requires Google sign-in. Redeploy the web app with access set to Anyone.',
    );
  }

  if (!response.ok) {
    throw new Error(`Apps Script returned HTTP ${response.status}.`);
  }

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`Apps Script returned ${contentType || 'an unknown content type'}, not JSON.`);
  }

  return parsePayload(await response.json());
}
