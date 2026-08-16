/**
 * Shared checkout appearance config used by LiveDemo and Hero sections.
 * Matches Blueprint design tokens for consistent dark-mode checkout styling.
 */
export const CHECKOUT_APPEARANCE = {
  theme: 'night' as const,
  variables: {
    colorPrimary: 'oklch(0.640 0.185 258)', // --blue-500
    colorBackground: 'oklch(0.185 0.012 255)', // --slate-800 (card surface)
    colorText: 'oklch(0.800 0.008 255)', // --slate-300 (body text)
    borderRadius: '0px',
    fontFamily: 'Instrument Sans, Helvetica Neue, Helvetica, sans-serif',
    fontSize: '15px',
  },
};
