'use server';

import { Resend } from 'resend';

type ContactPayload = {
  form: 'provider-request' | 'contact';
  data: Record<string, unknown>;
};

export async function submitContactForm(
  payload: ContactPayload
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL || 'hello@squaredr.tech';

  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured.' };
  }

  const resend = new Resend(apiKey);

  const isProviderRequest = payload.form === 'provider-request';
  const subject = isProviderRequest
    ? `[PayKit] Provider request: ${payload.data.provider_name ?? 'Unknown'}`
    : `[PayKit] Contact: ${payload.data.subject ?? 'General inquiry'}`;

  const rows = Object.entries(payload.data)
    .map(([key, value]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600">${key}</td><td style="padding:4px 0">${String(value ?? '')}</td></tr>`)
    .join('');

  const html = `
    <h2>${isProviderRequest ? 'New Provider Request' : 'New Contact Message'}</h2>
    <table style="border-collapse:collapse;font-family:monospace;font-size:14px">
      ${rows}
    </table>
    <p style="margin-top:24px;color:#666;font-size:12px">
      Sent from paykit.squaredr.tech via FieldCraft
    </p>
  `;

  try {
    await resend.emails.send({
      from: 'PayKit <noreply@squaredr.tech>',
      to: contactEmail,
      subject,
      html,
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to send email:', err);
    return {
      success: false,
      error: 'Failed to send message. Please try again.',
    };
  }
}
