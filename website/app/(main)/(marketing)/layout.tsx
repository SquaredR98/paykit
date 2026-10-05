import type { ReactNode } from 'react';
import { Shell } from '@/components/shell';
import { MarketingHeader } from '@/components/shell/MarketingHeader';

/**
 * Marketing layout — the v2 shell with the marketing header.
 *
 * This group exists so the header is chosen by the route rather than by a prop:
 * (marketing) gets section anchors and the consulting CTA, docs gets the doc
 * sections and a version pill, and neither component knows the other exists.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <Shell header={<MarketingHeader />}>{children}</Shell>;
}
