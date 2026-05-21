import { createContext } from 'react';
import type { PayKitClient } from '@squaredr/paykit-js';

export interface PayKitContextValue {
  client: PayKitClient | null;
  isReady: boolean;
  error: Error | null;
}

export const PayKitContext = createContext<PayKitContextValue>({
  client: null,
  isReady: false,
  error: null,
});
