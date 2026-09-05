import AILoader from '@/components/smoothui/ai-loader';
import ButtonCopy from '@/components/smoothui/button-copy';
import { cn } from '@/lib/utils';
import type { JobProgress, JobStatus } from '@/types/job';

/**
 * What the job is doing, not merely which state it is in.
 *
 * `processing` covers two situations a user experiences very differently:
 * copy is being written, or nothing is happening because the provider asked us
 * to wait. Reporting both as "Writing copy" makes a rate limit look like a hang,
 * which is the failure this panel exists to stop being mysterious.
 */
function describe(
  status: JobStatus,
  progress?: JobProgress,
): { label: string; detail?: string } {
  if (status === 'pending') return { label: 'Queued' };
  if (status === 'completed') return { label: 'Done' };
  if (status === 'failed') return { label: 'Failed' };

  if (!progress) return { label: 'Starting' };

  if (progress.stage === 'cooldown') {
    const seconds = Math.round((progress.waitMs ?? 0) / 1000);
    return {
      label: 'Waiting on the provider',
      // Naming the rate limit matters: without it a pause reads as a bug in
      // this app rather than a quota we are deliberately respecting.
      detail: seconds
        ? `Rate limited. Retrying ${progress.route} in about ${seconds}s`
        : `Rate limited. Retrying ${progress.route}`,
    };
  }

  return {
    label: 'Writing copy',
    detail: progress.route,
  };
}

/** Colour carries the state; the label is not the only signal. */
const DOT: Record<JobStatus, string> = {
  pending: 'bg-[var(--color-smooth-600)]',
  processing: 'bg-[var(--color-blue)]',
  completed: 'bg-[var(--color-green)]',
  failed: 'bg-destructive',
};

export function JobStatusPanel({
  jobId,
  status,
  progress,
}: {
  jobId: string;
  status: JobStatus;
  progress?: JobProgress;
}) {
  const running = status === 'pending' || status === 'processing';
  const { label, detail } = describe(status, progress);

  // A cooldown is waiting, not working. Amber separates "we are blocked" from
  // "we are busy" without needing the label to be read.
  const cooling = progress?.stage === 'cooldown' && status === 'processing';
  const dot = cooling ? 'bg-[var(--color-yellow,#d97706)]' : DOT[status];

  const total = progress?.pagesTotal ?? 0;
  const done = progress?.pagesDone ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="bg-muted/40 inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-2.5 text-xs font-medium">
          <span className="relative flex size-1.5">
            {/* A halo only while work is in flight — state indication, not decoration. */}
            {running && (
              <span
                className={cn(
                  'absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none',
                  dot,
                )}
              />
            )}
            <span
              className={cn('relative inline-flex size-1.5 rounded-full', dot)}
            />
          </span>
          {label}
        </span>

        {/* The elapsed counter stays: page counts say how far along the run is,
            not how long it has been going, and a stalled job is legible only
            from the clock. */}
        {running && (
          <AILoader
            variant="dots"
            showElapsed
            className="text-muted-foreground"
          />
        )}

        {/* One object rather than an id floating beside a button. */}
        <div className="bg-muted/40 ml-auto inline-flex items-center gap-1 rounded-md border py-0.5 pr-0.5 pl-2.5">
          <span className="text-muted-foreground font-mono text-[11px] tracking-tight">
            {jobId.slice(0, 8)}
          </span>
          {/* loadingDuration 0: the component defaults to a 1s spinner, but a
              clipboard write is instant and faking latency reads as lag. */}
          <ButtonCopy
            loadingDuration={0}
            onCopy={() => navigator.clipboard.writeText(jobId)}
            className="text-muted-foreground hover:text-foreground size-6 rounded"
          />
        </div>
      </div>

      {/* A determinate bar only once the worker reports real page counts. It
          used to be indeterminate because the duration was a guess; pages
          completed is a fact, so the bar is now a measurement rather than a
          claim the user can catch being wrong. */}
      {running && total > 0 && (
        <div className="space-y-1.5">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            aria-label={`${done} of ${total} pages written`}
            className="bg-muted/60 h-1 w-full overflow-hidden rounded-full"
          >
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none',
                cooling
                  ? 'bg-[var(--color-yellow,#d97706)]'
                  : 'bg-[var(--color-blue)]',
              )}
              style={{ width: `${Math.round((done / total) * 100)}%` }}
            />
          </div>

          <p className="text-muted-foreground flex items-center justify-between gap-3 text-[11px]">
            <span className="min-w-0 truncate font-mono">{detail}</span>
            <span className="shrink-0 tabular-nums">
              {done} of {total} pages
            </span>
          </p>
        </div>
      )}

      {/* Before the first page starts there is no count to show, but a cooldown
          can already be in progress and still needs saying. */}
      {running && total === 0 && detail && (
        <p className="text-muted-foreground font-mono text-[11px]">{detail}</p>
      )}
    </div>
  );
}
