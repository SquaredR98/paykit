export interface ScriptLoadOptions {
  src: string;
  globalName: string;
  timeout?: number;
  integrity?: string;
}

const scriptCache = new Map<string, Promise<void>>();

export function loadScript(options: ScriptLoadOptions): Promise<void> {
  const { src, globalName, timeout = 10000, integrity } = options;

  // Already available globally
  if ((window as any)[globalName]) return Promise.resolve();

  // Already loading
  const cached = scriptCache.get(src);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    if (integrity) {
      script.integrity = integrity;
      script.crossOrigin = 'anonymous';
    }

    const timer = setTimeout(() => {
      scriptCache.delete(src);
      reject(new Error(`Script load timeout: ${src}`));
    }, timeout);

    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };

    script.onerror = () => {
      clearTimeout(timer);
      scriptCache.delete(src);
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.head.appendChild(script);
  });

  scriptCache.set(src, promise);
  return promise;
}

/** Reset the script cache (useful for testing) */
export function resetScriptCache(): void {
  scriptCache.clear();
}
