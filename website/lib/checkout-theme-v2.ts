import type { AppearanceConfig } from '@squaredr/paykit';

/**
 * Checkout appearance for the v2 "Glass" site.
 *
 * Separate from lib/checkout-theme.ts, which is Blueprint's (0px radius,
 * Instrument Sans, blue-258) and is still used by the (old) route group.
 *
 * These values are hardcoded hex rather than `var(--token)` because the
 * provider SDKs render their fields inside a cross-origin iframe — CSS custom
 * properties defined on this page do not reach into it. Each value below is the
 * literal from app/(main)/globals.css; if a token changes there, change it here
 * too.
 */
export const CHECKOUT_APPEARANCE_V2: AppearanceConfig = {
  theme: 'night',
  variables: {
    /* --cyan-500: the accent used for focus rings and the selected method. */
    colorPrimary: '#06b6d4',
    /* --slate-950: matches the sunken surface the form sits on. */
    colorBackground: '#020617',
    /* --zinc-100: --text-strong, for values the user types. */
    colorText: '#f4f4f5',
    /* --red-400 / --emerald-400: the payment-state tokens. */
    colorDanger: '#f87171',
    colorSuccess: '#34d399',
    /* --radius-card: nothing is square in v2 (Rule M5). */
    borderRadius: '12px',
    /* Inter is the body/UI face. The iframe cannot see next/font's variable,
       so the family is named directly and falls back to the system stack. */
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: '15px',
    spacingUnit: '4px',
  },
};
