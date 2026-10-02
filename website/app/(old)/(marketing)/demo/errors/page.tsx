import { ERROR_SUGGESTIONS } from '@squaredr/paykit';
import { DemoPageHeader } from '@/components/demo/shared/DemoPageHeader';
import { DemoErrors } from '@/components/demo/DemoErrors';

export const metadata = {
  title: 'Error Normalization — PayKit',
  description: 'See how PayKit normalizes provider-specific errors into a unified PaymentError with actionable suggestions.',
};

export default function ErrorsDemoPage() {
  return (
    <>
      <DemoPageHeader
        eyebrow="Interactive demo"
        title="Error normalization"
        description="Every provider returns errors differently. PayKit maps them all to a single PaymentError with a unified code, message, and actionable suggestion."
      />
      <DemoErrors errorSuggestions={ERROR_SUGGESTIONS as Record<string, string>} />
    </>
  );
}
