'use client';

import { createContext, useContext } from 'react';
import type { ProviderStatusResult, ErrorCatalogEntry } from '@/app/actions/workbench';

interface WorkbenchData {
  providerStatuses: ProviderStatusResult[];
  errorCatalog: ErrorCatalogEntry[];
  configuredProviders: string[];
}

const WorkbenchContext = createContext<WorkbenchData | null>(null);

export function WorkbenchProvider({
  providerStatuses,
  errorCatalog,
  children,
}: {
  providerStatuses: ProviderStatusResult[];
  errorCatalog: ErrorCatalogEntry[];
  children: React.ReactNode;
}) {
  const configuredProviders = providerStatuses
    .filter((p) => p.configured)
    .map((p) => p.provider);

  return (
    <WorkbenchContext value={{ providerStatuses, errorCatalog, configuredProviders }}>
      {children}
    </WorkbenchContext>
  );
}

export function useWorkbench(): WorkbenchData {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error('useWorkbench must be used within WorkbenchProvider');
  return ctx;
}
