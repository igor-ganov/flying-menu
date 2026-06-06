import { css } from 'lit'

/**
 * Headless styling: only positioning, layering, visibility and motion. No
 * colours, borders, radii, or sizes — appearance comes from slotted content
 * and consumer CSS via `::part(trigger)` / `::part(menu)`.
 */
export const styles = css`
  :host {
    position: static;
    display: contents;
  }

  [part='trigger'] {
    position: fixed;
    /* max-content keeps the box at its true content width regardless of where it
       is positioned, so geometry never collapses via shrink-to-fit near an edge. */
    width: max-content;
    height: max-content;
    z-index: var(--flying-menu-z-trigger, 1000);
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: left var(--flying-menu-transition, 200ms ease),
      top var(--flying-menu-transition, 200ms ease);
  }

  [part='trigger'][data-dragging] {
    transition: none;
    cursor: grabbing;
  }

  /* Menu motion is the "pop-in" only — position never transitions, so the menu
     never slides from its previous corner. Overridable from outside via
     ::part(menu) and the --flying-menu-transition timing variable. */
  [part='menu'] {
    position: fixed;
    width: max-content;
    height: max-content;
    z-index: var(--flying-menu-z-menu, 999);
    display: none;
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
    transition: opacity var(--flying-menu-transition, 200ms ease),
      transform var(--flying-menu-transition, 200ms ease),
      overlay var(--flying-menu-transition, 200ms ease) allow-discrete,
      display var(--flying-menu-transition, 200ms ease) allow-discrete;
  }

  [part='menu'][data-open] {
    display: block;
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  /* Entry keyframe: animate up from the closed visual state every open,
     even though the menu starts at display:none. */
  @starting-style {
    [part='menu'][data-open] {
      opacity: 0;
      transform: translateY(8px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    [part='trigger'],
    [part='menu'] {
      transition: none;
    }
  }
`
