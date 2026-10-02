import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the PayKit team — questions, bug reports, feature requests, and partnerships.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <section className="pk-blk pb-(--section-y)">
      <div className="pk-sechead pk-sechead--center">
        <span className="pk-eyebrow">Get in touch</span>
        <h2 className="pk-sec-title">Contact us</h2>
        <p className="pk-lede">
          Have a question, bug report, or partnership inquiry? Drop us a line
          and we&rsquo;ll get back to you.
        </p>
      </div>
      <div className="mx-auto px-(--space-10) pt-(--space-12) max-sm:px-(--space-6)" style={{ maxWidth: '640px' }}>
        <ContactForm />
      </div>
    </section>
  );
}
