import { ImageResponse } from 'next/og';
import { getOgFonts } from './og-fonts';

/* ── Blueprint dark palette ── */
const BG = '#1a1d23';
const SURFACE = '#22252c';
const INK = '#f0f2f4';
const MUTED = '#8b919a';
const RULE = '#2e323a';
const BLUE = '#4d8eff';

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * PayKit logo mark — three stacked bars (blue / outlined / blue).
 */
function LogoMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            width: 32,
            height: 7,
            background: BLUE,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            width: 32,
            height: 7,
            border: `2px solid ${BLUE}`,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            width: 32,
            height: 7,
            background: BLUE,
            borderRadius: 2,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: '"Space Grotesk"',
          fontSize: 22,
          fontWeight: 600,
          color: INK,
          letterSpacing: '-0.02em',
        }}
      >
        PayKit
      </div>
    </div>
  );
}

/**
 * Generates a Blueprint-themed OG image for PayKit.
 *
 * Layout:
 *   ┌───────────────────────────────────────────────┐
 *   │  Logo mark + PayKit                           │
 *   │                                               │
 *   │  EYEBROW                                      │
 *   │  Title text (large)                           │
 *   │                                               │
 *   │  Description text (smaller, muted)            │
 *   │                                               │
 *   │  ─────── hairline ───────                     │
 *   │  paykit.squaredr.tech                         │
 *   └───────────────────────────────────────────────┘
 */
export async function generateOgImage(options: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  const fonts = await getOgFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: BG,
          padding: '60px 80px',
        }}
      >
        {/* Top: logo mark */}
        <LogoMark />

        {/* Center: text content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {options.eyebrow && (
            <div
              style={{
                fontFamily: '"JetBrains Mono"',
                fontSize: 14,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: BLUE,
                marginBottom: 16,
              }}
            >
              {options.eyebrow}
            </div>
          )}

          <div
            style={{
              fontFamily: '"Space Grotesk"',
              fontSize: options.title.length > 40 ? 48 : 56,
              fontWeight: 600,
              color: INK,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              maxWidth: 900,
            }}
          >
            {options.title}
          </div>

          {options.description && (
            <div
              style={{
                fontFamily: '"Space Grotesk"',
                fontSize: 22,
                color: MUTED,
                lineHeight: 1.5,
                marginTop: 20,
                maxWidth: 750,
              }}
            >
              {options.description}
            </div>
          )}
        </div>

        {/* Bottom: hairline + URL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 1, background: RULE, width: '100%' }} />
          <div
            style={{
              fontFamily: '"JetBrains Mono"',
              fontSize: 14,
              letterSpacing: '0.08em',
              color: MUTED,
            }}
          >
            paykit.squaredr.tech
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Space Grotesk', data: fonts.display, weight: 600 },
        { name: 'JetBrains Mono', data: fonts.mono, weight: 500 },
      ],
    },
  );
}
