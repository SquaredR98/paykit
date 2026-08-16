import { syntaxHighlight, formatJson } from '@/lib/json-highlight';
import './styles.css';

interface JsonViewerProps {
  data: unknown;
  title?: string;
  maxHeight?: number;
}

export function JsonViewer({ data, title, maxHeight }: JsonViewerProps) {
  const html = syntaxHighlight(formatJson(data));

  return (
    <div className="pk-term">
      <div className="pk-term__bar">
        {title && <span className="pk-term__file">{title}</span>}
      </div>
      <pre
        className={`pk-term__code${maxHeight ? ' pk-json--scroll' : ''}`}
        style={maxHeight ? { '--pk-json-max-h': `${maxHeight}px` } as React.CSSProperties : undefined}
      >
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
