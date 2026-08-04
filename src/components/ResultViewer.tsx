import { useState } from 'react';
import { RawJsonPanel } from '@/components/RawJsonPanel';
import { SectionView } from '@/components/SectionView';
import { cn } from '@/lib/utils';
import type { JobResult } from '@/types/job';

export function ResultViewer({ result }: { result: JobResult }) {
  const pages = result.website?.pages ?? [];
  const [route, setRoute] = useState(pages[0]?.route);
  const page = pages.find((p) => p.route === route) ?? pages[0];

  if (!page) return null;

  return (
    <div className="space-y-8">
      <Warnings warnings={result.warnings} />

      <div className="grid gap-8 lg:grid-cols-[180px_1fr] lg:gap-10">
        {/* The route list doubles as the navigation and as proof that every
            required route shape was produced. */}
        <nav
          aria-label="Generated pages"
          className="lg:sticky lg:top-6 lg:self-start"
        >
          <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {pages.map((candidate) => (
              <li key={candidate.route}>
                <button
                  type="button"
                  onClick={() => setRoute(candidate.route)}
                  aria-current={candidate.route === page.route}
                  className={cn(
                    'w-full rounded px-2 py-1 text-left font-mono text-xs whitespace-nowrap transition-colors duration-150 ease-out',
                    candidate.route === page.route
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {candidate.route}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <article className="min-w-0 space-y-6">
          <header className="space-y-2 border-b pb-5">
            <p className="text-muted-foreground font-mono text-xs">
              {page.type}
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-balance">
              {page.titleTag}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {page.metaDescription}
            </p>
            <p className="text-muted-foreground/70 font-mono text-[11px]">
              title {page.titleTag.length}/60 · meta{' '}
              {page.metaDescription.length}/160
            </p>
          </header>

          {page.sections.map((section, index) => (
            <section
              key={`${page.route}-${section.component}-${index}`}
              className="space-y-1"
            >
              <p className="text-muted-foreground/70 font-mono text-[10px] tracking-wider uppercase">
                {section.component}
              </p>
              <SectionView section={section} />
            </section>
          ))}
        </article>
      </div>

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
