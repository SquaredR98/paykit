export function HeroCodeCard({ html }: { html: string }) {
  return (
    <div className="pk-term">
      <div className="pk-term__bar">
        <span className="pk-term__file">stripe-checkout.ts</span>
        <span className="pk-term__meta">
          <span className="pk-term__note">typescript</span>
        </span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
