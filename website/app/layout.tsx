import type { Metadata } from 'next';
import { GoogleTagManager } from '@next/third-parties/google';
import { RootProvider } from 'fumadocs-ui/provider/next';

/*
 * Root layout — deliberately minimal.
 *
 * It owns ONLY the three things Next.js requires at the root plus the theme
 * provider: <html>, <body>, and RootProvider (which must wrap both site
 * versions so the theme toggle works on either side).
 *
 * It does NOT import any stylesheet or font. That is on purpose:
 *   app/(old)/layout.tsx   imports globals.css + the Blueprint fonts
 *   app/(main)/layout.tsx  imports v2-tokens.css + the Glass fonts
 *
 * v1 and v2 define 52 of the same CSS custom properties with incompatible
 * values (e.g. --radius-sm is 0px in v1, 6px in v2). Importing either one
 * here would leak it into the other. Keeping the root CSS-free is what makes
 * the two versions genuinely independent instead of fighting the cascade.
 *
 * See .plan/v2-marketing-parallel-setup.md §2.5.
 */

export const metadata: Metadata = {
  metadataBase: new URL('https://paykit.squaredr.tech'),
  title: {
    default: 'PayKit — Unified payment SDK for Node.js',
    template: '%s | PayKit',
  },
  description:
    'One SDK, every payment provider. A TypeScript-first Node.js library with React components — charges, refunds, subscriptions, webhooks across Stripe, Razorpay, PayPal and more.',
  authors: [{ name: 'SquaredR' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://paykit.squaredr.tech',
    siteName: 'PayKit',
    title: 'PayKit — Unified payment SDK for Node.js',
    description:
      'A TypeScript-first Node.js library with React components for accepting payments across Stripe, Razorpay, PayPal and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PayKit — Unified payment SDK for Node.js',
    description:
      'A TypeScript-first Node.js library with React components for accepting payments across Stripe, Razorpay, PayPal and more.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <body>
        <RootProvider
          theme={{
            attribute: ['class', 'data-theme'],
            defaultTheme: 'dark',
            enableSystem: true,
            storageKey: 'paykit-theme',
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
