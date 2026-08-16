'use client';

interface FieldRowProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}

export function FieldRow({ label, htmlFor, children, hint }: FieldRowProps) {
  return (
    <div className="wb-field-row">
      <label
        htmlFor={htmlFor}
        className="text-pk-muted whitespace-nowrap"
        style={{ font: 'var(--type-label)', minWidth: '120px' }}
      >
        {label}
      </label>
      <div className="flex-1 min-w-0">
        {children}
        {hint && (
          <p className="mt-(--space-1) text-pk-subtle" style={{ font: 'var(--type-code-sm)' }}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
