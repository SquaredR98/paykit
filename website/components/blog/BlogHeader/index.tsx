import type { BlogPost } from '@/lib/blog';
import './styles.css';

interface BlogHeaderProps {
  post: BlogPost;
}

export function BlogHeader({ post }: BlogHeaderProps) {
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section className="pk-blk pk-arthead">
      {post.tags.length > 0 && (
        <div className="pk-art-badges">
          {post.tags.map((tag) => (
            <span key={tag} className="pk-bdg pk-bdg--neutral pk-bdg--plain">
              {tag}
            </span>
          ))}
        </div>
      )}
      <h1 className="pk-art-title">{post.title}</h1>
      {post.description && <p className="pk-standfirst">{post.description}</p>}
      <div className="pk-byline">
        <span className="pk-av">{post.author?.initials || 'RR'}</span>
        <span>{post.author?.name || 'PayKit Team'}</span>
        <em>/</em>
        <time dateTime={post.date}>{formattedDate}</time>
        <em>/</em>
        <span>{post.readingTime || 1} min read</span>
      </div>
    </section>
  );
}
