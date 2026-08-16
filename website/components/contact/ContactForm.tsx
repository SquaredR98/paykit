'use client';

import { useState } from 'react';
import { FormEngineRenderer } from '@squaredr/fieldcraft-react';
import type { FormResponse } from '@squaredr/fieldcraft-core';
import { contactSchema } from '@/lib/form-schemas';
import { submitContactForm } from '@/app/actions/contact';
import '@/lib/fieldcraft-theme.css';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSubmit(response: FormResponse) {
    const result = await submitContactForm({
      form: 'contact',
      data: response.values,
    });
    setStatus(result.success ? 'success' : 'error');
  }

  if (status === 'success') {
    return (
      <div className="border border-pk-border bg-pk-card p-10 text-center">
        <p className="text-pk-strong font-medium" style={{ fontSize: 'var(--text-xl)' }}>
          Message sent
        </p>
        <p className="text-pk-muted mt-2">
          We&rsquo;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <div>
      {status === 'error' && (
        <div className="border border-pk-border bg-pk-card p-4 mb-6" style={{ borderColor: 'var(--bad-400)' }}>
          <p className="text-pk-body">
            Something went wrong. Please try again.
          </p>
        </div>
      )}
      <div className="pk-fc-form">
        <FormEngineRenderer
          schema={contactSchema}
          onSubmit={handleSubmit}
          theme={{
            layout: { sectionLayout: 'flat', progressPosition: 'none' },
          }}
        />
      </div>
      <div className="mt-6 text-center">
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
  );
}
