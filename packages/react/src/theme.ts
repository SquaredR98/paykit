import type { ThemeVariables } from '@squaredr/paykit-js';
import type { CSSProperties } from 'react';

const VARIABLE_MAP: Record<keyof ThemeVariables, string> = {
  colorPrimary: '--paykit-color-primary',
  colorBackground: '--paykit-color-background',
  colorText: '--paykit-color-text',
  colorDanger: '--paykit-color-danger',
  colorSuccess: '--paykit-color-success',
  borderRadius: '--paykit-border-radius',
  fontFamily: '--paykit-font-family',
  fontSize: '--paykit-font-size',
  spacingUnit: '--paykit-spacing-unit',
};

export function injectThemeVariables(variables?: ThemeVariables): CSSProperties {
  if (!variables) return {};
  const style: Record<string, string> = {};
  for (const [key, cssVar] of Object.entries(VARIABLE_MAP)) {
    const value = variables[key as keyof ThemeVariables];
    if (value) style[cssVar] = value;
  }
  return style as CSSProperties;
}
