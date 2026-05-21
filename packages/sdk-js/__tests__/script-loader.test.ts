import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadScript, resetScriptCache } from '../src/script-loader.js';

describe('loadScript', () => {
  beforeEach(() => {
    resetScriptCache();
    document.head.innerHTML = '';
    delete (window as any).Stripe;
    delete (window as any).Razorpay;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves immediately if global already exists', async () => {
    (window as any).Stripe = () => {};
    await expect(loadScript({ src: 'https://js.stripe.com/v3/', globalName: 'Stripe' })).resolves.toBeUndefined();
    // Should not inject a script tag
    expect(document.head.querySelector('script')).toBeNull();
  });

  it('injects a script tag into document.head', async () => {
    const promise = loadScript({ src: 'https://js.stripe.com/v3/', globalName: 'Stripe' });
    const script = document.head.querySelector('script') as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.src).toBe('https://js.stripe.com/v3/');
    expect(script.async).toBe(true);

    // Simulate script loaded
    script.onload!(new Event('load'));
    await expect(promise).resolves.toBeUndefined();
  });

  it('deduplicates concurrent calls for the same URL', async () => {
    const p1 = loadScript({ src: 'https://js.stripe.com/v3/', globalName: 'Stripe' });
    const p2 = loadScript({ src: 'https://js.stripe.com/v3/', globalName: 'Stripe' });

    // Same promise
    expect(p1).toBe(p2);

    // Only one script tag
    const scripts = document.head.querySelectorAll('script');
    expect(scripts).toHaveLength(1);

    // Resolve
    (scripts[0] as HTMLScriptElement).onload!(new Event('load'));
    await expect(p1).resolves.toBeUndefined();
    await expect(p2).resolves.toBeUndefined();
  });

  it('rejects on script error', async () => {
    const promise = loadScript({ src: 'https://bad.example.com/fail.js', globalName: 'Nope' });
    const script = document.head.querySelector('script') as HTMLScriptElement;
    script.onerror!(new Event('error'));

    await expect(promise).rejects.toThrow('Failed to load script');
  });

  it('rejects on timeout', async () => {
    vi.useFakeTimers();
    const promise = loadScript({ src: 'https://slow.example.com/slow.js', globalName: 'Slow', timeout: 5000 });

    vi.advanceTimersByTime(5000);

    await expect(promise).rejects.toThrow('Script load timeout');
    vi.useRealTimers();
  });

  it('allows retry after failure', async () => {
    // First attempt fails
    const p1 = loadScript({ src: 'https://retry.example.com/lib.js', globalName: 'Lib' });
    const script1 = document.head.querySelector('script') as HTMLScriptElement;
    script1.onerror!(new Event('error'));
    await expect(p1).rejects.toThrow('Failed to load script');

    // Second attempt should create a new script tag (cache was cleared on error)
    const p2 = loadScript({ src: 'https://retry.example.com/lib.js', globalName: 'Lib' });
    const scripts = document.head.querySelectorAll('script');
    expect(scripts).toHaveLength(2);

    (scripts[1] as HTMLScriptElement).onload!(new Event('load'));
    await expect(p2).resolves.toBeUndefined();
  });

  it('sets integrity and crossOrigin when provided', () => {
    loadScript({
      src: 'https://cdn.example.com/lib.js',
      globalName: 'Lib',
      integrity: 'sha384-abc123',
    });
    const script = document.head.querySelector('script') as HTMLScriptElement;
    expect(script.integrity).toBe('sha384-abc123');
    expect(script.crossOrigin).toBe('anonymous');
  });
});
