import { useContext } from 'react';
import { PayKitContext } from '../context/PayKitContext.js';

export function usePayKit() {
  const { client, isReady, error } = useContext(PayKitContext);

  if (!client) {
    throw new Error('usePayKit must be used within a <PayKitProvider>');
  }

  return {
    client,
    isReady,
    error,
    tokenize: () => client.tokenize(),
    confirmPayment: (clientSecret: string, options?: { returnUrl?: string }) =>
      client.confirmPayment(clientSecret, options),
  };
}
