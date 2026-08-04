import { useState, type FormEvent, type ReactNode } from 'react';
import { ApiError } from '@/api/client';
import { createJob } from '@/api/jobs';
import Form, {
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/smoothui/form';
import SmoothButton from '@/components/smoothui/smooth-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  EMPTY_FORM,
  pageCount,
  parseList,
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
  children: ReactNode;
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

/** A comma-separated list. The parsed count confirms what was understood. */
function ListField({
  name,
  label,
  placeholder,
  hint,
  value,
  onChange,
}: {
  name: string;
  label: string;
  placeholder: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const count = parseList(value).length;

  return (
    <FormField name={name}>
      <div className="flex items-baseline justify-between gap-3">
        <FormLabel>{label}</FormLabel>
        {count > 0 && (
          <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
            {count}
          </span>
        )}
      </div>
      <FormControl>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </FormControl>
      <FormDescription className="text-xs">{hint}</FormDescription>
      <FormMessage />
    </FormField>
  );
}

export function BusinessForm({ onSubmitted }: BusinessFormProps) {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    // Clear the error as soon as the field is touched rather than nagging.
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const found = validate(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

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

  const pages = pageCount(values);

  return (
    <Form onSubmit={onSubmit} errors={errors} className="space-y-10" noValidate>
      <Section index="01" title="Business">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="name">
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                value={values.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="BuildCo"
              />
            </FormControl>
            <FormMessage />
          </FormField>

          <FormField name="location">
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input
                value={values.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="Austin, TX"
              />
            </FormControl>
            <FormMessage />
          </FormField>
        </div>
      </Section>

      <Section index="02" title="Reach">
        <ListField
          name="services"
          label="Services"
          placeholder="Kitchen Remodeling, Bathroom Remodeling"
          hint="Comma separated. One page per service."
          value={values.services}
          onChange={(v) => set('services', v)}
        />
        <ListField
          name="serviceAreas"
          label="Service areas"
          placeholder="Austin TX, Round Rock TX"
          hint="Comma separated. One page per area."
          value={values.serviceAreas}
          onChange={(v) => set('serviceAreas', v)}
        />
      </Section>

      <Section index="03" title="Proof">
        <ListField
          name="projects"
          label="Projects"
          placeholder="Lakeway Kitchen Rebuild"
          hint="Comma separated. One portfolio page per project."
          value={values.projects}
          onChange={(v) => set('projects', v)}
        />
        <ListField
          name="usps"
          label="Selling points"
          placeholder="5-year warranty, Licensed and insured"
          hint="Comma separated. Optional."
          value={values.usps}
          onChange={(v) => set('usps', v)}
        />

        <FormField name="notes">
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea
              rows={3}
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Tone, positioning, anything the copy should know."
            />
          </FormControl>
          <FormDescription className="text-xs">Optional.</FormDescription>
        </FormField>
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
        {/* `solid` consumes the --btn tokens the `color` axis sets. The legacy
            `default` variant ignores them and renders as bg-primary, which
            theme-blue defines as near-white. */}
        <SmoothButton
          type="submit"
          loading={submitting}
          size="lg"
          variant="solid"
          color="accent"
        >
          {submitting ? 'Starting' : 'Generate website'}
        </SmoothButton>
        <p className="text-muted-foreground text-xs">
          {pages > 5 ? `${pages} pages` : 'Add services to see the page count'}
        </p>
      </div>
    </Form>
  );
}
