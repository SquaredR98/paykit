import Link from 'next/link';
import type { Author } from '@/lib/authors';
import './styles.css';

interface AuthorBioProps {
  author: Author;
}

export function AuthorBio({ author }: AuthorBioProps) {
  return (
    <section className="pk-author">
      <span className="pk-av pk-av--lg">{author.initials}</span>
      <div className="pk-author__info">
        <span className="pk-author__name">{author.name}</span>
        {author.bio && <span className="pk-author__bio">{author.bio}</span>}
      </div>
      <Link className="pk-btn pk-btn--secondary pk-btn--sm" href={`/blog?author=${author.id}`}>
        All posts <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
