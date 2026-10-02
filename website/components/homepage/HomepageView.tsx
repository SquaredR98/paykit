import { Hero } from '@/components/homepage/Hero';
import { Demo } from '@/components/homepage/Demo';
import { Compare } from '@/components/homepage/Compare';
import { Providers } from '@/components/homepage/Providers';
import { Faq } from '@/components/homepage/Faq';
import { Cta } from '@/components/homepage/Cta';

/**
 * Layer 2 (Rule W1) — assembles the homepage sections. The route file renders
 * exactly this and nothing else.
 *
 * Order follows the argument: what it is (Hero), proof it works (Demo), what it
 * removes (Compare), what it covers (Providers), objections (Faq), then the ask.
 */
export function HomepageView() {
  return (
    <div className="pk-v2-wrap">
      <div className="pk-v2-inner">
        <Hero />
        <Demo />
        <Compare />
        <Providers />
        <Faq />
        <Cta />
      </div>
    </div>
  );
}
