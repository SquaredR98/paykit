'use client';

type BadgeVariant = 'ok' | 'warn' | 'bad' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  ok: 'pk-bdg pk-bdg--ok',
  warn: 'pk-bdg',
  bad: 'pk-bdg',
  neutral: 'pk-bdg pk-bdg--neutral',
};

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  ok: {},
  warn: { background: 'var(--surface-warn-soft)', color: 'var(--text-warn)' },
  bad: { background: 'oklch(0.620 0.195 22 / 0.13)', color: 'var(--text-bad)' },
  neutral: {},
};

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  return (
    <span className={variantClasses[variant]} style={variantStyles[variant]}>
      {label}
    </span>
  );
}
