/**
 * Shared JSON formatting + syntax highlighting utilities.
 *
 * CSS class → design-token mapping (define in your stylesheet):
 *   .pk-json-key    → --code-prop
 *   .pk-json-string → --code-string
 *   .pk-json-number → --code-number
 *   .pk-json-bool   → --code-keyword
 *   .pk-json-null   → --code-comment
 */

export function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'pk-json-number';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'pk-json-key' : 'pk-json-string';
      } else if (/true|false/.test(match)) {
        cls = 'pk-json-bool';
      } else if (/null/.test(match)) {
        cls = 'pk-json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}

export function formatJson(value: unknown): string {
  if (value === undefined || value === null) return 'null';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
