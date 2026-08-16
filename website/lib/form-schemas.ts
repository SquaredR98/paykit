import type { FormEngineSchema } from '@squaredr/fieldcraft-core';

export const providerRequestSchema: FormEngineSchema = {
  id: 'provider-request',
  version: '1.0.0',
  title: 'Request a provider',
  description: 'Tell us which payment provider you need and we\'ll prioritize it.',
  settings: {
    displayMode: 'classic',
  },
  sections: [
    {
      id: 'details',
      title: 'Provider details',
      questions: [
        {
          id: 'provider_name',
          type: 'short_text',
          label: 'Provider name',
          placeholder: 'e.g. Adyen, Square, Mollie',
          required: true,
        },
        {
          id: 'use_case',
          type: 'long_text',
          label: 'What\'s your use case?',
          placeholder: 'Tell us how you plan to use this provider…',
          required: true,
        },
        {
          id: 'email',
          type: 'email',
          label: 'Your email',
          placeholder: 'you@company.com',
          required: true,
        },
        {
          id: 'priority',
          type: 'dropdown',
          label: 'How urgent is this?',
          required: false,
          options: [
            { label: 'Nice to have', value: 'nice_to_have' },
            { label: 'Important', value: 'important' },
            { label: 'Blocking', value: 'blocking' },
          ],
        },
      ],
    },
  ],
  submitAction: { type: 'callback' },
  onComplete: { type: 'message', message: 'Thanks! We\'ll review your request and get back to you.' },
};

export const contactSchema: FormEngineSchema = {
  id: 'contact',
  version: '1.0.0',
  title: 'Contact us',
  description: 'Have a question, bug report, or partnership inquiry? Drop us a line.',
  settings: {
    displayMode: 'classic',
  },
  sections: [
    {
      id: 'contact-info',
      title: 'Your details',
      questions: [
        {
          id: 'name',
          type: 'short_text',
          label: 'Name',
          placeholder: 'Jane Doe',
          required: true,
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email',
          placeholder: 'you@company.com',
          required: true,
        },
        {
          id: 'subject',
          type: 'dropdown',
          label: 'Subject',
          required: true,
          options: [
            { label: 'General inquiry', value: 'general' },
            { label: 'Bug report', value: 'bug' },
            { label: 'Feature request', value: 'feature' },
            { label: 'Partnership', value: 'partnership' },
          ],
        },
        {
          id: 'message',
          type: 'long_text',
          label: 'Message',
          placeholder: 'Tell us what\'s on your mind…',
          required: true,
        },
        {
          id: 'newsletter',
          type: 'boolean',
          label: 'Subscribe to PayKit updates',
          required: false,
        },
      ],
    },
  ],
  submitAction: { type: 'callback' },
  onComplete: { type: 'message', message: 'Message sent! We\'ll get back to you shortly.' },
};
