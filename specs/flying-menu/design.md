# Flying Menu — Design

Implements `requirements.md`. The component is built **functional-core / imperative-shell**:
all geometry and state-transition logic lives in pure, separately-tested functions; the Lit
element is a thin shell that measures the DOM, calls the pure core, and applies results.

## 1. Architecture overview

```
flying-menu/
  src/
    flying-menu.ts            # Lit element (imperative shell) — wiring only
    flying-menu.styles.ts     # static styles (positioning wrapper, parts, reduced-motion)
    test-ids.ts               # part names + test ids (shared by component & E2E)
    core/                     # pure functional core — no DOM, no Lit, unit-tested
      types.ts                # Corner, Point, Rect, Size, DragState, ...
      constants.ts            # DEFAULT_MARGIN, DEFAULT_GAP, DEFAULT_DRAG_THRESHOLD, ...
      snap-to-corner.ts       # (point, viewport) -> Corner                       [AC-2.2]
      corner-position.ts      # (corner, triggerSize, margin, viewport) -> Point  [AC-2.3, AC-3.2]
      drag-machine.ts         # pure pointer-drag reducer (down/move/up)          [US-1, US-2]
      menu-position.ts        # (corner, triggerRect, menuSize, gap, margin, vp)  [US-4]
                              #   -> { left, top } clamped to viewport
      persist-corner.ts       # pure parse/serialize + injected storage port      [US-5]
    a11y/
      focus.ts                # firstFocusable(root), focus helpers               [AC-6.2]
  test/                       # *.test.ts (Vitest, jsdom/happy-dom) for core/a11y
  e2e/                        # *.spec.ts (Playwright) + fixtures
  demo/                       # index.html demos (admin-like + public-like)
```

### Why functional core
- The original Vue code already separated `snapToCorner` / `cornerPosition` as pure fns with
  unit tests; we keep and extend that, dropping the Vue `ref` coupling.
- Pure geometry is trivially unit-testable across viewport/size permutations without a browser
  (satisfies "unit tests" for US-2/3/4/5); the shell is exercised by E2E (US-1/6/7).

## 2. Public API (US-7)

### Element: `<flying-menu>`
Attributes / properties (all reflected where sensible):

| Attribute        | Property        | Type      | Default               | Req         |
|------------------|-----------------|-----------|-----------------------|-------------|
| `open`           | `open`          | boolean   | `false`               | AC-7.2,1.1  |
| `corner`         | `corner`        | Corner    | restored / `bottom-right` | AC-7.2,5.2 |
| `margin`         | `margin`        | number    | `16`                  | AC-2.3      |
| `gap`            | `gap`           | number    | `8`                   | AC-4.3      |
| `drag-threshold` | `dragThreshold` | number    | `10`                  | AC-2.5      |
| `storage-key`    | `storageKey`    | string    | `flying-menu-corner`  | AC-5.3      |
| `no-persist`     | `noPersist`     | boolean   | `false`               | US-5 escape |

Methods: `openMenu()`, `closeMenu()`, `toggle()` (AC-7.3).
**Spec deviation (recorded):** the imperative open/close methods are named
`openMenu()`/`closeMenu()` rather than `open()`/`close()` because `open` is a
reflected boolean property/attribute (the idiomatic web-component pattern, cf.
`<dialog open>`); a class cannot expose both an `open` accessor and an `open()`
method. `toggle()` is unaffected.

Events (all `CustomEvent`, `bubbles`, `composed`):
- `flying-menu-toggle` — `detail: { open: boolean }`, **cancelable** (AC-1.4).
- `flying-menu-corner` — `detail: { corner: Corner }` (AC-2.4).

Slots:
- `trigger` — the activator. The component treats the slotted element as the button:
  positions its wrapper `position: fixed`, attaches pointer/keyboard handlers, and writes
  ARIA onto the wrapper (`role=button` only if the slotted root is not already a button).
- `menu` — popup content, shown only while `open`.

