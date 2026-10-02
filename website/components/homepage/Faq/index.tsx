import { Eyebrow, Section } from '@/components/ui';
import { faqItems } from './questions';
import './styles.css';

/**
 * Homepage FAQ.
 *
 * Built on native <details>/<summary> rather than a JS accordion: it works
 * without hydration, is keyboard and screen-reader accessible for free, and the
 * answers remain in the DOM for search engines.
 */
export function Faq() {
  return (
    <Section id="faq">
      <div className="pk-v2-faq__grid">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="pk-v2-section__title">
            Questions integrators ask first.
          </h2>
          <p className="pk-v2-section__sub">
            Something missing?{' '}
            <a
              href="https://github.com/SquaredR98/paykit/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="pk-v2-faq__link"
            >
              Open a discussion
            </a>{' '}
            on GitHub.
          </p>
        </div>

        <div className="pk-v2-faq">
          {faqItems.map((item, index) => (
            <details key={item.question} open={index === 0}>
              <summary>
                {item.question}
                <ChevronIcon />
              </summary>
              <div className="pk-v2-faq__answer">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
