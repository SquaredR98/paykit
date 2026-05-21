/**
 * Shared appearance configuration for client-side payment UIs.
 * Used by all ClientAdapter implementations to theme provider-hosted elements.
 */

export interface AppearanceConfig {
  theme?: 'default' | 'night' | 'flat';
  variables?: ThemeVariables;
}

export interface ThemeVariables {
  colorPrimary?: string;
  colorBackground?: string;
  colorText?: string;
  colorDanger?: string;
  colorSuccess?: string;
  borderRadius?: string;
  fontFamily?: string;
  fontSize?: string;
  spacingUnit?: string;
}
