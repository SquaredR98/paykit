'use client';

import { Explainer } from '@/components/workbench/Explainer';
import { CodeBlock } from '@/components/workbench/CodeBlock';
import { CurrencyTools } from '@/components/workbench/sections/CurrencyTools';

export default function CurrencyPage() {
  return (
    <>
      <Explainer eyebrow="Utilities" title="Currency Tools">
        <p>
          Payment APIs work in <strong>smallest-unit integers</strong> to avoid
          floating-point precision errors. $49.99 is represented as{' '}
          <code>4999</code> cents. PayKit provides utility functions to convert
          between human-readable amounts and smallest-unit integers.
        </p>

        <h2>Why smallest-unit integers?</h2>
        <p>
          Floating-point arithmetic can produce rounding errors:
        </p>
        <CodeBlock>{`0.1 + 0.2 === 0.30000000000000004  // true in JS`}</CodeBlock>
        <p>
          By using integer arithmetic in the smallest denomination (cents for USD,
          paise for INR), you eliminate these errors entirely. All PayKit amounts
          are integers &mdash; <code>amount: 1000</code> means $10.00 in USD,
          &yen;1000 in JPY, or 1.000 KWD in Kuwaiti Dinar.
        </p>

        <h2>Decimal variations</h2>
        <p>
          Not all currencies use two decimal places:
        </p>
        <ul>
          <li>
            <strong>Two-decimal</strong> (most currencies): USD, EUR, GBP, INR.
            <code>toSmallestUnit(49.99, &quot;USD&quot;)</code> &rarr; <code>4999</code>
          </li>
          <li>
            <strong>Zero-decimal</strong>: JPY, KRW, VND.
            <code>toSmallestUnit(500, &quot;JPY&quot;)</code> &rarr; <code>500</code>
          </li>
          <li>
            <strong>Three-decimal</strong>: BHD, KWD, OMR.
            <code>toSmallestUnit(1.5, &quot;BHD&quot;)</code> &rarr; <code>1500</code>
          </li>
        </ul>

        <h2>Available functions</h2>
        <ul>
          <li>
            <code>toSmallestUnit(amount, currency)</code> &mdash; converts a
            human-readable amount to the smallest unit integer
          </li>
          <li>
            <code>fromSmallestUnit(smallest, currency)</code> &mdash; converts
            back to a human-readable decimal
          </li>
          <li>
            <code>getCurrencyInfo(currency)</code> &mdash; returns symbol, name,
            and decimal places for a currency code
          </li>
        </ul>
        <p>
          Use the converter below to see these functions in action.
        </p>
      </Explainer>

      <div className="wb-section-interactive">
        <CurrencyTools />
      </div>
    </>
  );
}
