import { css } from 'lit'

/** The host takes no space; the wrappers are fixed-positioned. */
export const hostStyles = css`
  :host {
    position: static;
    display: contents;
  }
`
