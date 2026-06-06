# Flying Menu — Requirements

## Overview

`<flying-menu>` is a **headless** Lit web component that extracts the draggable
floating-menu logic currently duplicated in `admin-website` (`useDraggableFab` +
`MobileMenu`) into a single framework-agnostic custom element.

It exposes two slots — a **trigger** (the visible button) and a **menu** (the
popup body) — and owns only *behaviour*: dragging the trigger to any screen
corner, snapping it to the nearest corner on release, persisting that corner, and
opening the menu with correct, edge-aware offsets **regardless of the size or
content of either slot**. It renders no visual chrome of its own (no background,
border, button shape); all appearance comes from slotted content and consumer CSS.

The component must be **maximally accessible** (keyboard operable, screen-reader
correct, motion-respecting) and **fully covered by unit tests (logic) and E2E
tests (real browser interaction)**.

### Goals
- One reusable element shared by `admin-website` and `public-website`.
- Position math driven by the trigger's **measured** geometry, not hard-coded sizes.
- Behaviour independent of slotted content.

### Non-goals
- Providing visual styling for the button or menu.
- Owning navigation/route logic (consumer closes the menu via API/events).
- Multi-level / nested submenus.

## Glossary
- **Trigger** — the slotted element the user drags and activates to toggle the menu.
- **Menu** — the slotted popup content shown when open.
- **Corner** — one of `top-left | top-right | bottom-left | bottom-right`.
- **Snap** — moving the trigger to the nearest corner when a drag ends.
- **Tap** — a pointer interaction whose total movement stays under the drag threshold.

---

## User Stories & Acceptance Criteria

### US-1 — Toggle the menu by activating the trigger
As a user, I want to open and close the menu by tapping/clicking the trigger.

- AC-1.1 — WHEN the trigger receives a tap (pointer movement below the drag
  threshold) WHILE the menu is closed THE SYSTEM SHALL open the menu.
- AC-1.2 — WHEN the trigger receives a tap WHILE the menu is open THE SYSTEM SHALL
  close the menu.
- AC-1.3 — WHEN a drag ends having exceeded the drag threshold THE SYSTEM SHALL NOT
  toggle the menu (the gesture was a move, not a tap).
- AC-1.4 — WHEN the menu open state changes THE SYSTEM SHALL emit a cancelable
  `flying-menu-toggle` event carrying the new `open` boolean.

### US-2 — Drag the trigger to any corner
As a user, I want to drag the trigger to whichever screen corner suits me.

- AC-2.1 — WHILE a pointer drag is in progress THE SYSTEM SHALL move the trigger to
  follow the pointer, with no position transition.
- AC-2.2 — WHEN a drag ends THE SYSTEM SHALL snap the trigger to the nearest corner,
  determined by which screen half (horizontal and vertical) the pointer released in.
- AC-2.3 — THE SYSTEM SHALL keep the trigger fully within the viewport at its resting
  corner, inset by a configurable margin.
- AC-2.4 — WHEN the corner changes THE SYSTEM SHALL emit a `flying-menu-corner`
  event carrying the new corner.
- AC-2.5 — THE SYSTEM SHALL distinguish tap from drag using a configurable pixel
  threshold (default 10px total Manhattan movement).
- AC-2.6 — WHEN the viewport resizes THE SYSTEM SHALL re-anchor the trigger to its
  current corner, whether the menu is open or closed (and re-anchor the menu while open).

### US-3 — Drag works regardless of trigger content
As a developer, I want the drag handler correct no matter what I put in the trigger slot.

- AC-3.1 — THE SYSTEM SHALL derive the trigger's position and size from its measured
  bounding box, not from any fixed dimension constant.
- AC-3.2 — WHERE the slotted trigger is of arbitrary size THE SYSTEM SHALL still snap
  it inside the viewport with the configured margin on every edge.

### US-4 — Menu opens with correct edge-aware offsets
As a user, I want the menu to appear in a sensible place relative to the trigger's corner,
never clipped by the screen edge, whatever the menu's size.

- AC-4.1 — WHEN the menu opens WHILE the trigger rests in a `*-right` corner THE
  SYSTEM SHALL align the menu's right edge to the trigger's right edge.
