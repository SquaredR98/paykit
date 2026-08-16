import type { ReactNode } from 'react';
import './styles.css';

interface CalloutProps {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
}

export function Callout({ icon, title, children }: CalloutProps) {
  return (
    <div className="pk-callout">
      <span className="pk-callout__icon">{icon ?? '⚑'}</span>
      <div>
        <span className="pk-callout__title">{title}</span>
        <div className="pk-callout__body">{children}</div>
      </div>
    </div>
  );
}
