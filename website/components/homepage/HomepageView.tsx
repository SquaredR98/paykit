import { Hero } from '@/components/homepage/Hero';
import { HowItWorks } from '@/components/homepage/HowItWorks';
import { BeforeAfter } from '@/components/homepage/BeforeAfter';
import { Features } from '@/components/homepage/Features';
import { TryIt } from '@/components/homepage/TryIt';
import { Providers } from '@/components/homepage/Providers';
import { WhyPaykit } from '@/components/homepage/WhyPaykit';
import { GetStarted } from '@/components/homepage/GetStarted';

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
