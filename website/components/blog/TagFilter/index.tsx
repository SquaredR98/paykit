'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import './styles.css';

interface TagFilterProps {
  tags: string[];
  postCount?: number;
}

export function TagFilter({ tags, postCount }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag');

  const handleTagClick = (tag: string | null) => {
    if (tag === null || activeTag === tag) {
      router.push('/blog');
    } else {
      router.push(`/blog?tag=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <div className="pk-filters">
      <button
        className="pk-chip"
        aria-pressed={!activeTag}
        onClick={() => handleTagClick(null)}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className="pk-chip"
          aria-pressed={activeTag === tag}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </button>
      ))}
      <span className="pk-sp" />
      {postCount !== undefined && (
        <span className="pk-note">{postCount} posts</span>
      )}
    </div>
  );
}
