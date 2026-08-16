interface ErrorCodeTableProps {
  codes: Record<string, string>;
}

export function ErrorCodeTable({ codes }: ErrorCodeTableProps) {
  return (
    <div className="pk-error-demo__table-wrap">
      <h2 className="pk-error-demo__table-title">All error codes</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="pk-error-demo__table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(codes).map(([code, suggestion]) => (
              <tr key={code}>
                <td>{code}</td>
                <td>{suggestion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
