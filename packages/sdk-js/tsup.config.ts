import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'providers/stripe': 'src/providers/stripe.ts',
    'providers/razorpay': 'src/providers/razorpay.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: ['@squaredr/paykit'],
});
