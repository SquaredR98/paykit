import { DemoPageHeader } from '@/components/demo/shared/DemoPageHeader';
import { DemoRouting } from '@/components/demo/DemoRouting';

export const metadata = {
  title: 'Routing Playground — PayKit',
  description: 'Build routing rules and see how PaymentRouter resolves providers based on currency.',
};

export default function RoutingDemoPage() {
  return (
    <>
      <DemoPageHeader
        eyebrow="Interactive demo"
        title="Multi-provider routing"
        description="Configure routing rules and test how PaymentRouter resolves the right provider for each currency. First matching rule wins, with a fallback default."
      />
      <DemoRouting />
    </>
  );
}
