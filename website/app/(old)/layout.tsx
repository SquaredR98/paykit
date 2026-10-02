import { Space_Grotesk, Instrument_Sans, JetBrains_Mono } from 'next/font/google';
import '../globals.css';

/*
 * (old) — the v1 Blueprint site.
 *
 * This group owns globals.css and the three Blueprint fonts. They used to live
 * in the root layout, which meant they loaded on every route. Moving them here
 * keeps v1's styles off the v2 routes entirely — see the note in app/layout.tsx.
 *
 * Route groups in parentheses do not appear in the URL, so every existing path
 * (/, /docs, /blog, /contact, ...) is unchanged by this move.
 *
 * DELETE THIS WHOLE FOLDER once v2 replaces the pages it holds.
 */

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

export default function OldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * The font CSS variables used to sit on <html>. Only the root layout owns
   * <html>, so they go on a wrapper div here instead. `display: contents` means
   * this div defines the variables without introducing a box of its own, so no
   * existing layout or selector changes behaviour.
   */
  return (
    <div
      className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
      style={{ display: 'contents' }}
    >
      {children}
    </div>
  );
}
