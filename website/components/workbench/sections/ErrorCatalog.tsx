import type { ErrorCatalogEntry } from '@/app/actions/workbench';

interface ErrorCatalogProps {
  entries: ErrorCatalogEntry[];
}

export function ErrorCatalog({ entries }: ErrorCatalogProps) {
  return (
    <>
      <p className="text-pk-muted mb-(--space-4)" style={{ font: 'var(--type-body-sm)' }}>
        All unified PaymentErrorCode values with their auto-generated suggestions.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table className="wb-error-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.code}>
                <td>
                  <code
                    className="font-mono"
                    style={{
                      fontSize: 'var(--code-size-sm)',
                      color: 'var(--code-keyword)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.code}
                  </code>
                </td>
                <td>{entry.suggestion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
