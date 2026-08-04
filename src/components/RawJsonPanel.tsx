import { useState } from 'react';
import ButtonCopy from '@/components/smoothui/button-copy';

export function RawJsonPanel({ value }: { value: unknown }) {
  const [open, setOpen] = useState(false);
  const json = JSON.stringify(value, null, 2);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="text-sm font-medium tracking-tight"
        >
          Raw JSON
          <span className="text-muted-foreground ml-2 font-mono text-xs font-normal">
            {(json.length / 1024).toFixed(1)} kB
          </span>
        </button>

        {/* Copying works whether or not the panel is expanded — reading it is
            rarely why someone wants it. */}
        <ButtonCopy
          loadingDuration={0}
          onCopy={() => navigator.clipboard.writeText(json)}
          className="text-muted-foreground hover:text-foreground"
        />
      </div>

      {open && (
        <pre className="border-t p-4 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[28rem] overflow-y-auto">
          {json}
        </pre>
      )}
    </div>
  );
}
