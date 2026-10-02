import './styles.css';

/**
 * Small accent label above a section title, with a gradient dash before it.
 *
 * The dash is one of the sanctioned uses of the brand gradient (Rule M5) — at
 * 16x2px it reads as a cyan tick rather than as decoration.
 */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="pk-v2-eyebrow">{children}</span>;
}
