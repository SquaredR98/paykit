import { Nav } from '@/components/layout/old/Nav';
import { Footer } from '@/components/layout/old/Footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="pk-frame">{children}</main>
      <Footer />
    </>
  );
}
