import Link from 'next/link';
import './styles.css';

export function GetStarted() {
  return (
    <section className="pk-getstarted">
      <div className="pk-sechead pk-sechead--center">
        <span className="pk-eyebrow">Get started</span>
        <h2 className="pk-sec-title">Ready to simplify your payment stack?</h2>
        <p className="pk-lede">
          Install PayKit and accept your first payment in minutes. One SDK, every provider.
        </p>
        <div className="pk-getstarted__install">
          <div className="pk-cmdline">
            <span className="pk-cmdline__dollar">$</span>
            <code className="pk-cmdline__text">npm install @squaredr/paykit stripe</code>
          </div>
        </div>
        <div className="pk-getstarted__actions">
          <Link href="/docs" className="pk-btn pk-btn--primary pk-btn--xl">
            Read the docs
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="https://github.com/SquaredR98/paykit"
            className="pk-btn pk-btn--secondary pk-btn--xl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
