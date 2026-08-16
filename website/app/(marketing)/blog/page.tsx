import { BlogListView } from '@/components/blog/BlogList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — PayKit',
  description: 'Technical insights, guides, and updates from the PayKit team.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  return <BlogListView />;
}
