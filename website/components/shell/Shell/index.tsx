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
 */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Background />
      <GlassPanel />
      <ScrollProgress />
      <div className="pk-v2-shell">
        <Header />
        <main className="pk-v2-shell__main">{children}</main>
        <Footer />
      </div>
    </>
  );
}
