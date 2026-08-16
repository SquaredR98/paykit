interface ExplainerProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}

export function Explainer({ eyebrow, title, children }: ExplainerProps) {
  return (
    <div className="wb-explainer">
      <span className="pk-eyebrow">{eyebrow}</span>
      <h1
        className="mt-(--space-2) text-pk-strong font-display font-semibold tracking-(--tracking-tight)"
        style={{ fontSize: 'var(--text-2xl)' }}
      >
        {title}
      </h1>
      <div className="wb-explainer__prose pk-prose">
        {children}
      </div>
    </div>
  );
}
