'use client';

import { useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Children, isValidElement } from 'react';

/* ── helpers ── */

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!isValidElement(node)) return '';
  const { children } = node.props as { children?: ReactNode };
  return Children.toArray(children).map(extractText).join('');
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className="pk-copy" onClick={handleCopy} type="button">
      {copied ? 'copied' : 'copy'}
    </button>
  );
}

/* ── DocsCodeBlock ──
   Wraps Fumadocs/Shiki <pre> elements in the site-wide .pk-term terminal
   chrome (title bar + copy button) so docs code blocks match the blog.

   Fumadocs puts `title` from the code fence meta string directly onto <pre>
   as an HTML attribute. The language lives as a `language-{lang}` class on
   the inner <code> element. */

export function DocsCodeBlock(props: ComponentPropsWithoutRef<'pre'>) {
  const { title, children, ...rest } = props as ComponentPropsWithoutRef<'pre'> & { title?: string };

  // Extract language from <code className="language-ts ...">
  const codeChild = Children.toArray(children).find(
    (c) => isValidElement(c) && (c as React.ReactElement).type === 'code',
  );
  let lang = '';
  if (codeChild && isValidElement(codeChild)) {
    const className = (codeChild.props as Record<string, unknown>).className;
    if (typeof className === 'string') {
      const match = className.match(/language-(\S+)/);
      if (match) lang = match[1];
    }
  }

  const rawText = extractText(children);
  const label = title || lang;

  return (
    <div className="pk-term">
      <div className="pk-term__bar">
        <span className="pk-term__file">{label}</span>
        <span className="pk-term__meta">
          <CopyButton text={rawText} />
        </span>
      </div>
      <pre {...rest}>{children}</pre>
    </div>
  );
}
