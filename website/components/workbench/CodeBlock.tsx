'use client';

import { CopyButton } from '@/components/blog/BlogPost/CodeFigure/CopyButton';

interface CodeBlockProps {
  filename?: string;
  children: string;
}

export function CodeBlock({ filename, children }: CodeBlockProps) {
  return (
    <div className="pk-term">
      <div className="pk-term__bar">
        <span className="pk-term__file">{filename ?? ''}</span>
        <span className="pk-term__meta">
          <CopyButton text={children} />
        </span>
      </div>
      <pre className="pk-term__code"><code>{children}</code></pre>
    </div>
  );
}
