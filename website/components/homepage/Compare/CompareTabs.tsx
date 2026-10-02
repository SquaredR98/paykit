'use client';

import { useState } from 'react';
import { CodeCard } from '@/components/ui/CodeCard';

export interface ComparePane {
  id: string;
  tabLabel: string;
  filename: string;
  beforeHtml: string;
  afterHtml: string;
  beforeLines: number;
  afterLines: number;
}

/**
 * Tab strip plus the before/after panes.
 *
 * Every pane is in the DOM and inactive ones are `hidden`, so switching is
 * instant and the highlighted HTML is only generated once, on the server.
 */
export function CompareTabs({ panes }: { panes: ComparePane[] }) {
  const [active, setActive] = useState(panes[0]?.id);

  return (
    <>
      <div className="pk-v2-tabs" role="tablist" aria-label="Code comparison">
        {panes.map((pane) => (
          <button
            key={pane.id}
            type="button"
            role="tab"
            id={`tab-${pane.id}`}
            aria-selected={pane.id === active}
            aria-controls={`pane-${pane.id}`}
            className="pk-v2-tabs__tab"
            onClick={() => setActive(pane.id)}
          >
            {pane.tabLabel}
          </button>
        ))}
      </div>

      {panes.map((pane) => (
        <div
          key={pane.id}
          id={`pane-${pane.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${pane.id}`}
          hidden={pane.id !== active}
          className="pk-v2-compare"
        >
          <div>
            <div className="pk-v2-compare__label">
              <b>Without PayKit</b>
              <span>
                {pane.beforeLines} lines &middot; per-provider
              </span>
            </div>
            <CodeCard html={pane.beforeHtml} filename={pane.filename} />
          </div>

          <div>
            <div className="pk-v2-compare__label">
              <b>With PayKit</b>
              <span>{pane.afterLines} lines &middot; one call</span>
            </div>
            <CodeCard html={pane.afterHtml} filename={pane.filename} />
          </div>
        </div>
      ))}
    </>
  );
}
