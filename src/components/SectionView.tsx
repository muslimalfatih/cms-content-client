import type { Section } from '@/types/job';

/** Internal links are the interesting part of the output, so they stay visible. */
function Link({ to }: { to: string }) {
  return (
    <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[11px]">
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
    <ul className="mt-3 space-y-3">
      {items.map((item) => (
        <li key={item.title} className="border-l pl-3">
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
            {item.description}
          </p>
          {item.link && (
            <div className="mt-1.5">
              <Link to={item.link} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function Heading({ level, children }: { level: 1 | 2; children: string }) {
  const Tag = level === 1 ? 'h3' : 'h4';
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-muted-foreground/70 font-mono text-[10px]">
        h{level}
      </span>
      <Tag
        className={
          level === 1
            ? 'text-lg font-semibold tracking-tight text-balance'
            : 'font-medium tracking-tight'
        }
      >
        {children}
      </Tag>
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
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-sm font-medium">
            {section.content.logoText}
          </span>
          {section.content.navLinks.map((nav) => (
            <Link key={nav.link} to={nav.link} />
          ))}
        </div>
      );

    case 'Hero':
      return (
        <div>
          <Heading level={1}>{section.content.h1}</Heading>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {section.content.subheadline}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="bg-foreground text-background rounded px-2.5 py-1 text-xs font-medium">
              {section.content.primaryButton.label}
            </span>
            <Link to={section.content.primaryButton.link} />
          </div>
        </div>
      );

    case 'About':
      return (
        <div>
          <Heading level={2}>{section.content.h2}</Heading>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
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
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {section.content.body}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="bg-foreground text-background rounded px-2.5 py-1 text-xs font-medium">
              {section.content.primaryButton.label}
            </span>
            <Link to={section.content.primaryButton.link} />
          </div>
        </div>
      );

    case 'Footer':
      return (
        <div className="space-y-3">
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
          <p className="text-muted-foreground text-xs">
            {section.content.legal}
          </p>
        </div>
      );
  }
}