CSS parts (AC-7.4): `part="trigger"` (fixed-positioned wrapper), `part="menu"` (popup wrapper).
CSS custom props passthrough: `--flying-menu-z-trigger`, `--flying-menu-z-menu`.

## 3. Core modules (pure)

### 3.1 `types.ts`
```ts
export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export interface Point { readonly x: number; readonly y: number }
export interface Size  { readonly width: number; readonly height: number }
export interface Rect  extends Point, Size {}        // x,y = top-left in viewport coords
export interface Viewport { readonly width: number; readonly height: number }
```
No `null`, no `as`; corners are a closed union enabling exhaustive inference.

### 3.2 `snap-to-corner.ts` — AC-2.2
`snapToCorner(point: Point, vp: Viewport): Corner` — half-plane test on each axis
(`x > vp.width/2` → right, `y > vp.height/2` → bottom). Pure, ported verbatim from original
`snap-to-corner.ts`, retyped to `Point`/`Viewport`.

### 3.3 `corner-position.ts` — AC-2.3, AC-3.1, AC-3.2
`cornerPosition(corner, triggerSize: Size, margin, vp): Point` — resting top-left pixel
position of the trigger. Generalised from the original (which assumed a square `FAB_SIZE`)
to take a **measured `Size`**:
```
right  = vp.width  - triggerSize.width  - margin
bottom = vp.height - triggerSize.height - margin
```
This is the change that makes drag correct for any trigger content (US-3).

### 3.4 `drag-machine.ts` — US-1, US-2
A pure reducer over an opaque immutable state — no Vue refs, no DOM:
```ts
export interface DragState {
  readonly dragging: boolean
  readonly moved: boolean
  readonly start: Point        // pointer at down
  readonly origin: Point       // trigger top-left at down
  readonly current: Point      // trigger top-left now (while dragging)
}
export const idle: DragState
export const onDown  (s, { pointer: Point, origin: Point }): DragState
export const onMove  (s, { pointer: Point, threshold: number }): DragState  // sets moved, current
export const onUp    (s): DragState                                          // dragging=false
export const wasTap  (s): boolean                                            // !moved
```
`onMove` computes `current = origin + (pointer - start)` and flips `moved` once
`|dx|+|dy| > threshold` (Manhattan, matching original). Decision of *whether to toggle*
(AC-1.3) is `wasTap(stateAtUp)`; decision of *which corner* (AC-2.2) feeds `snapToCorner`
the release pointer in the shell.

### 3.5 `menu-position.ts` — US-4 (the core of "correct offsets regardless of content")
```ts
menuPosition(args: {
  corner: Corner
  triggerRect: Rect      // measured trigger box in viewport coords
  menuSize: Size         // measured menu box
  gap: number
  margin: number
  vp: Viewport
}): Point                // returns {x: left, y: top} for the menu wrapper (position: fixed)
```
Algorithm:
1. Horizontal: `*-right` → align right edges: `left = triggerRect.x + triggerRect.width - menuSize.width`.
   `*-left` → align left edges: `left = triggerRect.x`.
2. Vertical: `bottom-*` → above: `top = triggerRect.y - gap - menuSize.height`.
   `top-*` → below: `top = triggerRect.y + triggerRect.height + gap`.
3. **Clamp** both axes into `[margin, vp.size - menuSize - margin]` (AC-4.5) so arbitrary
   menu sizes never overflow; clamp is skipped on an axis when menu is larger than the
   available space (then pin to `margin`).

