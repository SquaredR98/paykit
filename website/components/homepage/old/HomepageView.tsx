import { Hero } from '@/components/homepage/old/Hero';
import { HowItWorks } from '@/components/homepage/old/HowItWorks';
import { BeforeAfter } from '@/components/homepage/old/BeforeAfter';
import { Features } from '@/components/homepage/old/Features';
import { TryIt } from '@/components/homepage/old/TryIt';
import { Providers } from '@/components/homepage/old/Providers';
import { WhyPaykit } from '@/components/homepage/old/WhyPaykit';
import { GetStarted } from '@/components/homepage/old/GetStarted';

export function HomepageView() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <BeforeAfter />
      <Features />
      <TryIt />
      <Providers />
      <WhyPaykit />
      <GetStarted />
    </>
  );
}
