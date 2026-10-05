import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { NavPill, type NavLink } from './NavPill';
import { MobileNav } from './MobileNav';
import { HeaderShell } from './HeaderShell';
import './styles.css';

/**
 * The header chrome, shared by every route group: sticky bar, logo lockup,
 * centred nav pill, mobile panel, theme toggle, and a slot for one action.
 *
 * It does not know what section of the site it is on. Each route group owns a
 * header that supplies its own `links` and `action` — see
 * components/shell/MarketingHeader and components/shell/DocsHeader. That split
 * is the whole point of having (marketing) and docs as separate groups: the
 * layout picks the header, rather than one header branching at runtime.
 *
 * `spy` turns on scroll-spy for `#anchor` links. Docs have none, so they pass
 * false and skip the observer.
 */
export function HeaderFrame({
  links,
  action,
  spy = false,
}: {
  links: NavLink[];
  action?: React.ReactNode;
  spy?: boolean;
}) {
  return (
    <HeaderShell className="pk-v2-header">
      {/*
        Same wrap and inner column as the page content. The header must share a
        left edge with the first line of text beneath it, or the logo floats
        away from the page it belongs to.
      */}
      <div className="pk-v2-wrap">
        <div className="pk-v2-inner pk-v2-header__inner">
          <div className="pk-v2-header__side">
            <Link href="/" className="pk-v2-lockup">
              <Image src="/v2/mark.svg" width={30} height={30} alt="" priority />
              <b>
                Pay<span>Kit</span>
              </b>
            </Link>
          </div>

          <NavPill links={links} spy={spy} />
          <MobileNav links={links} />

          <div className="pk-v2-header__side pk-v2-header__side--end">
            <ThemeToggle />
            {action}
          </div>
        </div>
      </div>
    </HeaderShell>
  );
}
