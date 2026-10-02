import { highlight } from '@/lib/shiki';
import { Eyebrow, Section } from '@/components/ui';
import { CompareTabs } from './CompareTabs';
import { comparePairs, countLines } from './snippets';
import './styles.css';

/**
 * Before/after comparison of provider SDK code vs PayKit.
 *
 * This is the section that argues the product: the pitch is not "we support
 * many providers", it is "the branching you write for the second provider
 * disappears". So the panes show the same task twice, side by side.
 *
 * Highlighting runs here (server) because shiki is server-only; the tab state
 * lives in CompareTabs (client). Both panes for every tab are rendered up front
 * and toggled with `hidden`, so switching tabs needs no request.
 */
export async function Compare() {
  const panes = await Promise.all(
    comparePairs.map(async (pair) => ({
      id: pair.id,
      tabLabel: pair.tabLabel,
      filename: pair.filename,
      beforeHtml: await highlight(pair.before),
      afterHtml: await highlight(pair.after),
      beforeLines: countLines(pair.before),
      afterLines: countLines(pair.after),
    })),
  );

  return (
    <Section id="compare">
      <Eyebrow>Before / after</Eyebrow>
      <h2 className="pk-v2-section__title">Delete the provider branches.</h2>
      <p className="pk-v2-section__sub">
        The first integration is easy with any SDK. The cost shows up on the
        second one, when every call site grows a branch. That is the code PayKit
        removes.
      </p>

      <CompareTabs panes={panes} />
    </Section>
  );
}
