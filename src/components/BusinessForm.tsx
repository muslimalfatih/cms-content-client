import { useState, type FormEvent } from 'react';
import { ApiError } from '@/api/client';
import { createJob } from '@/api/jobs';
import { TagInput } from '@/components/TagInput';
import SmoothButton from '@/components/smoothui/smooth-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  EMPTY_FORM,
  MAX_ITEMS,
  toRequest,
  validate,
  type FieldErrors,
  type FormValues,
} from '@/lib/validate';

interface BusinessFormProps {
  onSubmitted: (jobId: string, values: FormValues) => void;
}

/** A numbered group. Six stacked inputs read as a wall; three groups read as a form. */
function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 sm:grid-cols-[auto_1fr] sm:gap-8">
      <div className="flex items-baseline gap-3 sm:flex-col sm:gap-1 sm:pt-0.5">
        <span className="text-muted-foreground font-mono text-xs tabular-nums">
          {index}
        </span>
        <h2 className="text-sm font-medium tracking-tight sm:w-24">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function BusinessForm({ onSubmitted }: BusinessFormProps) {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    // Clear the error the moment the field is touched; leaving it up while the
    // user fixes it is nagging.
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const found = validate(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      // Send focus to the first problem rather than making the user hunt.
      document
        .querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setSubmitError([]);

    try {
      const { jobId } = await createJob(toRequest(values));
      onSubmitted(jobId, values);
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.reasons
          : ['Something went wrong. Try again.'],
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10" noValidate>
      <Section index="01" title="Business">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="BuildCo"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-destructive text-xs">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={values.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Austin, TX"
              aria-invalid={Boolean(errors.location)}
              aria-describedby={errors.location ? 'location-error' : undefined}
            />
            {errors.location && (
              <p id="location-error" className="text-destructive text-xs">
                {errors.location}
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section index="02" title="Reach">
        <TagInput
          label="Services"
          hint="One page per service. Press Enter to add."
          placeholder="Kitchen Remodeling"
          values={values.services}
          onChange={(v) => set('services', v)}
          max={MAX_ITEMS}
          error={errors.services}
        />
        <TagInput
          label="Service areas"
          hint="One page per area."
          placeholder="Austin TX"
          values={values.serviceAreas}
          onChange={(v) => set('serviceAreas', v)}
          max={MAX_ITEMS}
          error={errors.serviceAreas}
        />
      </Section>

      <Section index="03" title="Proof">
        <TagInput
          label="Projects"
          hint="One portfolio page per project."
          placeholder="Lakeway Kitchen Rebuild"
          values={values.projects}
          onChange={(v) => set('projects', v)}
          max={MAX_ITEMS}
          error={errors.projects}
        />
        <TagInput
          label="Selling points"
          optional
          placeholder="5-year warranty"
          values={values.usps}
          onChange={(v) => set('usps', v)}
          max={MAX_ITEMS}
          error={errors.usps}
        />
        <div className="space-y-2">
          <Label htmlFor="notes">
            Notes
            <span className="text-muted-foreground ml-1.5 font-normal">
              optional
            </span>
          </Label>
          <Textarea
            id="notes"
            rows={3}
            value={values.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Tone, positioning, anything the copy should know."
          />
        </div>
      </Section>

      {submitError.length > 0 && (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 rounded-md border p-3"
        >
          <p className="text-destructive text-sm font-medium">
            Could not start the job
          </p>
          <ul className="text-destructive/90 mt-1 space-y-0.5 text-xs">
            {submitError.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-4 border-t pt-6">
        <SmoothButton type="submit" loading={submitting} size="lg">
          {submitting ? 'Starting' : 'Generate website'}
        </SmoothButton>
        <p className="text-muted-foreground text-xs">
          {plural(
            values.services.length +
              values.serviceAreas.length +
              values.projects.length +
              5,
          )}
        </p>
      </div>
    </form>
  );
}

/** The page count is derivable, so showing it sets expectations before submit. */
function plural(count: number) {
  return count === 5
    ? 'Add entries above to see the page count'
    : `${count} pages`;
}
