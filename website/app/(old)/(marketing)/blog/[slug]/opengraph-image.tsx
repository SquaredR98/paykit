import { generateOgImage, OG_SIZE } from '@/lib/og-image';
import { getBlogPost, getAllBlogSlugs } from '@/lib/blog';

export const size = OG_SIZE;
export const contentType = 'image/png';

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  return [
    {
      id: 'og',
      alt: post?.title ?? 'PayKit Blog',
      contentType: 'image/png' as const,
      size: OG_SIZE,
    },
  ];
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return generateOgImage({
      eyebrow: 'Blog',
      title: 'PayKit Blog',
    });
  }

  return generateOgImage({
    eyebrow: post.tags[0] ?? 'Blog',
    title: post.title,
    description: post.description,
  });
}
