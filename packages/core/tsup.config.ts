import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'testing/index': 'src/testing/index.ts',
    'adapters/stripe/index': 'src/adapters/stripe/index.ts',
    'adapters/stripe/client/index': 'src/adapters/stripe/client/index.ts',
    'adapters/razorpay/index': 'src/adapters/razorpay/index.ts',
    'adapters/razorpay/client/index': 'src/adapters/razorpay/client/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['stripe', 'razorpay'],
});
