import './styles.css';

/**
 * Section wrapper — applies the shared 112px rhythm and anchor scroll offset.
 *
 * Takes an `id` because every homepage section is a nav anchor target.
 */
export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={['pk-v2-section', className].filter(Boolean).join(' ')}
    >
      {children}
    </section>
  );
}
