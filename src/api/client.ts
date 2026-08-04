/**
 * The backend normalises every error to one shape through a global exception
 * filter, so a single reader covers validation failures, 404s and 500s.
 * `message` is an array when class-validator rejects several fields at once.
 */
interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export class ApiError extends Error {
  readonly status: number;
  /** Every reason the request was rejected, not just the first. */
  readonly reasons: string[];

  // Fields are declared rather than taken as parameter properties: the Vite
  // template enables `erasableSyntaxOnly`, which forbids that shorthand.
  constructor(status: number, reasons: string[]) {
    super(reasons[0] ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.reasons = reasons;
  }
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

if (!BASE_URL && import.meta.env.PROD) {
  // Failing at load is louder than every request 404ing against the origin.
  throw new Error('VITE_API_BASE_URL is not set');
}

/** Long enough for a cold container, short enough to not hang the UI. */
const TIMEOUT_MS = 30_000;

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...init.headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    // A network failure has no status, so it is reported as 0 rather than
    // pretending the server answered.
    const reason =
      error instanceof Error && error.name === 'TimeoutError'
        ? 'The server took too long to respond.'
        : 'Could not reach the server. Check your connection and try again.';

    throw new ApiError(0, [reason]);
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readReasons(response));
  }

  return (await response.json()) as T;
}

async function readReasons(response: Response): Promise<string[]> {
  try {
    const body = (await response.json()) as ApiErrorBody;

    if (Array.isArray(body.message)) return body.message;
    if (body.message) return [body.message];
    if (body.error) return [body.error];
  } catch {
    // A non-JSON body (a proxy error page, say) leaves nothing to read.
  }

  return [`Request failed with status ${response.status}`];
}
