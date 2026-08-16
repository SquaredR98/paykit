import './styles.css';

interface Column {
  eyebrow: string;
  title: string;
  items: { text: string; positive: boolean }[];
  highlight?: boolean;
}

const columns: Column[] = [
  {
    eyebrow: 'DIY integration',
    title: 'Build it yourself',
    items: [
      { text: 'Separate SDK per provider', positive: false },
      { text: 'Custom type definitions', positive: false },
      { text: 'Manual webhook parsing', positive: false },
      { text: 'Provider-specific error handling', positive: false },
      { text: 'Rewrite when switching providers', positive: false },
      { text: 'Build adapters from scratch', positive: false },
    ],
  },
  {
    eyebrow: 'PayKit',
    title: 'One SDK, every provider',
    highlight: true,
    items: [
      { text: 'Single API across all providers', positive: true },
      { text: 'Full TypeScript coverage built-in', positive: true },
      { text: 'Unified webhook events', positive: true },
      { text: 'Consistent error types', positive: true },
      { text: 'Swap adapters, keep your code', positive: true },
      { text: 'Extensible adapter interface', positive: true },
    ],
  },
  {
    eyebrow: 'Orchestration platforms',
    title: 'Hosted services',
    items: [
      { text: 'Vendor lock-in to their API', positive: false },
      { text: 'Per-transaction fees on top of gateway fees', positive: false },
      { text: 'Data routes through third-party servers', positive: false },
      { text: 'Limited customization', positive: false },
      { text: 'Compliance overhead for PCI / SOC2', positive: false },
      { text: 'Closed ecosystem', positive: false },
    ],
  },
];

export function WhyPaykit() {
  return (
    <section className="pk-blk pk-why">
      <div className="pk-sechead pk-sechead--center">
        <span className="pk-eyebrow">Why PayKit</span>
        <h2 className="pk-sec-title">The middle ground between DIY and vendor lock-in</h2>
        <p className="pk-lede">
          You shouldn&apos;t have to choose between writing everything from scratch
          and paying per-transaction fees to an orchestration platform.
        </p>
      </div>
      <div className="pk-why__grid">
        {columns.map((col) => (
          <div key={col.eyebrow} className={`pk-ccol ${col.highlight ? 'pk-ccol--win' : ''}`}>
            <span className="pk-eyebrow">{col.eyebrow}</span>
            <h3>{col.title}</h3>
            <ul className="pk-clist">
              {col.items.map((item) => (
                <li key={item.text}>
                  <span className={`pk-mk ${item.positive ? 'pk-mk--yes' : ''}`}>
                    {item.positive ? '\u2713' : '\u2212'}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
