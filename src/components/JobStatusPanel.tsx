import AILoader from '@/components/smoothui/ai-loader';
import ButtonCopy from '@/components/smoothui/button-copy';
import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types/job';

const LABEL: Record<JobStatus, string> = {
  pending: 'Queued',
  processing: 'Writing copy',
  completed: 'Done',
  failed: 'Failed',
};

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
}: {
  jobId: string;
  status: JobStatus;
}) {
  const running = status === 'pending' || status === 'processing';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="bg-muted/40 inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-2.5 text-xs font-medium">
        <span className="relative flex size-1.5">
          {/* A halo only while work is in flight — state indication, not decoration. */}
          {running && (
            <span
              className={cn(
                'absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none',
                DOT[status],
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex size-1.5 rounded-full',
              DOT[status],
            )}
          />
        </span>
        {LABEL[status]}
      </span>

      {/* Indeterminate with an elapsed counter rather than a progress bar: the
          duration is unknown, and a bar advancing on a guess is a claim the
          user can catch being wrong. */}
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
  );
}
