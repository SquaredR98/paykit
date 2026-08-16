import Link from 'next/link';
import './styles.css';

interface Release {
  version: string;
  description: string;
}

interface TopPost {
  title: string;
  slug: string;
}

interface BlogRailProps {
  releases?: Release[];
  topPosts?: TopPost[];
}

export function BlogRail({ releases = [], topPosts = [] }: BlogRailProps) {
  const defaultReleases: Release[] = [
    { version: 'v1.0.1', description: 'React hooks + SDK-JS stable release' },
    { version: 'v0.10.0', description: 'PayPal adapter, PaymentRouter, idempotency' },
    { version: 'v0.9.0', description: 'Razorpay adapter, webhook normalization' },
    { version: 'v0.8.0', description: 'Stripe adapter, unified charge API' },
  ];

  const defaultTopPosts: TopPost[] = [
    { title: 'Introducing PayKit: one API for every payment provider', slug: 'introducing-paykit' },
    { title: 'Why payment abstraction matters', slug: 'why-payment-abstraction' },
    { title: 'The adapter pattern, explained', slug: 'adapter-pattern-explained' },
  ];

  const releaseList = releases.length > 0 ? releases : defaultReleases;
  const topPostList = topPosts.length > 0 ? topPosts : defaultTopPosts;

  return (
    <aside className="pk-rail">
      <div className="pk-railblk">
        <span className="pk-eyebrow">Latest releases</span>
        <div className="pk-clog">
          {releaseList.map((release) => (
            <div key={release.version} className="pk-cl">
              <span className="pk-v">{release.version}</span>
              <span className="pk-d">{release.description}</span>
            </div>
          ))}
        </div>
        <a className="pk-btn pk-btn--secondary pk-btn--sm" href="/changelog">
          Full changelog
        </a>
      </div>

      <div className="pk-railblk">
        <span className="pk-eyebrow">Most read</span>
        <div className="pk-toplist">
          {topPostList.map((post, index) => (
            <div key={post.slug} className="pk-topitem">
              <span className="pk-topnum">{index + 1}</span>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </div>
          ))}
        </div>
      </div>

      <div className="pk-railblk pk-cta">
        <span className="pk-eyebrow">Write with us</span>
        <p className="pk-cta__text">
          Got payment integration war stories? We're looking for guest posts on provider quirks,
          migration tales, and infrastructure decisions.
        </p>
        <a className="pk-btn pk-btn--primary pk-btn--sm" href="https://github.com/SquaredR98/paykit/discussions" target="_blank" rel="noopener noreferrer">
          Pitch an idea
        </a>
      </div>
    </aside>
  );
}
