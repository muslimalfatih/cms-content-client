import { useState } from 'react';
import { BusinessForm } from '@/components/BusinessForm';
import type { FormValues } from '@/lib/validate';

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

  function onSubmitted(id: string, _values: FormValues) {
    setJobId(id);
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

      <main className="mx-auto grid max-w-5xl gap-12 px-6 py-12 lg:grid-cols-[1fr_260px] lg:gap-16 lg:py-20">
        <div className="order-2 lg:order-1">
          <h1 className="max-w-lg text-3xl leading-[1.1] font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
            Describe the business. Get a structured website.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed">
            Routes, section layout and internal links are computed from what you
            enter. A language model writes only the copy.
          </p>

          <div className="mt-12">
            {jobId ? (
              <p className="font-mono text-sm">job {jobId}</p>
            ) : (
              <BusinessForm onSubmitted={onSubmitted} />
            )}
          </div>
        </div>

        {/* Sets expectations before submit, and explains the product without a
            marketing page. */}
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
      </main>
    </div>
  );
}
