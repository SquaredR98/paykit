import { Background } from '@/components/shell/Background';
import { GlassPanel } from '@/components/shell/GlassPanel';
import { ScrollProgress } from '@/components/shell/ScrollProgress';
import { Footer } from '@/components/shell/Footer';
import './styles.css';

/**
 * The v2 page frame: background, glass panel, progress bar and footer.
 *
 * Background and GlassPanel are fixed and sit on negative z-indexes, so they
 * take part in painting but not in layout. Only .pk-v2-shell flows.
 *
 * The header is passed in rather than chosen here, because each route group
 * owns its own — (marketing) renders MarketingHeader, docs renders DocsHeader.
 * The layout file decides, so there is no runtime branching and no shared
 * component that has to know which section of the site it is on.
 */
export function Shell({
  header,
  children,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <Background />
      <GlassPanel />
      <ScrollProgress />
      <div className="pk-v2-shell">
        {header}
        <main className="pk-v2-shell__main">{children}</main>
        <Footer />
      </div>
    </>
  );
}
