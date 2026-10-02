import { Sora, Inter, Fira_Code, JetBrains_Mono } from 'next/font/google';
import './globals.css';

/*
 * (main) — the v2 "Glass" site.
 *
 * This group owns its own globals.css and its own fonts, exactly as (old) does.
 * Neither group's styles can reach the other, because the root layout imports
 * no CSS at all. See app/layout.tsx.
 *
 * The four families match Rule M5: Sora for headings, Inter for body/UI,
 * Fira Code for code blocks, JetBrains Mono for tokens, IDs and meta.
 *
 * Each is given its ROLE name directly (--font-heading, --font-sans,
 * --font-code, --font-mono) so these are the only place those tokens are set.
 * globals.css must not redeclare them — a declaration there would override the
 * value next/font puts on the wrapper below, and the face would silently fall
 * back to a system font.
 */

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-code',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /*
   * `display: contents` means this wrapper defines the font variables without
   * adding a box of its own, so it never affects layout. Same approach as
   * (old)/layout.tsx — the font vars belong on <html>, but only the root layout
   * owns that tag.
   */
  return (
    <div
      className={`${sora.variable} ${inter.variable} ${firaCode.variable} ${jetbrainsMono.variable}`}
      style={{ display: 'contents' }}
    >
      {children}
    </div>
  );
}
