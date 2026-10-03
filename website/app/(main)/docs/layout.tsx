import type { ReactNode } from 'react';
import { Shell } from '@/components/shell';
import './docs-layout.css';

/**
 * Docs layout — the v2 shell in its wide variant.
 *
 * Only the pages converted to v2 tokens live under this group; the rest stay in
 * app/(old)/docs/ with the Blueprint layout until their turn. See
 * .plan/docs-retheme.md.
 *
 * The sidebar and TOC are not here yet: they are shared with (old)'s layout and
 * are converted in step 4. Until then a converted page is a single content
 * column, which is why this grid has one track.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <Shell variant="docs">
      <div className="pk-v2-wrap pk-v2-wrap--docs">
        <div className="pk-v2-docs">{children}</div>
      </div>
    </Shell>
  );
}
