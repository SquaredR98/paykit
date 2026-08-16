import Link from 'next/link';
import type { BlogPost } from '@/lib/blog';
import './styles.css';

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="pk-related">
      <div className="pk-subrow">
        <span className="pk-eyebrow">Keep reading</span>
        <span className="pk-sp" />
        <Link href="/blog" className="pk-subrow__link">Back to blog</Link>
      </div>
      <div className="pk-g3">
        {posts.slice(0, 3).map((post) => {
          const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          return (
            <article key={post.slug} className="pk-rel">
              {post.tags.length > 0 && (
                <span className="pk-bdg pk-bdg--neutral pk-bdg--plain">{post.tags[0]}</span>
              )}
              <h3>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <div className="pk-byline">
                <span>{formattedDate}</span>
                <em>/</em>
                <span>{post.readingTime || 1} min</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
