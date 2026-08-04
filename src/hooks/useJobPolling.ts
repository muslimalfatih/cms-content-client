import { useEffect, useRef, useState } from 'react';
import { ApiError } from '@/api/client';
import { getJob } from '@/api/jobs';
import { isSettled, type JobResult, type JobStatus } from '@/types/job';

export type JobPollState =
  | { kind: 'idle' }
  | { kind: 'waiting'; status: JobStatus }
  | { kind: 'completed'; result: JobResult }
  | { kind: 'failed'; result: JobResult }
  /** Polling itself broke — distinct from the job failing. */
  | { kind: 'unreachable'; reasons: string[] };

/** Generation is normally seconds; slow down rather than hammer a stalled job. */
const FAST_INTERVAL_MS = 1_000;
const SLOW_INTERVAL_MS = 3_000;
const SLOW_AFTER_ATTEMPTS = 20;

/**
 * A single dropped request should not lose a job that is still running.
 * Only a sustained outage is worth reporting.
 */
const MAX_CONSECUTIVE_FAILURES = 4;

/**
 * Polls a job until it settles.
 *
 * Uses a self-scheduling timeout rather than setInterval: an interval fires on
 * a fixed clock and would stack requests if one is slower than the period.
 */
export function useJobPolling(jobId: string | null) {
  const [state, setState] = useState<JobPollState>({ kind: 'idle' });
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAt = useRef(0);

  useEffect(() => {
    if (!jobId) {
      setState({ kind: 'idle' });
      setElapsedMs(0);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempt = 0;
    let failures = 0;

    startedAt.current = Date.now();
    setState({ kind: 'waiting', status: 'pending' });
    setElapsedMs(0);

    async function tick() {
      attempt += 1;

      try {
        const result = await getJob(jobId!);
        if (cancelled) return;

        failures = 0;
        setElapsedMs(Date.now() - startedAt.current);

        if (isSettled(result.status)) {
          setState(
            result.status === 'completed'
              ? { kind: 'completed', result }
              : { kind: 'failed', result },
          );
          return;
        }

        setState({ kind: 'waiting', status: result.status });
      } catch (error) {
        if (cancelled) return;

        failures += 1;
        if (failures >= MAX_CONSECUTIVE_FAILURES) {
          setState({
            kind: 'unreachable',
            reasons:
              error instanceof ApiError
                ? error.reasons
                : ['Lost contact with the server.'],
          });
          return;
        }
      }

      timer = setTimeout(
        tick,
        attempt < SLOW_AFTER_ATTEMPTS ? FAST_INTERVAL_MS : SLOW_INTERVAL_MS,
      );
    }

    void tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId]);

  return { state, elapsedMs };
}
