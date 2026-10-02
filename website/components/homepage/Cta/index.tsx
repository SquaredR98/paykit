import { Button, CopyInstall, Section } from '@/components/ui';
import './styles.css';

/**
 * Closing call to action.
 *
 * The headline leans on the second-provider argument the Compare section makes,
 * because that is when someone actually needs this library — nobody reaches for
 * an abstraction while integrating their first provider.
 */
export function Cta() {
  return (
    <Section>
      <div className="pk-v2-cta">
        {/* Two offset cyan/blue glows bleeding in from the top-right corner. */}
        <span className="pk-v2-cta__glow" aria-hidden="true" />
        <span className="pk-v2-cta__glow pk-v2-cta__glow--b" aria-hidden="true" />

        <div className="pk-v2-cta__copy">
          <h2 className="pk-v2-cta__title">Ship your second provider this week.</h2>
          <p className="pk-v2-cta__lede">
            Install the SDK, swap one import, and keep the rest of your
            integration exactly as it is. The mock adapter runs the whole flow in
            CI without touching a provider.
          </p>
        </div>

        <div className="pk-v2-cta__actions">
          <Button href="/docs/getting-started/quick-start">
            Read the quickstart
            <ArrowIcon />
          </Button>
          <CopyInstall command="pnpm add @squaredr/paykit" />
        </div>
      </div>
    </Section>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
