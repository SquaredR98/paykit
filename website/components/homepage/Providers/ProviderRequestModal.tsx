'use client';

import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { FormEngineRenderer } from '@squaredr/fieldcraft-react';
import type { FormResponse } from '@squaredr/fieldcraft-core';
import { providerRequestSchema } from '@/lib/form-schemas';
import { submitContactForm } from '@/app/actions/contact';
import '@/lib/fieldcraft-theme.css';

export function ProviderRequestModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (!open) setSubmitted(false);
  }, [open]);

  if (!open) return null;

  async function handleSubmit(response: FormResponse) {
    const result = await submitContactForm({
      form: 'provider-request',
      data: response.values,
    });
    if (result.success) {
      setSubmitted(true);
      setTimeout(onClose, 2000);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--scrim)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg mx-4 border border-pk-border bg-pk-card"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pk-border">
          <h3 className="font-display font-semibold text-pk-strong" style={{ fontSize: 'var(--text-xl)' }}>
            Request a provider
          </h3>
          <button
            onClick={onClose}
            className="text-pk-muted hover:text-pk-strong transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <p className="text-pk-strong font-medium" style={{ fontSize: 'var(--text-lg)' }}>
                Request submitted
              </p>
              <p className="text-pk-muted mt-2">
                We&rsquo;ll review your request and get back to you.
              </p>
            </div>
          ) : (
            <div className="pk-fc-form">
              <FormEngineRenderer
                schema={providerRequestSchema}
                onSubmit={handleSubmit}
                theme={{
                  layout: { sectionLayout: 'flat', progressPosition: 'none' },
                }}
              />
            </div>
          )}
        </div>

        {/* Footer attribution */}
        <div className="px-6 pb-4 text-center">
          <span className="text-pk-subtle" style={{ fontSize: 'var(--text-xs)' }}>
            Powered by{' '}
            <a
              href="https://fieldcraft.squaredr.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pk-link hover:text-pk-link-hover"
            >
              FieldCraft
            </a>
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
