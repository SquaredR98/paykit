import Link from 'next/link';
import type { BlogPost } from '@/lib/blog';
import './styles.css';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="pk-post">
      {post.tags.length > 0 && (
        <span className="pk-bdg pk-bdg--neutral pk-bdg--plain">{post.tags[0]}</span>
      )}
      <h3>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p>{post.description}</p>
      <div className="pk-byline pk-byline--foot">
        <span className="pk-av">{post.author?.initials || 'RR'}</span>
        <span>{post.author?.name || 'PayKit Team'}</span>
        <em>/</em>
        <time dateTime={post.date}>{formattedDate}</time>
        <em>/</em>
        <span>{post.readingTime || 1} min</span>
      </div>
    </article>
  );
}
