import type { ReactNode } from 'react';
import { Shell } from '@/components/shell';
import { DocsHeader } from '@/components/shell/DocsHeader';
import './docs-layout.css';

/**
 * Docs layout — the v2 shell with the docs header.
 *
 * Only pages converted to v2 tokens live under this group; the rest stay in
 * app/(old)/docs/ with the Blueprint layout until their turn. See
 * .plan/docs-retheme.md.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <Shell header={<DocsHeader />}>
      {/*
        Same wrap and inner column as the marketing pages. Docs content must
        share its left and right edges with the header above it and with every
        other page — a docs page measured differently reads as a different site.
      */}
      <div className="pk-v2-wrap">
        <div className="pk-v2-inner">
          <div className="pk-v2-docs">{children}</div>
        </div>
      </div>
    </Shell>
  );
}
