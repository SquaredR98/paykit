import { Suspense } from 'react';
import { PostGrid } from '../PostGrid';
import { TagFilter } from '../TagFilter';
import { SubscribeCta } from '../SubscribeCta';
import { FeaturedPost } from './FeaturedPost';
import { BlogRail } from './BlogRail';
import { getAllBlogPosts, getBlogPostsByTag, getAllTags } from '@/lib/blog';
import './styles.css';

interface BlogListViewProps {
  searchParams?: {
    tag?: string;
  };
}

export async function BlogListView({ searchParams }: BlogListViewProps = {}) {
  const tag = searchParams?.tag;
  const posts = tag ? await getBlogPostsByTag(tag) : await getAllBlogPosts();
  const allTags = await getAllTags();

  // Get the most recent post for featured section
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="">
      {/* Page head with title and subscribe rail */}
      <section className="pk-blk pk-pagehead">
        <div>
          <span className="pk-eyebrow">Blog</span>
          <h1 className="pk-page">Technical insights & guides</h1>
          <p className="pk-lede">
            Deep dives into payment integration, provider patterns, and best practices for
            building robust payment systems.
          </p>
        </div>
        <div>
          <span className="pk-eyebrow">Get updates</span>
          <p style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)', margin: '0' }}>
            Weekly insights on payment integration, provider quirks, and SDK patterns.
          </p>
          <div className="pk-sub">
            <input type="email" placeholder="your@email.com" required />
            <button type="submit" className="pk-btn pk-btn--primary">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Filter chips */}
      <Suspense>
        <TagFilter tags={allTags} postCount={posts.length} />
      </Suspense>

      {/* Featured post */}
      {featuredPost && <FeaturedPost post={featuredPost} />}

      {/* Main content with post grid and right rail */}
      <div className="pk-split-blog">
        <div>
          <PostGrid posts={regularPosts} />
          {/* Pagination placeholder */}
          <div className="pk-pager">
            <span className="pk-note">Showing 1–{regularPosts.length} of {posts.length}</span>
            <div className="pk-pnums">
              <a href="#" aria-current="page">1</a>
            </div>
          </div>
        </div>

        <BlogRail />
      </div>

      {/* Subscribe CTA at bottom */}
      <SubscribeCta />
    </div>
  );
}
