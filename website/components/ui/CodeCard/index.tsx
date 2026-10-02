import './styles.css';

/**
 * A dark code surface with a filename bar.
 *
 * Takes pre-highlighted HTML rather than raw code, because shiki runs on the
 * server (lib/shiki.ts). Callers await `highlight()` or `highlightDiff()` and
 * pass the result in.
 *
 * Code is always dark in both themes (Rule M5), so this surface does not
 * change with the theme.
 */
export function CodeCard({
  html,
  filename,
  className,
}: {
  html: string;
  filename?: string;
  className?: string;
}) {
  return (
    <div className={['pk-v2-codecard', className].filter(Boolean).join(' ')}>
      {filename && (
        <div className="pk-v2-codecard__bar">
          <span className="pk-v2-codecard__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="pk-v2-codecard__name">{filename}</span>
          {/* Spacer keeps the filename optically centred against the dots. */}
          <span aria-hidden="true" />
        </div>
      )}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output, generated server-side from literals in this repo */}
      <div
        className="pk-v2-codecard__code"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
