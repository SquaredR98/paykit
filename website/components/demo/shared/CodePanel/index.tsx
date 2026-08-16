'use client';

import { useState } from 'react';
import './styles.css';

interface CodeTab {
  label: string;
  html: string;
}

interface CodePanelProps {
  /** Single file name (used when no tabs) */
  filename?: string;
  /** Pre-highlighted HTML (used when no tabs) */
  html?: string;
  /** Multiple tabs with file names and code */
  tabs?: CodeTab[];
}

export function CodePanel({ filename, html, tabs }: CodePanelProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (tabs && tabs.length > 0) {
    return (
      <div className="pk-term">
        <div className="pk-term__bar">
          <div className="flex items-stretch">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                className={`pk-codepanel__tab${i === activeTab ? ' pk-codepanel__tab--active' : ''}`}
                onClick={() => setActiveTab(i)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <pre className="pk-term__code">
          <code dangerouslySetInnerHTML={{ __html: tabs[activeTab]!.html }} />
        </pre>
      </div>
    );
  }

  return (
    <div className="pk-term">
      <div className="pk-term__bar">
        {filename && <span className="pk-term__file">{filename}</span>}
      </div>
      <pre className="pk-term__code">
        <code dangerouslySetInnerHTML={{ __html: html ?? '' }} />
      </pre>
    </div>
  );
}
