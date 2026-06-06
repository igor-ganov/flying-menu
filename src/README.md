# `src` — module map

Functional-core / imperative-shell. The pure core has no DOM or Lit dependency and is
unit-tested in `../test`; the shell wires it to the browser.

```
flying-menu.ts          Lit element (imperative shell): measure → call core → apply, ARIA, events
flying-menu.styles.ts   Positioning/visibility/motion only — no colours, borders, sizes (headless)
test-ids.ts             Part names, menu id, event names, tag name (shared with E2E)

core/                   Pure, framework-free, unit-tested
  types.ts              Corner, Point, Size, Rect, Viewport
  constants.ts          Default margin / gap / drag-threshold / storage-key / corner
  snap-to-corner.ts     (point, viewport) → nearest Corner
  corner-position.ts    (corner, measured Size, margin, viewport) → resting top-left Point
  drag-machine.ts       Pure pointer-drag reducer: idle/onDown/onMove/onUp/wasTap
  menu-position.ts      (corner, triggerRect, menuSize, gap, margin, viewport) → clamped menu Point
  persist-corner.ts     parse/load/save over an injected StoragePort (+ localStoragePort)

a11y/
  focus.ts              firstFocusable / firstFocusableAmong / isFocusable
```

## Why a pure core

The geometry (corner snapping, content-driven offsets, viewport clamping) and the
tap-vs-drag decision are the parts most likely to regress and the hardest to cover from
a browser. Keeping them pure makes every viewport/size permutation a fast unit test; the
shell then only needs E2E coverage for wiring, ARIA, focus and events.

## Key invariants

- **Geometry is measured, never assumed.** `corner-position` and `menu-position` take a
  measured `Size`/`Rect`, so behaviour is independent of trigger/menu content.
- **Wrappers use `width/height: max-content`** so a fixed box near a viewport edge never
  collapses via shrink-to-fit and corrupts a measurement.
- **No `null`, no `as`, no `any`.** Corners are a closed union; `parseCorner` narrows via
  a type predicate; storage failures degrade to the default corner.
