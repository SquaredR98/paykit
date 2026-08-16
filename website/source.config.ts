import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { createCssVariablesTheme } from 'shiki/core';

const paykitTheme = createCssVariablesTheme({
  name: 'paykit',
  variablePrefix: '--pk-code-',
  variableDefaults: {},
});

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: paykitTheme,
        dark: paykitTheme,
      },
    },
  },
});
