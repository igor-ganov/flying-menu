import { css } from 'lit'

/** Honour `prefers-reduced-motion` by removing all wrapper transitions. */
export const reducedMotionStyles = css`
  @media (prefers-reduced-motion: reduce) {
    [part='trigger'],
    [part='menu'] {
      transition: none;
    }
  }
`
