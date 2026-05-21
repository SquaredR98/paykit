import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 sr-dotgrid relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[color-mix(in_srgb,var(--sr-accent),transparent_96%)] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* 404 icon */}
        <div className="flex justify-center">
          <div className="text-center space-y-2">
            <div className="text-[120px] font-bold leading-none tracking-[-0.04em] text-transparent bg-gradient-to-br from-sr-accent to-sr-accent-dim bg-clip-text">
              404
            </div>
            <div className="h-[2px] w-32 mx-auto bg-gradient-to-r from-transparent via-sr-accent to-transparent" />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground">
            Page not found
          </h1>
          <p className="text-sm text-sr-text-dim leading-relaxed max-w-xs mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-sr-accent text-sr-ink-950 font-medium text-sm hover:brightness-110 transition-all hover:shadow-[0_0_24px_-4px_color-mix(in_srgb,var(--sr-accent),transparent_60%)] active:scale-[0.97]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Back to home
          </Link>
        </div>

        {/* Help links */}
        <div className="pt-6 border-t border-sr-ink-800">
          <p className="text-center text-xs text-sr-text-muted">
            Need help?{' '}
            <a
              href="https://github.com/squaredr/paykit/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sr-accent hover:underline"
            >
              Report an issue
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
