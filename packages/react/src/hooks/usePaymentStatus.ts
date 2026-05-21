import { useState, useEffect, useCallback } from 'react';
import type { ChargeStatus } from '@squaredr/paykit';

export interface UsePaymentStatusOptions {
  /** URL to fetch charge status from (your backend) */
  statusUrl: string;
  /** Polling interval in ms (default: 2000) */
  interval?: number;
  /** Timeout in ms (default: 300000 = 5 min) */
  timeout?: number;
  /** Whether to start polling */
  enabled?: boolean;
}

export interface UsePaymentStatusResult {
  status: ChargeStatus | null;
  error: Error | null;
  isPolling: boolean;
  refetch: () => void;
}

export function usePaymentStatus(options: UsePaymentStatusOptions): UsePaymentStatusResult {
  const { statusUrl, interval = 2000, timeout = 300000, enabled = true } = options;
  const [status, setStatus] = useState<ChargeStatus | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => {
    setTrigger((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !statusUrl) return;

    let cancelled = false;
    setIsPolling(true);

    const startTime = Date.now();

    const poll = async () => {
      while (!cancelled && Date.now() - startTime < timeout) {
        try {
          const res = await fetch(statusUrl);
          if (!res.ok) throw new Error(`Status fetch failed: ${res.status}`);

          const data = await res.json();
          const chargeStatus = data.status as ChargeStatus;

          if (!cancelled) setStatus(chargeStatus);

          // Stop polling on terminal states
          if (['succeeded', 'failed', 'canceled', 'refunded'].includes(chargeStatus)) {
            break;
          }
        } catch (err) {
          if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
          break;
        }

        // Wait for next poll
        await new Promise((resolve) => setTimeout(resolve, interval));
      }

      if (!cancelled) setIsPolling(false);
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [statusUrl, interval, timeout, enabled, trigger]);

  return { status, error, isPolling, refetch };
}
