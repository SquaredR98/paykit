import './styles.css';

/**
 * The frosted panel all content sits on (Rule M5: "content never goes straight
 * onto the page background").
 *
 * Fixed and purely visual at z-index -1 — it sits above the background blobs
 * and below the content, so it does not participate in layout at all. The
 * content column's width is handled separately by the page's .pk-v2-wrap.
 *
 * `wide` widens the panel from 1280px to 1376px for the docs, whose three
 * column grid (sidebar / prose / TOC) does not fit the marketing width.
 */
export function GlassPanel({ wide }: { wide?: boolean }) {
  return (
    <div className="pk-v2-glass" aria-hidden="true">
      <div
        className={
          wide
            ? 'pk-v2-glass__panel pk-v2-glass__panel--wide'
            : 'pk-v2-glass__panel'
        }
      />
    </div>
  );
}
