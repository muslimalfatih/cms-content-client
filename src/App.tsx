import { useState } from 'react';
import { createJob } from '@/api/jobs';
import { BusinessForm } from '@/components/BusinessForm';
import { ErrorState } from '@/components/ErrorState';
import { JobStatusPanel } from '@/components/JobStatusPanel';
import { ResultViewer } from '@/components/ResultViewer';
import AILoader from '@/components/smoothui/ai-loader';
import SmoothButton from '@/components/smoothui/smooth-button';
import { useJobPolling } from '@/hooks/useJobPolling';
import { cn } from '@/lib/utils';
import { toRequest, type FormValues } from '@/lib/validate';

export default function App() {
  const [jobId, setJobId] = useState<string | null>(null);
  /** Kept so a failed job can be retried without re-entering everything. */
  const [submitted, setSubmitted] = useState<FormValues | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [route, setRoute] = useState<string>();

  const { state } = useJobPolling(jobId);

  const pages =
    state.kind === 'completed' ? (state.result.website?.pages ?? []) : [];
  const selected = route ?? pages[0]?.route;

  function onSubmitted(id: string, values: FormValues) {
    setSubmitted(values);
    setRoute(undefined);
    setJobId(id);
  }

  async function retry() {
    if (!submitted) return;
    setRetrying(true);
    try {
      const { jobId: id } = await createJob(toRequest(submitted));
      setRoute(undefined);
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
    setRoute(undefined);
  }

  return (
    <div className="min-h-dvh">
      {/* Sticky with a translucent backdrop: the result view is long, and a
          header that scrolls away takes the identity of the page with it. */}
      <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-6 py-3.5">
          <span className="size-5 rounded-[6px] bg-[var(--color-brand)] shadow-sm ring-1 ring-white/20 ring-inset" />
          <span className="text-sm font-semibold tracking-tight">
            Content Engine
          </span>
          {/* A hairline rule separates more cleanly than punctuation. */}
          <span className="bg-border hidden h-3.5 w-px sm:block" />
          <span className="text-muted-foreground hidden text-xs sm:block">
            website generator
          </span>
        </div>
      </header>

      {/* Two modes, not two layouts fighting: the form runs single-column at a
          readable measure, and the rail appears only once there are pages to
          navigate between. */}
      <main
        className={cn(
          'mx-auto px-6 py-12 lg:py-16',
          pages.length
            ? 'grid max-w-5xl gap-12 lg:grid-cols-[1fr_220px] lg:gap-14'
            : 'max-w-2xl',
        )}
      >
        <div className="order-2 min-w-0 lg:order-1">
          {state.kind === 'idle' && (
            <>
              <h1 className="max-w-lg text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
                Describe the business. Get a structured website.
              </h1>
              <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed">
                Routes, section layout and internal links are computed from what
                you enter. A language model writes only the copy.
              </p>
              <div className="mt-12">
                <BusinessForm onSubmitted={onSubmitted} />
              </div>
            </>
          )}

          {state.kind !== 'idle' && (
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
                progress={state.kind === 'waiting' ? state.progress : undefined}
              />

              {state.kind === 'waiting' && (
                <div className="flex flex-col items-center gap-4 rounded-lg border py-16">
                  <AILoader variant="grid" />
                  {/* Says which of the two long waits this is. A rate limit and
                      a slow model look identical from here otherwise, and only
                      one of them means anything is wrong. */}
                  <p className="text-muted-foreground max-w-xs text-center text-sm text-balance">
                    {state.progress?.stage === 'cooldown'
                      ? 'The model provider is rate limiting us. Waiting for the window to clear, then picking up where we left off.'
                      : 'Writing copy, one page at a time'}
                  </p>
                </div>
              )}

              {state.kind === 'failed' && (
                <ErrorState
                  title={
                    /^generation budget of/.test(
                      state.result.errorMessage ?? '',
                    ) || /rate limit/i.test(state.result.errorMessage ?? '')
                      ? 'Stopped after the provider rate limit held too long'
                      : 'Generation failed'
                  }
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
                <ResultViewer result={state.result} route={selected} />
              )}

              {state.kind !== 'waiting' && (
                <SmoothButton onClick={startOver} variant="ghost" size="sm">
                  Start over
                </SmoothButton>
              )}
            </div>
          )}
        </div>

        {pages.length > 0 && (
          <aside className="order-1 lg:order-2 lg:sticky lg:top-6 lg:self-start">
            <h2 className="text-muted-foreground font-mono text-[11px] tracking-wider uppercase">
              Generated pages
            </h2>
            <nav aria-label="Generated pages" className="mt-4">
              <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                {pages.map((page) => (
                  <li key={page.route}>
                    <button
                      type="button"
                      onClick={() => setRoute(page.route)}
                      aria-current={page.route === selected}
                      className={cn(
                        'w-full rounded px-2 py-1 text-left font-mono text-xs whitespace-nowrap transition-colors duration-150 ease-out',
                        page.route === selected
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {page.route}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </main>
    </div>
  );
}
