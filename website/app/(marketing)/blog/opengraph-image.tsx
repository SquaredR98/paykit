import { generateOgImage, OG_SIZE } from '@/lib/og-image';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Blog — PayKit';

export default async function OgImage() {
  return generateOgImage({
    eyebrow: 'Blog',
    title: 'Engineering notes from the PayKit team.',
    description:
      'Payment integration patterns, adapter architecture, error handling, and shipping decisions.',
  });
}
