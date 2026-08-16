import { getProviderStatuses, getErrorCatalog } from '@/app/actions/workbench';
import { WorkbenchShell } from '@/components/workbench/WorkbenchShell';

export default async function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [providerStatuses, errorCatalog] = await Promise.all([
    getProviderStatuses(),
    getErrorCatalog(),
  ]);

  return (
    <WorkbenchShell providerStatuses={providerStatuses} errorCatalog={errorCatalog}>
      {children}
    </WorkbenchShell>
  );
}
