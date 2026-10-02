import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { DocsToc } from '@/components/docs/DocsToc';
import { DocsPagination } from '@/components/docs/DocsPagination';
import { getDocPagination } from '@/components/docs/docs-nav';
import { DocsCodeBlock } from '@/components/docs/DocsCodeBlock';
import { MermaidDiagram } from '@/components/workbench/MermaidDiagram';
import { ArchitectureDiagram } from '@/components/docs/ArchitectureDiagram';
import '@/components/docs/docs-prose.css';

function TableWrapper(props: React.ComponentProps<'table'>) {
  return (
    <div className="pk-docs__table-wrap">
      <table {...props} />
    </div>
  );
}

const mdxComponents = {
  pre: DocsCodeBlock,
  table: TableWrapper,
  MermaidDiagram,
  ArchitectureDiagram,
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is PayKit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PayKit is a unified, type-safe payment SDK for Node.js and the browser. It provides a single API that works across multiple payment providers (Stripe, Razorpay, PayPal, and more). You write your payment logic once and swap providers by changing a single import.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is PayKit free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The entire SDK is MIT-licensed and free — the core package, all provider adapters (Stripe, Razorpay, PayPal), React components, and the vanilla JS SDK. No paid tiers, no license keys.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which providers are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Currently: Stripe, Razorpay, and PayPal. You can also build a custom adapter using the PaymentAdapter interface.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use multiple providers at the same time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Use the PaymentRouter to route transactions to different providers based on currency, region, or custom rules.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does PayKit handle PCI compliance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PayKit does not handle or store card numbers. Card data is tokenised by the provider\'s own SDK (e.g. Stripe Elements, Razorpay Checkout). Your PCI scope is the same as if you used the provider SDK directly.',
      },
    },
    {
      '@type': 'Question',
      name: 'How big is the bundle?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The core package is under 11 KB minified (ESM). Each adapter adds 15-16 KB. Client adapters are 4-6 KB. Tree-shaking ensures you only bundle what you import.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which frameworks are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PayKit is framework-agnostic on the server side. It works with Next.js, Express, Fastify, Hono, Koa, and any other Node.js framework. On the frontend, React components and a headless vanilla JS SDK are provided.',
      },
    },
  ],
};

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const currentPath = '/' + ['docs', ...(params.slug ?? [])].join('/');
  const { prev, next } = getDocPagination(currentPath);
  const isFaq = params.slug?.join('/') === 'reference/faq';

  return (
    <>
      {isFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <article className="pk-docs__article">
        <div className="pk-docs__prose">
          <span className="pk-eyebrow">{page.data.title}</span>
          <h1>{page.data.title}</h1>
          {page.data.description && <p>{page.data.description}</p>}
          <MDX components={mdxComponents} />
        </div>
        <DocsPagination prev={prev} next={next} />
      </article>
      <DocsToc toc={page.data.toc} />
    </>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const slugPath = params.slug?.join('/') ?? '';

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: `/docs/${slugPath}` },
  };
}
