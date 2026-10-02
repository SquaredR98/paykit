import { Shell } from '@/components/shell';
import { HomepageView } from '@/components/homepage/HomepageView';

/*
 * Preview route for the v2 homepage while v1 still owns /.
 *
 * When v2 is ready to go live this file's contents move to app/(main)/page.tsx
 * and this folder is deleted — see .plan/v2-marketing-parallel-setup.md §6.
 */

export default function V2PreviewPage() {
  return (
    <Shell>
      <HomepageView />
    </Shell>
  );
}
