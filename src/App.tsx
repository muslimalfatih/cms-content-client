import { useState } from 'react';
import { createJob } from '@/api/jobs';
import { BusinessForm } from '@/components/BusinessForm';
import { ErrorState } from '@/components/ErrorState';
import {
  GenerationSkeleton,
  JobStatusPanel,
} from '@/components/JobStatusPanel';
import { ResultViewer } from '@/components/ResultViewer';
import SmoothButton from '@/components/smoothui/smooth-button';
import { useJobPolling } from '@/hooks/useJobPolling';
import { toRequest, type FormValues } from '@/lib/validate';

const ROUTE_SHAPES = [
  '/',
  '/about',
  '/services',
  '/services/{slug}',
  '/service-areas',
  '/service-areas/{slug}',
  '/portfolio',
  '/portfolio/{slug}',
];

export default function App() {
  const [jobId, setJobId] = useState<string | null>(null);
  /** Kept so a failed job can be retried without re-entering everything. */
  const [submitted, setSubmitted] = useState<FormValues | null>(null);
  const [retrying, setRetrying] = useState(false);

  const { state, elapsedMs } = useJobPolling(jobId);

  function onSubmitted(id: string, values: FormValues) {
    setSubmitted(values);
    setJobId(id);
  }

  async function retry() {
    if (!submitted) return;
    setRetrying(true);
    try {
      const { jobId: id } = await createJob(toRequest(submitted));
      setJobId(id);
    } catch {
      // The panel keeps showing the previous failure; nothing new to add.
    } finally {
      setRetrying(false);
    }
  }

  function startOver() {
    setJobId(null);
    setSubmitted(null);
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-baseline gap-3 px-6 py-4">
          <span className="text-sm font-medium tracking-tight">
            Content Engine
          </span>
          <span className="text-muted-foreground font-mono text-xs">
            website generator
          </span>
        </div>
      </header>

      <main
        className={
          state.kind === 'completed'
            ? 'mx-auto max-w-5xl px-6 py-12 lg:py-16'
            : 'mx-auto grid max-w-5xl gap-12 px-6 py-12 lg:grid-cols-[1fr_260px] lg:gap-16 lg:py-20'
        }
      >
        <div className="order-2 lg:order-1">
          {state.kind !== 'completed' && (
            <>
              <h1 className="max-w-lg text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
                Describe the business. Get a structured website.
              </h1>
              <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed">
                Routes, section layout and internal links are computed from what
                you enter. A language model writes only the copy.
              </p>
            </>
          )}

          <div className={state.kind === 'completed' ? '' : 'mt-12'}>
            {state.kind === 'idle' ? (
              <BusinessForm onSubmitted={onSubmitted} />
            ) : (
              <div className="space-y-6">
                <JobStatusPanel
                  jobId={jobId!}
                  status={
                    state.kind === 'waiting'
                      ? state.status
                      : state.kind === 'completed'
                        ? 'completed'
                        : 'failed'
                  }
                  elapsedMs={elapsedMs}
                />

                {state.kind === 'waiting' && <GenerationSkeleton />}

                {state.kind === 'failed' && (
                  <ErrorState
                    title="Generation failed"
                    detail={state.result.errorMessage}
                    onRetry={retry}
                    retrying={retrying}
                  />
                )}

                {state.kind === 'unreachable' && (
                  <ErrorState
                    title="Lost contact with the server"
                    detail={state.reasons.join(' ')}
                    onRetry={retry}
                    retrying={retrying}
                  />
                )}

                {state.kind === 'completed' && (
                  <ResultViewer result={state.result} />
                )}

                {state.kind !== 'waiting' && (
                  <SmoothButton onClick={startOver} variant="ghost" size="sm">
                    Start over
                  </SmoothButton>
                )}
              </div>
            )}
          </div>
        </div>

        {state.kind !== 'completed' && (
          <aside className="order-1 lg:order-2 lg:pt-2">
            <h2 className="text-muted-foreground font-mono text-[11px] tracking-wider uppercase">
              Generated routes
            </h2>
            <ul className="mt-4 space-y-1.5">
              {ROUTE_SHAPES.map((route) => (
                <li
                  key={route}
                  className="text-muted-foreground font-mono text-xs"
                >
                  {route}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-6 text-xs leading-relaxed">
              Detail routes repeat per service, area and project.
            </p>
          </aside>
        )}
      </main>
    </div>
  );
}
