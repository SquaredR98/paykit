import { generateOgImage, OG_SIZE } from '@/lib/og-image';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Contact — PayKit';

export default async function OgImage() {
  return generateOgImage({
    eyebrow: 'Contact',
    title: 'Get in touch with the PayKit team.',
    description:
      'Questions, bug reports, feature requests, and partnership inquiries.',
  });
}
