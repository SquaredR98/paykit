import { useState, useEffect, useRef, type ReactNode } from 'react';
import { PayKitClient, type PayKitClientConfig } from '@squaredr/paykit-js';
import type { ClientAdapter } from '@squaredr/paykit';
import { PayKitContext } from './PayKitContext.js';

interface PayKitProviderPropsLegacy {
  config: PayKitClientConfig;
  clientAdapter?: never;
  children: ReactNode;
}

interface PayKitProviderPropsNew {
  clientAdapter: ClientAdapter;
  config?: never;
  children: ReactNode;
}

type PayKitProviderProps = PayKitProviderPropsLegacy | PayKitProviderPropsNew;

export function PayKitProvider({ children, ...rest }: PayKitProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const clientRef = useRef<PayKitClient | null>(null);
  const ownsClientRef = useRef(false);

  const clientAdapter = 'clientAdapter' in rest ? rest.clientAdapter : undefined;
  const config = 'config' in rest ? rest.config : undefined;

  // Stable key for re-creation detection
  const adapterProvider = clientAdapter?.provider;
  const configProvider = config && 'provider' in config ? config.provider : undefined;
  const stableKey = adapterProvider ?? configProvider ?? 'unknown';

  useEffect(() => {
    let cancelled = false;

    // Create the client inside the effect so strict mode cleanup/re-run works correctly
    let client: PayKitClient;
    if (clientAdapter) {
      client = new PayKitClient({ clientAdapter });
      ownsClientRef.current = false; // We don't own the adapter — don't destroy it
    } else if (config) {
      client = new PayKitClient(config);
      ownsClientRef.current = true; // We created via bridge registry — we own it
    } else {
      return;
    }

    clientRef.current = client;

    client.loadProvider()
      .then(() => {
        if (!cancelled) setIsReady(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
      if (ownsClientRef.current) {
        client.destroy();
      }
      clientRef.current = null;
      setIsReady(false);
    };
  }, [stableKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PayKitContext.Provider value={{ client: clientRef.current, isReady, error }}>
      {children}
    </PayKitContext.Provider>
  );
}
