import { Blobs } from './Blobs';
import './styles.css';

/**
 * The fixed page background: gradient, three animated blobs, and the grid tile.
 *
 * Sits at z-index -2, behind the glass panel (-1). Everything here is
 * decorative, so it is hidden from assistive tech.
 */
export function Background() {
  return (
    <div className="pk-v2-bg" aria-hidden="true">
      <Blobs />
      <div className="pk-v2-bg__grid" />
    </div>
  );
}
