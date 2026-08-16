'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          flowchart: {
            padding: 24,
            nodeSpacing: 40,
            rankSpacing: 40,
            useMaxWidth: false,
            htmlLabels: false,
          },
          themeVariables: {
            darkMode: true,
            background: 'transparent',
            primaryColor: '#1e293b',
            primaryTextColor: '#e4e4e7',
            primaryBorderColor: '#3f3f46',
            lineColor: '#52525b',
            secondaryColor: '#1e293b',
            tertiaryColor: '#27272a',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            nodeBorder: '#3f3f46',
            clusterBkg: '#18181b',
            clusterBorder: '#27272a',
            edgeLabelBackground: '#18181b',
          },
        });

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: rendered } = await mermaid.render(id, chart);
        if (!cancelled) {
          setSvg(rendered);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="wb-mermaid" style={{ color: 'var(--text-bad)', font: 'var(--type-code-sm)' }}>
        Diagram error: {error}
      </div>
    );
  }

  if (!svg) {
    return <div className="wb-mermaid" style={{ minHeight: 80 }} />;
  }

  return (
    <div
      ref={containerRef}
      className="wb-mermaid"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
