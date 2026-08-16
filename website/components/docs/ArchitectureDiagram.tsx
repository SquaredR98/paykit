import './architecture-diagram.css';

export function ArchitectureDiagram() {
  return (
    <div className="pk-arch">
      <div className="pk-arch__node pk-arch__node--app">Your Application</div>
      <div className="pk-arch__arrow">
        <svg width="2" height="32" aria-hidden="true">
          <line x1="1" y1="0" x2="1" y2="32" stroke="var(--border-default)" strokeWidth="1" />
        </svg>
        <span className="pk-arch__label">unified API</span>
      </div>
      <div className="pk-arch__node pk-arch__node--core">PayKit Core</div>
      <div className="pk-arch__fan">
        <svg className="pk-arch__fan-svg" viewBox="0 0 300 32" preserveAspectRatio="none" aria-hidden="true">
          <line x1="150" y1="0" x2="50" y2="32" stroke="var(--border-default)" strokeWidth="1" />
          <line x1="150" y1="0" x2="150" y2="32" stroke="var(--border-default)" strokeWidth="1" />
          <line x1="150" y1="0" x2="250" y2="32" stroke="var(--border-default)" strokeWidth="1" />
        </svg>
      </div>
      <div className="pk-arch__adapters">
        <div className="pk-arch__node pk-arch__node--adapter">Stripe</div>
        <div className="pk-arch__node pk-arch__node--adapter">Razorpay</div>
        <div className="pk-arch__node pk-arch__node--adapter">PayPal</div>
      </div>
    </div>
  );
}
