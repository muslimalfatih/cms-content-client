import SmoothButton from '@/components/smoothui/smooth-button';

interface ErrorStateProps {
  title: string;
  /** The server's own wording where there is one; it names the actual fix. */
  detail?: string;
  onRetry: () => void;
  retrying?: boolean;
}

export function ErrorState({
  title,
  detail,
  onRetry,
  retrying,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="border-destructive/30 bg-destructive/[0.03] rounded-lg border p-5"
    >
      <p className="text-sm font-medium tracking-tight">{title}</p>

      {detail && (
        // Provider errors are long and technical. Monospace signals "this is
        // diagnostic output", and wrapping keeps it readable on mobile.
        <p className="text-muted-foreground mt-2 font-mono text-xs leading-relaxed break-words">
          {detail}
        </p>
      )}

      <SmoothButton
        onClick={onRetry}
        loading={retrying}
        size="sm"
        variant="outline"
        className="mt-4"
      >
        Try again
      </SmoothButton>
    </div>
  );
}
