interface RoutingResultProps {
  provider: string;
  reason: string;
}

export function RoutingResult({ provider, reason }: RoutingResultProps) {
  return (
    <div className="pk-routing-demo__resolved">
      <span className="pk-routing-demo__resolved-label">Resolved →</span>
      <span className="pk-routing-demo__resolved-provider">{provider}</span>
      <span className="pk-routing-demo__resolved-reason">{reason}</span>
    </div>
  );
}
