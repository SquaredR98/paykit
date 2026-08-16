'use client';

import { useEffect, useRef, useState } from 'react';
import './styles.css';

const removedLines = [
  `<span class="k">if</span> (provider === <span class="s">'stripe'</span>) {`,
  `  <span class="k">const</span> intent = <span class="k">await</span> stripe.paymentIntents.<span class="f">create</span>({`,
  `    amount, <span class="p">currency</span>: <span class="s">'usd'</span>, <span class="p">payment_method_types</span>: [<span class="s">'card'</span>],`,
  `  });`,
  `  <span class="k">return</span> { <span class="p">id</span>: intent.id, <span class="p">status</span>: intent.status };`,
  `} <span class="k">else if</span> (provider === <span class="s">'razorpay'</span>) {`,
  `  <span class="k">const</span> order = <span class="k">await</span> razorpay.orders.<span class="f">create</span>({`,
  `    <span class="p">amount</span>: amount * <span class="n">100</span>, <span class="p">currency</span>: <span class="s">'INR'</span>,`,
  '    <span class="p">receipt</span>: <span class="s">`receipt_${Date.now()}`</span>,',
  `  });`,
  `  <span class="k">return</span> { <span class="p">id</span>: order.id, <span class="p">status</span>: order.status };`,
  `}`,
  `<span class="cm">// … more providers, more branches</span>`,
];

const addedLines = [
  `<span class="k">const</span> charge = <span class="k">await</span> paykit.charges.<span class="f">create</span>({`,
  `  amount,`,
  `  currency,`,
  `  <span class="p">metadata</span>: { orderId },`,
  `});`,
  ``,
  `<span class="cm">// Same shape from every provider. Swap the adapter,</span>`,
  `<span class="cm">// zero changes to your business logic.</span>`,
];

export function BeforeAfter() {
  const counterRef = useRef<HTMLSpanElement>(null);
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || counted) return;
        setCounted(true);
        const target = 29;
        const start = performance.now();
        const duration = 900;
        function step(now: number) {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el!.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [counted]);

  return (
    <section className="pk-blk">
      <div className="pk-sechead pk-sechead--center">
        <span className="pk-eyebrow">Before &amp; after</span>
        <h2 className="pk-sec-title">Kill the spaghetti code</h2>
        <p className="pk-lede">
          Replace provider-specific branches with a single, clean interface.
        </p>
      </div>
      <div className="pk-diff__body">
        <div className="pk-term">
          <div className="pk-term__bar">
            <span className="pk-term__file">payments.ts</span>
            <span className="pk-term__meta">
              <span className="pk-term__note">&minus;13 +8</span>
            </span>
          </div>
          <div className="pk-diff__wrap">
            {removedLines.map((html, i) => (
              <div key={`rm-${i}`} className="pk-dl pk-dl--rm">
                <span>-</span>
                <span dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            ))}
            {addedLines.map((html, i) => (
              <div key={`ad-${i}`} className="pk-dl pk-dl--ad">
                <span>+</span>
                <span dangerouslySetInnerHTML={{ __html: html || '&nbsp;' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pk-diff__counter">
        <span className="pk-diff__counter-num" ref={counterRef}>0</span>
        <span className="pk-diff__counter-cap">lines of boilerplate eliminated</span>
      </div>
    </section>
  );
}
