'use client';

import { useState } from 'react';

interface Tab {
  label: string;
  html: string;
}

export function TryItTabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="pk-term">
      <div className="pk-term__bar">
        <div className="pk-tryit__tabs">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              className={`pk-ttab ${i === activeTab ? 'pk-ttab--active' : ''}`}
              role="tab"
              aria-selected={i === activeTab}
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: tabs[activeTab].html }} />
    </div>
  );
}
