import { BlogHeader } from '../BlogHeader';
import { SubscribeCta } from '../SubscribeCta';
import { Breadcrumbs } from './Breadcrumbs';
import { ArticleToc } from './ArticleToc';
import { AuthorBio } from './AuthorBio';
import { RelatedPosts } from './RelatedPosts';
import { Callout } from './Callout';
import { CodeFigure } from './CodeFigure';
import { ArchitectureDiagram } from '@/components/docs/ArchitectureDiagram';
import { CopyButton } from './CodeFigure/CopyButton';
import { ShareButton } from './ShareButton';
import { ReadingProgress } from './ReadingProgress';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import { createCssVariablesTheme } from 'shiki/core';
import type { BlogPost } from '@/lib/blog';
import { getAllBlogPosts, extractTocItems } from '@/lib/blog';
import { getAuthor } from '@/lib/authors';
import Link from 'next/link';
import type { ReactNode, ComponentPropsWithoutRef } from 'react';
import { Children, isValidElement } from 'react';
import './styles.css';

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!isValidElement(node)) return '';
  const { children } = node.props as { children?: ReactNode };
  return Children.toArray(children).map(extractText).join('');
}

function MdxFigure(props: ComponentPropsWithoutRef<'figure'>) {
  const isCodeFigure = 'data-rehype-pretty-code-figure' in props;
  if (!isCodeFigure) return <figure {...props} />;

  const kids = Children.toArray(props.children);

  // Extract title from <figcaption data-rehype-pretty-code-title>
  const titleEl = kids.find(
    (c) => isValidElement(c) && (c.props as Record<string, unknown>)['data-rehype-pretty-code-title'] !== undefined,
  );
  const title = titleEl && isValidElement(titleEl) ? extractText(titleEl) : '';

  // Extract <pre> element
  const preEl = kids.find(
    (c) => isValidElement(c) && (c as React.ReactElement).type === 'pre',
  );

  // Extract language from pre's data-language attribute
  const lang = preEl && isValidElement(preEl)
    ? (preEl.props as Record<string, unknown>)['data-language'] as string || ''
    : '';

  const rawText = preEl ? extractText(preEl) : '';
  const label = title || lang;

  return (
    <figure className="pk-prose-figure">
      <div className="pk-term">
        <div className="pk-term__bar">
          <span className="pk-term__file">{label}</span>
          <span className="pk-term__meta">
            <CopyButton text={rawText} />
          </span>
        </div>
        {preEl}
      </div>
    </figure>
  );
}

const mdxComponents = {
  Callout,
  CodeFigure,
  ArchitectureDiagram,
  figure: MdxFigure,
};

interface BlogPostViewProps {
  post: BlogPost;
}

export async function BlogPostView({ post }: BlogPostViewProps) {
  // Get related posts (same tag, excluding current post; fall back to recent)
  const allPosts = await getAllBlogPosts();
  const otherPosts = allPosts.filter((p) => p.slug !== post.slug);
  const tagMatched = otherPosts.filter((p) => p.tags.some((tag) => post.tags.includes(tag)));
  const relatedPosts = (tagMatched.length > 0 ? tagMatched : otherPosts).slice(0, 3);

  const tocItems = extractTocItems(post.content);

  const author = post.author || getAuthor('ravi-ranjan');

  return (
    <div className="">
      <ReadingProgress />
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'PayKit', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.tags[0] || 'Article' },
        ]}
      />

      {/* Article header */}
      <BlogHeader post={post} />

      {/* Split layout: prose content + sticky TOC */}
      <div className="pk-split-article">
        <div className="pk-body">
          <article className="pk-prose">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeSlug,
                    [
                      rehypePrettyCode,
                      {
                        theme: createCssVariablesTheme({
                          name: 'paykit',
                          variablePrefix: '--pk-code-',
                          variableDefaults: {},
                        }),
                        keepBackground: false,
                      },
                    ],
                  ],
                },
              }}
            />
          </article>
        </div>

        <aside className="pk-rail">
          <div className="pk-railstick">
            <div className="pk-railblk">
              <span className="pk-eyebrow">On this page</span>
              <ArticleToc items={tocItems} />
            </div>
            <div className="pk-railblk">
              <span className="pk-eyebrow">Share</span>
              <div className="pk-share">
                <ShareButton slug={post.slug} />
              </div>
              <span className="pk-rail__note">
                Discuss on{' '}
                <a href="https://github.com/SquaredR98/paykit/discussions" target="_blank" rel="noopener noreferrer">GitHub</a>
              </span>
            </div>
            <div className="pk-railblk">
              <span className="pk-eyebrow">Referenced</span>
              <Link href="/docs" className="pk-btn pk-btn--secondary pk-btn--sm">
                Webhooks API <span aria-hidden="true">→</span>
              </Link>
              <a
                href="https://github.com/SquaredR98/paykit"
                className="pk-btn pk-btn--secondary pk-btn--sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Event mapping matrix <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* Author bio */}
      {author && <AuthorBio author={author} />}

      {/* Related posts */}
      {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}

      {/* Subscribe CTA */}
      <SubscribeCta />
    </div>
  );
}
