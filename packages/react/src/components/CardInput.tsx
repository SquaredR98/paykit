import { useRef, useEffect, useContext, type CSSProperties } from 'react';
import type { AppearanceConfig } from '@squaredr/paykit-js';
import { PayKitContext } from '../context/PayKitContext.js';

interface CardInputProps {
  clientSecret?: string;
  className?: string;
  style?: CSSProperties;
  appearance?: AppearanceConfig;
  onReady?: () => void;
  onChange?: (event: { complete: boolean; error?: string }) => void;
  onError?: (error: Error) => void;
}

export function CardInput({ clientSecret, className, style, appearance, onReady, onChange, onError }: CardInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { client, isReady } = useContext(PayKitContext);

  useEffect(() => {
    if (!client || !isReady || !containerRef.current || !clientSecret) return;

    let cancelled = false;
    const container = containerRef.current;

    client.mountCardInput(container, { clientSecret, appearance })
      .then(() => { if (!cancelled) onReady?.(); })
      .catch((err: unknown) => {
        if (!cancelled) onError?.(err instanceof Error ? err : new Error(String(err)));
      });

    if (onChange) {
      client.on('change', (e) => {
        if (!cancelled) onChange(e.data as { complete: boolean; error?: string });
      });
    }

    return () => {
      cancelled = true;
    };
  }, [client, isReady, clientSecret]);

  return <div ref={containerRef} className={className} style={style} data-paykit-card-input />;
}
