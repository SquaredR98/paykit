import { codeToHtml } from 'shiki';
import { createCssVariablesTheme } from 'shiki/core';
import { transformerNotationDiff } from '@shikijs/transformers';

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

/**
 * Highlight code that uses `// [!code --]` and `// [!code ++]` diff annotations.
 * Shiki adds `.diff.remove` / `.diff.add` classes to the relevant `<span class="line">` elements.
 */
export async function highlightDiff(code: string, lang: string = 'typescript'): Promise<string> {
  return codeToHtml(code, { lang, theme, transformers: [transformerNotationDiff()] });
}
