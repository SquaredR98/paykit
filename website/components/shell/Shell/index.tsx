import { Background } from '@/components/shell/Background';
import { GlassPanel } from '@/components/shell/GlassPanel';
import { ScrollProgress } from '@/components/shell/ScrollProgress';
import { Header } from '@/components/shell/Header';
import { Footer } from '@/components/shell/Footer';
import './styles.css';

/**
 * The v2 page frame. Everything sits on the glass panel, over the blobs and
 * grid, with the sticky header above and the footer below.
 *
 * Background and GlassPanel are fixed and sit on negative z-indexes, so they
 * take part in painting but not in layout. Only .pk-v2-shell flows.
 *
 * `variant` switches the only two surfaces that differ between marketing and
 * docs: the panel widens to 1376px, and the header swaps its anchors and CTA
 * for routes and a version pill. Background, progress bar and footer are
 * shared, which is why this is one shell with a variant rather than two.
 */
export function Shell({
  children,
  variant = 'marketing',
}: {
  children: React.ReactNode;
  variant?: 'marketing' | 'docs';
}) {
  const docs = variant === 'docs';

  return (
    <>
      <Background />
      <GlassPanel wide={docs} />
      <ScrollProgress />
      <div className="pk-v2-shell">
        <Header variant={variant} />
        <main className="pk-v2-shell__main">{children}</main>
        <Footer />
      </div>
    </>
  );
}
