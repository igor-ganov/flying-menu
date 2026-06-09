# flying-menu

[![npm version](https://img.shields.io/npm/v/@igor-ganov/flying-menu?logo=npm&color=cb3837)](https://www.npmjs.com/package/@igor-ganov/flying-menu)
[![npm downloads](https://img.shields.io/npm/dm/@igor-ganov/flying-menu?logo=npm&color=cb3837)](https://www.npmjs.com/package/@igor-ganov/flying-menu)
[![CI](https://github.com/igor-ganov/flying-menu/actions/workflows/ci.yml/badge.svg)](https://github.com/igor-ganov/flying-menu/actions/workflows/ci.yml)
[![E2E](https://github.com/igor-ganov/flying-menu/actions/workflows/e2e.yml/badge.svg)](https://github.com/igor-ganov/flying-menu/actions/workflows/e2e.yml)
[![codecov](https://codecov.io/gh/igor-ganov/flying-menu/graph/badge.svg)](https://codecov.io/gh/igor-ganov/flying-menu)
[![CodeQL](https://github.com/igor-ganov/flying-menu/actions/workflows/codeql.yml/badge.svg)](https://github.com/igor-ganov/flying-menu/actions/workflows/codeql.yml)
[![accessibility: axe-core](https://img.shields.io/badge/a11y-axe--core%20%C2%B7%20WCAG%202.1%20AA-success?logo=accessibility)](./e2e/a11y.spec.ts)
[![min+gzip size](https://img.shields.io/badge/min%2Bgzip-4.2%20kB-44cc11)](https://bundlephobia.com/package/@igor-ganov/flying-menu)
[![types included](https://img.shields.io/npm/types/@igor-ganov/flying-menu?logo=typescript)](https://www.npmjs.com/package/@igor-ganov/flying-menu)
[![license](https://img.shields.io/npm/l/@igor-ganov/flying-menu?color=blue)](./LICENSE)

A **headless**, framework-agnostic [Lit](https://lit.dev) web component for a
draggable, corner-snapping floating menu — the reusable extraction of the
`useDraggableFab` + `MobileMenu` logic from `admin-website` / `public-website`.

- 🧲 **Drag the trigger** to any screen corner; it snaps to the nearest one on release.
- 📐 **Edge-aware menu** that anchors to the trigger's corner with correct offsets —
  computed from measured geometry, so it's correct for **any** trigger/menu content size.
- 🎛 **Two slots, zero chrome** — you bring the button and the menu; the component owns
  only behaviour and positioning.
- ♿ **Accessible** — ARIA wired onto your control, focus management, `Escape`,
  outside-click, keyboard activation, `prefers-reduced-motion`.
- 💾 **Persists** the chosen corner to `localStorage`.

**▶ Live demo:** https://igor-ganov.github.io/flying-menu/

## Install

**npm**

```sh
npm install @igor-ganov/flying-menu
```

**pnpm**

```sh
pnpm add @igor-ganov/flying-menu
```

**yarn**

```sh
yarn add @igor-ganov/flying-menu
```

**bun**

```sh
bun add @igor-ganov/flying-menu
```

`lit` comes along as a dependency — no separate install. (It stays a single shared
copy if your app already uses Lit.)

## Usage

```html
<flying-menu>
  <button slot="trigger" aria-label="Open menu">☰</button>
  <nav slot="menu" aria-label="Primary">
    <a href="/home">Home</a>
    <a href="/docs">Docs</a>
  </nav>
</flying-menu>

<script type="module">
  import '@igor-ganov/flying-menu'
</script>
```

The component renders **no visual styling**. Style your slotted content normally and
position/animate the wrappers through CSS parts:

```css
flying-menu::part(menu) {
  background: Canvas;
  border: 1px solid CanvasText;
  border-radius: 12px;
  padding: 0.5rem;
  /* Tall menus: cap height and scroll instead of overflowing the viewport. */
  max-height: 80vh;
  overflow: auto;
}
```

## API

### Attributes / properties

| Attribute        | Property        | Type   | Default              | Purpose                              |
|------------------|-----------------|--------|----------------------|--------------------------------------|
| `open`           | `open`          | bool   | `false`              | Menu visibility (reflected)          |
| `corner`         | `corner`        | string | persisted / `bottom-right` | Resting corner (reflected)     |
| `margin`         | `margin`        | number | `16`                 | Viewport edge inset (px)             |
| `gap`            | `gap`           | number | `8`                  | Trigger↔menu gap (px)                |
| `drag-threshold` | `dragThreshold` | number | `10`                 | Tap-vs-drag distance (px, Manhattan) |
| `storage-key`    | `storageKey`    | string | `flying-menu-corner` | `localStorage` key                   |
| `no-persist`     | `noPersist`     | bool   | `false`              | Disable persistence                  |

`corner` is one of `top-left | top-right | bottom-left | bottom-right`.

### Methods

`openMenu()`, `closeMenu()`, `toggle()`.
(Named `openMenu`/`closeMenu` because `open` is a reflected attribute.)

### Events

| Event                | `detail`              | Notes                       |
|----------------------|-----------------------|-----------------------------|
| `flying-menu-toggle` | `{ open: boolean }`   | Cancelable — `preventDefault()` blocks the change |
| `flying-menu-corner` | `{ corner: Corner }`  | Fired after a snap          |

### CSS parts, states & custom properties

- `::part(trigger)` — the fixed-positioned trigger wrapper.
- `::part(menu)` — the fixed-positioned menu wrapper.
- `:state(open)` — host custom state, present while the menu is open. Use it to drive
  fully custom open/close animation from your own stylesheet.
- `--flying-menu-z-trigger` (default `1000`), `--flying-menu-z-menu` (default `999`),
  `--flying-menu-transition` (default `200ms ease`).

### Animation

The component owns **positioning**, not appearance, and it **never transitions the
menu's position** — the menu jumps to its corner anchor and only the entry/exit
("pop-in") animates, so it never slides in from a previous corner.

You control motion from the outside:

```css
/* Just retime the built-in pop-in. */
flying-menu { --flying-menu-transition: 160ms cubic-bezier(0.2, 0, 0, 1); }

/* Or replace it entirely via the part + host state. */
flying-menu::part(menu) { transition: opacity .15s, scale .15s; opacity: 0; scale: .96; }
flying-menu:state(open)::part(menu) { opacity: 1; scale: 1; }
```

The built-in entry uses `@starting-style` + `transition-behavior: allow-discrete`, and
is disabled automatically under `prefers-reduced-motion: reduce`.

## Accessibility notes

- ARIA (`aria-haspopup`, `aria-controls`, `aria-expanded`) is placed on your slotted
  control when it is itself focusable (e.g. a `<button>`); otherwise the wrapper is
  promoted to `role="button"`. Always provide an accessible name on your trigger.
- The menu content's role is **yours** to choose (`nav`, `menu`, `listbox`, …) — the
  component only manages opening, focus entry, and dismissal.
- While open, **Tab / Shift+Tab cycle through the menu's focusable items** (wrapping at
  the ends) and `Escape` leaves the menu. This works consistently across browsers,
  including WebKit, which otherwise drops focus out of slotted shadow content. Arrow-key
  navigation (for a `role="menu"`) remains yours to add.

## Architecture

Functional-core / imperative-shell: all geometry and the drag state machine are pure,
unit-tested functions in `src/core`; `src/flying-menu.ts` is a thin Lit shell that
measures the DOM and applies the results. See `specs/flying-menu/` for the full spec
(requirements → design → tasks) and `src/README.md` for module details.

## Develop

```sh
bun install
bun run dev          # demo at /  (?scenario=big for a large trigger + tall menu)
bun run test         # unit tests (Vitest)
bun run test:e2e     # E2E (Playwright, Chromium/Firefox/WebKit)
bun run build        # library build + d.ts
```