Returning absolute `{left, top}` (not the original's `right/bottom` switch) makes clamping
uniform and keeps the shell trivial; trade-off: we recompute on open/resize/corner-change
instead of relying on CSS anchoring. **Rejected alternative — CSS Anchor Positioning
(`anchor()`):** not yet baseline across our target browsers (Safari), and it cannot express
the tap-vs-drag measured clamp as cleanly; revisit later behind feature detection.

### 3.6 `persist-corner.ts` — US-5
Pure parse/guard plus an injected `StoragePort` so it is unit-testable and SSR/Storage-less safe:
```ts
export interface StoragePort {
  get(key: string): string | undefined
  set(key: string, value: string): void
}
export const parseCorner(raw: string | undefined): Corner | undefined  // type guard
export const loadCorner(port: StoragePort, key: string): Corner        // defaults bottom-right
export const saveCorner(port: StoragePort, key: string, c: Corner): void
export const localStoragePort(): StoragePort   // wraps globalThis.localStorage, try/catch -> undefined  (AC-5.4)
```

## 4. Imperative shell — `flying-menu.ts`

Lit `LitElement`, reactive props per §2. Responsibilities only:

1. **Render** (light DOM positioning via shadow wrappers):
   ```html
   <div part="trigger" style="position:fixed; left/top from cornerPosition or live drag">
     <slot name="trigger"></slot>
   </div>
   <div part="menu" id="fm-menu" role="presentation" ?hidden=${!open}
        style="position:fixed; left/top from menuPosition">
     <slot name="menu"></slot>
   </div>
   ```
   The menu wrapper carries no semantic role (consumer's slotted content owns role) but does
   carry the `id` referenced by the trigger's `aria-controls`.
2. **Measure**: read `triggerWrapper.getBoundingClientRect()` and `menuWrapper`'s size after
   render via `updated()` / a `ResizeObserver`, feeding the pure core. Viewport from
   `globalThis.innerWidth/innerHeight`.
3. **Pointer wiring** (on the trigger wrapper, `touch-action:none`, pointer capture):
   `pointerdown→drag-machine.onDown`, `pointermove→onMove` (writes live `current` to inline
   style, no transition — AC-2.1), `pointerup→onUp` then: if `wasTap` → `toggle()`; else
   `snapToCorner(releasePoint)` → set `corner`, emit `flying-menu-corner`, `saveCorner`.
4. **Keyboard** (AC-6.5): `keydown` Enter/Space on trigger → `toggle()`.
5. **Open lifecycle**:
   - `toggle/open/close` fire cancelable `flying-menu-toggle`; if not prevented, set `open`.
   - On open: recompute menu position, reflect `aria-expanded=true`, move focus to
     `firstFocusable(menuWrapper)` (AC-6.2).
   - On close: `aria-expanded=false`, restore focus to trigger (AC-6.3 when via Escape).
6. **Global listeners**: `keydown Escape` (AC-6.3) and outside `pointerdown` (AC-6.4) are
   added on open / removed on close. The `resize` listener is **always-on** (added in
   `connectedCallback`, removed in `disconnectedCallback`) so the trigger re-anchors to its
   corner on every viewport change even while closed — otherwise it drifts (AC-2.6, AC-4.5).
7. **Reduced motion** (AC-6.6): handled in CSS via `@media (prefers-reduced-motion: reduce)`
   zeroing transitions on the parts; no JS branch.

### State ownership
- `open`, `corner` are Lit reactive properties (single source of truth).
- Drag uses a private `DragState` field updated through the pure reducer; live position is
  written to the trigger wrapper's inline style during drag and cleared (back to
  `cornerPosition`) on `corner` change so Lit re-render and drag never fight.

## 5. Accessibility design (US-6)
- Trigger wrapper: `aria-haspopup="menu"`, `aria-controls="fm-menu"`,
  `aria-expanded` bound to `open`. If the slotted trigger root is itself a `<button>`, we set
  ARIA on that element instead of duplicating `role=button`; otherwise the wrapper gets
  `role="button"` + `tabindex="0"` (detected via slot `assignedElements`).
- Focus order: open → first focusable in menu; Escape → close + focus trigger; outside
  interaction → close (focus left as-is per AC-6.4).
- Motion respects `prefers-reduced-motion`.
- axe audit in E2E for open & closed states (AC-6.7).
- Live-region/announcement: not required; native focus move announces the menu.

### Post-review refinements (recorded)
Two issues surfaced during demo review with motion enabled (E2E ran under
`reducedMotion: reduce`, which masked both):
1. **Trigger must re-anchor on every gesture end.** A tap or a release that snaps to the
   *same* corner produces no reactive `corner` change, so `updated()` never repositions —
   the trigger stuck at the sub-threshold drag offset. Fix: `_onPointerUp` calls
   `_positionTrigger()` on the tap path and when the snapped corner equals the current one;
   only a genuine corner change defers to `updated()`. (US-1/US-2.)
2. **Menu must anchor to the trigger's *resting* rect, not its live box.** While the trigger
   animates between corners (CSS `left/top` transition), its `getBoundingClientRect()` is
   mid-flight, so a menu opened right after a corner change anchored to the old spot and
   slid over. Fix: `_positionMenu` builds the trigger rect from `cornerPosition(corner,
   measuredSize, …)` (logical anchor) instead of the live box. The menu wrapper also drops
   any `left/top` transition, so position is never animated — only the pop-in is. (US-4.)
   A host `:state(open)` custom state (via `ElementInternals`) lets consumers drive
   open/close animation from outside; entry uses `@starting-style` + `allow-discrete`.

## 6. Styling (`flying-menu.styles.ts`)
- `:host { position: static; }` — the element itself takes no space; wrappers are `fixed`.
- `[part=trigger]`, `[part=menu]` get `position: fixed; z-index` from custom props; transition
  on `left/top/opacity/transform` except under reduced-motion.
- Menu hidden state: `opacity:0; transform:translateY(8px); pointer-events:none` →
  visible: `opacity:1; transform:none; pointer-events:auto` (ported from `overlay-style.ts`),
  driven by `[part=menu][data-open]`.
- No colours, borders, radii, sizes — headless (AC-7.1).

## 7. Test strategy (feeds tasks.md)
- **Unit (Vitest)**: `snap-to-corner`, `corner-position` (incl. non-square sizes — US-3),
  `drag-machine` (tap vs drag, threshold, current calc), `menu-position` (all 4 corners +
  clamp/overflow — US-4), `persist-corner` (parse/guard/default/storage-failure — US-5),
  `focus.firstFocusable`.
- **E2E (Playwright)**, against `demo/` served by Vite: tap toggles (AC-1.1/1.2); drag past
  threshold snaps + no toggle (AC-1.3/2.2); drag with a large trigger stays in viewport
  (US-3); menu anchors correctly per corner and never clips with a tall menu (US-4);
  persistence across reload (US-5); keyboard Enter/Space/Escape + focus move + outside-click
  (US-6); axe scan open & closed (AC-6.7). Test ids/parts from `test-ids.ts`. **No timeouts** —
  wait on events (`flying-menu-toggle`, `flying-menu-corner`), DOM state, and
  `expect(...).toBe...` polling only.

## 8. Traceability matrix (AC → module → test)
| AC        | Module(s)                          | Test(s)                                  |
|-----------|------------------------------------|------------------------------------------|
| 1.1–1.3   | drag-machine, shell                | drag-machine.test, e2e toggle/drag       |
| 1.4       | shell                              | e2e toggle event                         |
| 2.1       | shell                              | e2e drag-live                            |
| 2.2       | snap-to-corner                     | snap-to-corner.test, e2e snap            |
| 2.3,3.1,3.2| corner-position                   | corner-position.test (non-square), e2e   |
| 2.4       | shell                              | e2e corner event                         |
| 2.5       | drag-machine, constants            | drag-machine.test                        |
| 4.1–4.6   | menu-position                      | menu-position.test, e2e anchor/clamp     |
| 5.1–5.4   | persist-corner                     | persist-corner.test, e2e reload          |
| 6.1       | shell                              | e2e aria                                 |
| 6.2,6.3   | a11y/focus, shell                  | focus.test, e2e keyboard                 |
| 6.4       | shell                              | e2e outside-click                        |
| 6.5       | shell                              | e2e keyboard                             |
| 6.6       | styles                             | e2e reduced-motion (computed style)      |
| 6.7       | all                                | e2e axe                                  |
| 7.1–7.4   | shell, styles                      | e2e parts/api                            |
