import type { Metadata } from 'next';
import { ApiExplorer } from '@/components/docs/ApiExplorer';

export const metadata: Metadata = {
  title: 'API Explorer — PayKit Docs',
  description:
    'Interactive API console for PayKit. Execute real operations against test-mode provider APIs and see unified responses.',
  alternates: { canonical: '/docs/api-explorer' },
};

export default function ApiExplorerPage() {
  return <ApiExplorer />;
}
