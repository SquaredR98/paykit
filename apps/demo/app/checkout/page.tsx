import { redirect } from 'next/navigation';
import { CheckoutClient } from '@/components/checkout-client';
import Link from 'next/link';

interface CheckoutPageProps {
  searchParams: Promise<{ provider?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { provider } = await searchParams;

  if (!provider || !['stripe', 'razorpay'].includes(provider)) {
    redirect('/');
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8 sr-dotgrid relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[25%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[color-mix(in_srgb,var(--sr-accent),transparent_96%)] blur-[100px]" />
      </div>
      <div className="relative z-10">
        <CheckoutClient provider={provider as 'stripe' | 'razorpay'} />
      </div>
      <Link
        href="/"
        className="relative z-10 inline-flex items-center gap-2 text-[13px] text-sr-text-muted hover:text-sr-accent transition-colors duration-200 font-mono group"
      >
        <svg className="w-3.5 h-3.5 translate-x-0 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Choose a different provider
      </Link>
    </main>
  );
}
