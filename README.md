# CMS Content Client

Web client for
[cms-content-engine](https://github.com/muslimalfatih/cms-content-engine).
Submits a contractor's business context, polls the resulting job, and renders
the generated website document.

No domain logic lives here. Routes, section layout, internal links, SEO
validation and copy generation all happen in the backend.

## Stack

React 19, Vite 8, TypeScript 6, Tailwind 4. Components come from shadcn/ui, with
SmoothUI for animated ones — SmoothUI is a shadcn-compatible registry, not a
package, so both install through `pnpm dlx shadcn@latest add`.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

`VITE_API_BASE_URL` defaults to the deployed backend, so this works without
running the API locally. Point it at `http://localhost:3000` to develop against
a local engine.

Scripts: `dev`, `build`, `lint`, `format`, `preview`.

## API contract

**`POST /jobs`** → `202 { jobId }`

```ts
{
  name: string;            // not "businessName"
  location: string;
  services: string[];      // ≥1
  serviceAreas: string[];  // ≥1
  projects: string[];      // ≥1
  usps?: string[];
  rawAnswers?: Record<string, string>;   // free-text notes
}
```

The three list fields are required because the `/services/{slug}`,
`/service-areas/{slug}` and `/portfolio/{slug}` route shapes are derived from
them.

**`GET /jobs/:id`**

```ts
{
  businessId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  website?: WebsiteDocument;  // only when completed
  warnings?: string[];        // SEO issues that did not fail the job
  errorMessage?: string;      // only when failed
}
```

`src/types/job.ts` mirrors this, with a discriminated union for section content.
Rendering switches exhaustively over it, so a component added to the backend
becomes a compile error rather than a blank region.

Client-side validation duplicates the backend DTO so a missing required list is
reported without a round trip. The server stays the authority; when it rejects,
every failing field is shown, not just the first.

## Polling

`useJobPolling` schedules each request after the previous one resolves, so a
slow response cannot cause requests to stack. It stops on a terminal status.

- 1s between polls, easing to 3s after 20 attempts.
- Four consecutive network failures tolerated before reporting the server
  unreachable, which is a distinct state from the job failing.
- Elapsed time rather than a progress bar, since the duration is unknown.

## Limitations

- No test suite. `useJobPolling` and the validation rules are covered only by
  types and manual testing.
- Results are not persisted — reloading loses the job id, so a completed
  document cannot be revisited by URL.
