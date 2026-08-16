import type { ReactNode } from 'react';
import { CopyButton } from './CopyButton';
import './styles.css';

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: ReactNode;
}

interface CodeFigureProps {
  filename: string;
  children?: ReactNode;
  diff?: DiffLine[];
  diffSummary?: string;
  copyText?: string;
  caption?: string;
}

export function CodeFigure({ filename, children, diff, diffSummary, copyText, caption }: CodeFigureProps) {
  return (
    <figure className="pk-prose-figure">
      <div className="pk-term">
        <div className="pk-term__bar">
          <span className="pk-term__file">{filename}</span>
          <span className="pk-term__meta">
            {diffSummary && <span className="pk-term__note">{diffSummary}</span>}
            {copyText && <CopyButton text={copyText} />}
          </span>
        </div>
        {diff ? (
          <div className="pk-diffwrap">
            {diff.map((line, i) => (
              <div
                key={i}
                className={`pk-dl ${line.type === 'remove' ? 'pk-dl--rm' : line.type === 'add' ? 'pk-dl--ad' : ''}`}
              >
                <span>{line.type === 'remove' ? '-' : line.type === 'add' ? '+' : ' '}</span>
                <span>{line.content}</span>
              </div>
            ))}
          </div>
        ) : (
          <pre className="pk-term__code">{children}</pre>
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
