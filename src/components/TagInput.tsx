import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  label: string;
  hint?: string;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
  max: number;
  error?: string;
  optional?: boolean;
}

/**
 * A list field entered one item at a time. Enter or comma commits; Backspace on
 * an empty input removes the last tag, which is the convention every tag input
 * has trained people to expect.
 *
 * Deliberately unanimated. Adding a tag happens many times per session, and
 * motion on a repeated action reads as lag rather than polish.
 */
export function TagInput({
  label,
  hint,
  placeholder,
  values,
  onChange,
  max,
  error,
  optional,
}: TagInputProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');

  const atLimit = values.length >= max;

  function commit(raw: string) {
    const value = raw.trim().replace(/,$/, '').trim();
    if (!value || atLimit) return;
    // Case-insensitive: "Kitchen Remodeling" and "kitchen remodeling" slugify
    // to the same route, so the backend would reject them as a duplicate.
    if (values.some((v) => v.toLowerCase() === value.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...values, value]);
    setDraft('');
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      // Enter in a text input submits the form by default.
      event.preventDefault();
      commit(draft);
      return;
    }

    if (event.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-sm leading-none font-medium tracking-tight"
        >
          {label}
          {optional && (
            <span className="text-muted-foreground ml-1.5 font-normal">
              optional
            </span>
          )}
        </label>
        <span
          className={cn(
            'text-muted-foreground font-mono text-[11px] tabular-nums',
            atLimit && 'text-foreground',
          )}
        >
          {values.length}/{max}
        </span>
      </div>

      <div
        className={cn(
          'border-input bg-background focus-within:border-foreground/25 focus-within:ring-ring/40 flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-2 transition-[border-color,box-shadow] duration-150 ease-out focus-within:ring-2',
          error && 'border-destructive/60 focus-within:ring-destructive/30',
        )}
        // Clicking the padding should focus the field, not do nothing.
        onClick={() => inputRef.current?.focus()}
      >
        {values.map((value) => (
          <span
            key={value}
            className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded px-2 py-1 text-sm"
          >
            {value}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onChange(values.filter((v) => v !== value));
              }}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              aria-label={`Remove ${value}`}
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}

        <input
          id={id}
          ref={inputRef}
          value={draft}
          disabled={atLimit}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          // Losing a half-typed entry on blur is the most common complaint
          // about tag inputs.
          onBlur={() => commit(draft)}
          placeholder={values.length === 0 ? placeholder : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="placeholder:text-muted-foreground min-w-32 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none disabled:cursor-not-allowed"
        />
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-destructive text-xs">
          {error}
        </p>
      ) : hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </div>
  );
}
