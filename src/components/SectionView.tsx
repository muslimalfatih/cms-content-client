import type { Section } from '@/types/job';

/**
 * Internal links are the interesting part of the output, so they stay visible.
 * Anchors are dimmed: they resolve within the page, unlike route links which
 * are the thing worth checking.
 */
function Link({ to }: { to: string }) {
  const anchor = to.startsWith('#');

  return (
    <code
      className={
        anchor
          ? 'text-muted-foreground/60 rounded border border-dashed px-1.5 py-0.5 font-mono text-[11px]'
          : 'bg-muted text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[11px]'
      }
    >
      {to}
    </code>
  );
}

function Entries({
  items,
}: {
  items: { title: string; description: string; link?: string }[];
}) {
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.title} className="bg-muted/30 rounded-md border p-3">
          <p className="text-sm leading-none font-medium">{item.title}</p>
          <p className="text-muted-foreground mt-1.5 text-[13px] leading-relaxed">
            {item.description}
          </p>
          {item.link && (
            <div className="mt-2">
              <Link to={item.link} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * The level marker is kept because "exactly one h1 per page" is a rule the
 * validator enforces, and showing it makes that checkable by eye.
 */
function Heading({ level, children }: { level: 1 | 2; children: string }) {
  const Tag = level === 1 ? 'h3' : 'h4';

  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground/60 bg-muted mt-0.5 shrink-0 rounded px-1 py-0.5 font-mono text-[10px] leading-none">
        h{level}
      </span>
      <Tag
        className={
          level === 1
            ? 'text-base leading-snug font-semibold tracking-tight text-balance'
            : 'text-sm leading-snug font-medium tracking-tight'
        }
      >
        {children}
      </Tag>
    </div>
  );
}

/** A call-to-action rendered as the button it will become. */
function Cta({ label, link }: { label: string; link: string }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="bg-foreground text-background rounded-md px-2.5 py-1 text-xs font-medium">
        {label}
      </span>
      <Link to={link} />
    </div>
  );
}

/**
 * Renders one section by its component type. The switch is exhaustive — the
 * contract's discriminated union makes a missing branch a compile error rather
 * than a blank space in the UI.
 */
export function SectionView({ section }: { section: Section }) {
  switch (section.component) {
    case 'Header':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium">{section.content.logoText}</p>
          <div className="flex flex-wrap gap-1.5">
            {section.content.navLinks.map((nav) => (
              <Link key={nav.link} to={nav.link} />
            ))}
          </div>
        </div>
      );

    case 'Hero':
      return (
        <div>
          <Heading level={1}>{section.content.h1}</Heading>
          <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
            {section.content.subheadline}
          </p>
          <Cta {...section.content.primaryButton} />
        </div>
      );

    case 'About':
      return (
        <div>
          <Heading level={2}>{section.content.h2}</Heading>
          <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
            {section.content.body}
          </p>
        </div>
      );

    case 'ServicesCard':
      return (
        <div>
          <Heading level={2}>{section.content.h2}</Heading>
          <Entries items={section.content.cards} />
        </div>
      );

    case 'PortfolioGalleries':
      return (
        <div>
          <Heading level={2}>{section.content.h2}</Heading>
          <Entries items={section.content.items} />
        </div>
      );

    case 'CoreValues':
      return (
        <div>
          <Heading level={2}>{section.content.h2}</Heading>
          <Entries items={section.content.values} />
        </div>
      );

    case 'USPs':
      return (
        <div>
          <Heading level={2}>{section.content.h2}</Heading>
          <Entries items={section.content.items} />
        </div>
      );

    case 'CTA':
      return (
        <div>
          <Heading level={2}>{section.content.h2}</Heading>
          <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
            {section.content.body}
          </p>
          <Cta {...section.content.primaryButton} />
        </div>
      );

    case 'Footer':
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {section.content.columns.map((column) => (
              <div key={column.heading}>
                <p className="text-xs font-medium">{column.heading}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {column.links.map((link) => (
                    <Link key={link.link} to={link.link} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground border-t pt-3 text-xs">
            {section.content.legal}
          </p>
        </div>
      );
  }
}
