import { BlogCard } from '../BlogCard';
import type { BlogPost } from '@/lib/blog';
import './styles.css';

interface PostGridProps {
  posts: BlogPost[];
}

export function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="pk-post-grid--empty">
        <p className="pk-note">No blog posts found.</p>
      </div>
    );
  }

  return (
    <div className="pk-g2">
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
