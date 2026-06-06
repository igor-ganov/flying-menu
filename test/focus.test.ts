import { describe, expect, it } from 'vitest'
import { firstFocusable, firstFocusableAmong } from '../src/a11y/focus'

const html = (markup: string): HTMLElement => {
  const host = document.createElement('div')
  host.innerHTML = markup
  return host
}

describe('firstFocusable', () => {
  it('finds the first tabbable element', () => {
    const root = html('<span>x</span><a href="#">a</a><button>b</button>')
    expect(firstFocusable(root)?.tagName).toBe('A')
  })

  it('skips disabled and tabindex=-1 elements', () => {
    const root = html('<button disabled>a</button><input tabindex="-1"><button id="ok">b</button>')
    expect(firstFocusable(root)?.id).toBe('ok')
  })

  it('returns undefined when nothing is focusable', () => {
    const root = html('<span>x</span><p>y</p>')
    expect(firstFocusable(root)).toBeUndefined()
  })

  it('honours an explicit positive tabindex on a normally non-focusable element', () => {
    const root = html('<div tabindex="0" id="d">d</div>')
    expect(firstFocusable(root)?.id).toBe('d')
  })
})

describe('firstFocusableAmong (slotted roots)', () => {
  const els = (markup: string): Element[] => {
    const host = document.createElement('div')
    host.innerHTML = markup
    return [...host.children]
  }

  it('finds a focusable inside the first root', () => {
    const roots = els('<nav><a href="#a" id="link">a</a></nav>')
    expect(firstFocusableAmong(roots)?.id).toBe('link')
  })

  it('treats a root that is itself focusable as the target', () => {
    const roots = els('<button id="b">b</button>')
    expect(firstFocusableAmong(roots)?.id).toBe('b')
  })

  it('returns undefined when no root contains a focusable', () => {
    const roots = els('<p>x</p><span>y</span>')
    expect(firstFocusableAmong(roots)).toBeUndefined()
  })
})
