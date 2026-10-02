'use client';

import { useState } from 'react';
import './styles.css';

/**
 * The install snippet as a pill, with a copy button.
 *
 * Code is always dark in both themes (Rule M5), so this keeps the code surface
 * even when the rest of the page is light.
 */
export function CopyInstall({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard can be blocked by permissions or a non-secure origin. The
      // command is visible either way, so failing silently is fine here.
    }
  }

  return (
    <span className="pk-v2-install">
      <em aria-hidden="true">$</em>
      <code>{command}</code>
      <button
        type="button"
        className="pk-v2-install__copy"
        onClick={copy}
        aria-label={`Copy "${command}" to clipboard`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? 'copied' : 'copy'}
      </button>
    </span>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
