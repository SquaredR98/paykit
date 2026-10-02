import { generateOgImage, OG_SIZE } from '@/lib/og-image';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Changelog — PayKit';

export default async function OgImage() {
  return generateOgImage({
    eyebrow: 'Changelog',
    title: 'Release history for PayKit.',
    description:
      'Version history for @squaredr/paykit, @squaredr/paykit-react, and @squaredr/paykit-js.',
  });
}
