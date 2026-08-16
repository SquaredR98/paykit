'use client';

import type { ProviderStatusResult, ErrorCatalogEntry } from '@/app/actions/workbench';
import { WorkbenchProvider } from './WorkbenchContext';
import { WorkbenchSidebar } from './WorkbenchSidebar';
import './workbench.css';

interface WorkbenchShellProps {
  providerStatuses: ProviderStatusResult[];
  errorCatalog: ErrorCatalogEntry[];
  children: React.ReactNode;
}

export function WorkbenchShell({ providerStatuses, errorCatalog, children }: WorkbenchShellProps) {
  return (
    <WorkbenchProvider providerStatuses={providerStatuses} errorCatalog={errorCatalog}>
      <div className="wb-shell">
        <WorkbenchSidebar />
        <div className="wb-content">
          {children}
        </div>
      </div>
    </WorkbenchProvider>
  );
}
