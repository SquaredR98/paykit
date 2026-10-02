import './styles.css';

/**
 * The frosted panel all content sits on (Rule M5: "content never goes straight
 * onto the page background").
 *
 * Fixed and purely visual at z-index -1 — it sits above the background blobs
 * and below the content, so it does not participate in layout at all. The
 * content column's width is handled separately by Shell's .pk-v2-wrap.
 */
export function GlassPanel() {
  return (
    <div className="pk-v2-glass" aria-hidden="true">
      <div className="pk-v2-glass__panel" />
    </div>
  );
}