- AC-4.2 — WHEN the menu opens WHILE the trigger rests in a `*-left` corner THE
  SYSTEM SHALL align the menu's left edge to the trigger's left edge.
- AC-4.3 — WHEN the menu opens WHILE the trigger rests in a `bottom-*` corner THE
  SYSTEM SHALL place the menu **above** the trigger, separated by a configurable gap.
- AC-4.4 — WHEN the menu opens WHILE the trigger rests in a `top-*` corner THE
  SYSTEM SHALL place the menu **below** the trigger, separated by the gap.
- AC-4.5 — THE SYSTEM SHALL compute menu offsets from the trigger's measured geometry
  so the result is correct for any menu content size (IF the menu would overflow the
  viewport THEN THE SYSTEM SHALL clamp it within the viewport margin).
- AC-4.6 — WHEN the corner changes WHILE the menu is open THE SYSTEM SHALL
  re-anchor the menu to the new corner.

### US-5 — Position persists across sessions
As a user, I want the trigger to reappear in the corner I last left it.

- AC-5.1 — WHEN a drag snaps the trigger to a corner THE SYSTEM SHALL persist that
  corner to `localStorage`.
- AC-5.2 — WHEN the component initializes THE SYSTEM SHALL restore the persisted
  corner, defaulting to `bottom-right` when none is stored or the value is invalid.
- AC-5.3 — THE SYSTEM SHALL use a configurable storage key (default `flying-menu-corner`).
- AC-5.4 — IF `localStorage` is unavailable THEN THE SYSTEM SHALL fall back to the
  default corner without throwing.

### US-6 — Accessible operation
As a keyboard and screen-reader user, I want full, correct access to the menu.

- AC-6.1 — THE SYSTEM SHALL expose the trigger with `aria-haspopup`, `aria-expanded`
  reflecting open state, and `aria-controls` referencing the menu element id.
- AC-6.2 — WHEN the menu opens THE SYSTEM SHALL move focus to the first focusable
  element inside the menu (or the menu container if none).
- AC-6.2a — WHILE the menu is open THE SYSTEM SHALL cycle Tab / Shift+Tab focus
  through the menu's focusable elements (wrapping at the ends), independent of the
  browser's native sequential focus through slotted shadow content. (Arrow-key
  navigation remains the consumer's responsibility.)
- AC-6.3 — WHEN the user presses `Escape` WHILE the menu is open THE SYSTEM SHALL
  close the menu and return focus to the trigger.
- AC-6.4 — WHEN a pointer/focus interaction occurs outside both slots WHILE the menu
  is open THE SYSTEM SHALL close the menu.
- AC-6.5 — THE SYSTEM SHALL make the trigger keyboard-operable: `Enter`/`Space`
  toggles the menu.
- AC-6.6 — WHERE the user has `prefers-reduced-motion: reduce` THE SYSTEM SHALL omit
  open/move transitions.
- AC-6.7 — THE SYSTEM SHALL pass an automated accessibility audit (axe) with no
  critical or serious violations in both open and closed states.

### US-7 — Headless, framework-agnostic integration
As a developer, I want to drop the element into any framework with my own markup.

- AC-7.1 — THE SYSTEM SHALL render only slotted content plus a positioning wrapper;
  it SHALL NOT impose button shape, colours, borders, or backgrounds.
- AC-7.2 — THE SYSTEM SHALL expose `open`, `corner`, `margin`, `gap`,
  `drag-threshold`, and `storage-key` as reactive attributes/properties.
- AC-7.3 — THE SYSTEM SHALL expose imperative `openMenu()`, `closeMenu()`, `toggle()`
  methods. (Named `openMenu`/`closeMenu` because `open` is a reflected boolean
  attribute — see design.md.)
- AC-7.4 — THE SYSTEM SHALL expose CSS `::part()` hooks for the trigger wrapper and
  menu wrapper so consumers can position/animate without piercing internals.

---

## Traceability
Each acceptance criterion above maps to a design section (design.md) and at least one
test (unit or E2E) named in tasks.md. No criterion may ship without a verifying test.
