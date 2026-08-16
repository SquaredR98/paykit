import Link from 'next/link';
import type { BlogPost } from '@/lib/blog';
import './styles.css';

interface FeaturedPostProps {
  post: BlogPost;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section className="pk-blk pk-feat">
      <div className="pk-feat__txt">
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span className="pk-bdg pk-bdg--accent">Featured</span>
          {post.tags.length > 0 && (
            <span className="pk-bdg pk-bdg--neutral pk-bdg--plain">{post.tags[0]}</span>
          )}
        </div>
        <h2>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p>{post.description}</p>
        <div className="pk-byline">
          <span className="pk-av">{post.author?.initials || 'RR'}</span>
          <span>{post.author?.name || 'PayKit Team'}</span>
          <em>/</em>
          <time dateTime={post.date}>{formattedDate}</time>
          <em>/</em>
          <span>{post.readingTime || 1} min read</span>
        </div>
        <Link className="pk-btn pk-btn--secondary" href={`/blog/${post.slug}`}>
          Read post
        </Link>
      </div>
      <div className="pk-feat__art">
        <div className="pk-term">
          <div className="pk-term__bar">
            <span className="pk-term__file">webhooks.ts</span>
            <span className="pk-term__meta">
              <span className="pk-term__note">typescript</span>
            </span>
          </div>
          <pre className="pk-term__code">
            <span className="k">const</span> event = paykit.webhooks.<span className="f">construct</span>(rawBody, headers, secret);
            {'\n\n'}
            <span className="cm">// stripe: charge.succeeded</span>
            {'\n'}
            <span className="cm">// razorpay: payment.captured</span>
            {'\n'}
            <span className="cm">// paypal: PAYMENT.CAPTURE.COMPLETED</span>
            {'\n'}
            <span className="k">if</span> (event.type === <span className="s">'charge.succeeded'</span>) {'{'}
            {'\n  '}
            <span className="k">await</span> <span className="f">fulfillOrder</span>(event.data.<span className="p">metadata</span>.orderId);
            {'\n}'}
          </pre>
        </div>
      </div>
    </section>
  );
}
