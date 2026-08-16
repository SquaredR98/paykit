import type { Metadata } from 'next';
import { Space_Grotesk, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import { GoogleTagManager } from '@next/third-parties/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
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
