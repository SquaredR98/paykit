import { codeToHtml } from 'shiki';
import { createCssVariablesTheme } from 'shiki/core';

const theme = createCssVariablesTheme({
  name: 'paykit',
  variablePrefix: '--pk-code-',
  variableDefaults: {},
});

/**
 * Highlight a code string using shiki with the PayKit CSS variables theme.
 * Returns the full `<pre>` block — drop into a container div.
 * Server-only — call from server components or at build time.
 */
export async function highlight(code: string, lang: string = 'typescript'): Promise<string> {
  return codeToHtml(code, { lang, theme });
}
