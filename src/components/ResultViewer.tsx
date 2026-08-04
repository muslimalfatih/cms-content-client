import { useState } from 'react';
import { RawJsonPanel } from '@/components/RawJsonPanel';
import { SectionView } from '@/components/SectionView';
import type { JobResult } from '@/types/job';

/** A character budget, flagged when the copy exceeds what search engines show. */
function Budget({
  label,
  used,
  max,
}: {
  label: string;
  used: number;
  max: number;
}) {
  const over = used > max;

  return (
    <span
      className={
        over
          ? 'border-destructive/40 text-destructive bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]'
          : 'text-muted-foreground bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]'
      }
    >
      {label} {used}/{max}
    </span>
  );
}

/** The page selector lives in the shared rail, so selection is passed in. */
export function ResultViewer({
  result,
  route,
}: {
  result: JobResult;
  route?: string;
}) {
  const pages = result.website?.pages ?? [];
  const page = pages.find((p) => p.route === route) ?? pages[0];

  if (!page) return null;

  return (
    <div className="space-y-8">
      <Warnings warnings={result.warnings} />

      <article className="min-w-0 space-y-4">
        {/* The page's own SEO metadata, treated as a record rather than as
            body copy — it is what a crawler reads, not a visitor. */}
        <header className="bg-muted/30 space-y-2.5 rounded-lg border p-5">
          <div className="flex items-center gap-2">
            <code className="text-muted-foreground font-mono text-xs">
              {page.route}
            </code>
            <span className="bg-border h-3 w-px" />
            <span className="text-muted-foreground font-mono text-[11px]">
              {page.type}
            </span>
          </div>

          <h2 className="text-base leading-snug font-semibold tracking-tight text-balance">
            {page.titleTag}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {page.metaDescription}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <Budget label="title" used={page.titleTag.length} max={60} />
            <Budget label="meta" used={page.metaDescription.length} max={160} />
            <span className="text-muted-foreground bg-background rounded border px-1.5 py-0.5 font-mono text-[10px]">
              {page.sections.length} sections
            </span>
          </div>
        </header>

        {/* Each section is a bounded block. Without the boundary the page reads
            as one continuous run of text and the component names float free. */}
        {page.sections.map((section, index) => (
          <section
            key={`${page.route}-${section.component}-${index}`}
            className="overflow-hidden rounded-lg border"
          >
            <div className="bg-muted/30 flex items-center gap-2 border-b px-4 py-2">
              <span className="text-muted-foreground/50 font-mono text-[10px] tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
                {section.component}
              </span>
            </div>
            <div className="p-4">
              <SectionView section={section} />
            </div>
          </section>
        ))}
      </article>

      <RawJsonPanel value={result.website} />
    </div>
  );
}

/**
 * Warnings are the SEO validator's output. Showing them is the point — a clean
 * run proves nothing, a reported one proves the checks ran.
 */
function Warnings({ warnings }: { warnings?: string[] }) {
  const [open, setOpen] = useState(false);
  if (!warnings?.length) return null;

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-4 py-3 text-left text-sm font-medium tracking-tight"
      >
        {warnings.length} SEO {warnings.length === 1 ? 'warning' : 'warnings'}
        <span className="text-muted-foreground ml-2 text-xs font-normal">
          the document is valid; these did not fail the job
        </span>
      </button>

      {open && (
        <ul className="space-y-1.5 border-t px-4 py-3">
          {warnings.map((warning) => (
            <li
              key={warning}
              className="text-muted-foreground font-mono text-xs leading-relaxed"
            >
              {warning}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
