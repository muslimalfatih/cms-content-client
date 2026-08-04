import ButtonCopy from '@/components/smoothui/button-copy';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { JobStatus } from '@/types/job';

const LABEL: Record<JobStatus, string> = {
  pending: 'Queued',
  processing: 'Writing copy',
  completed: 'Done',
  failed: 'Failed',
};

const VARIANT: Record<JobStatus, 'secondary' | 'default' | 'destructive'> = {
  pending: 'secondary',
  processing: 'secondary',
  completed: 'default',
  failed: 'destructive',
};

export function JobStatusPanel({
  jobId,
  status,
  elapsedMs,
}: {
  jobId: string;
  status: JobStatus;
  elapsedMs: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>

      {/* Elapsed time rather than a progress bar: the duration is unknown, and
          a bar that fills on a guess is a lie the user can catch. */}
      <span className="text-muted-foreground font-mono text-xs tabular-nums">
        {Math.floor(elapsedMs / 1000)}s
      </span>

      <span className="text-muted-foreground/60 text-xs">·</span>

      <span className="text-muted-foreground font-mono text-xs">
        {jobId.slice(0, 8)}
      </span>
      {/* loadingDuration 0: the component defaults to a 1s spinner, but a
          clipboard write is instant and faking latency reads as lag. */}
      <ButtonCopy
        loadingDuration={0}
        onCopy={() => navigator.clipboard.writeText(jobId)}
        className="text-muted-foreground hover:text-foreground"
      />
    </div>
  );
}

/**
 * Stands in for the pages being written. It mirrors the real result's shape, so
 * the layout does not jump when content replaces it.
 */
export function GenerationSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      {[0, 1, 2].map((row) => (
        <div key={row} className="space-y-2 rounded-lg border p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}
