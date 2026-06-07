# Flying Menu — user guide

`<flying-menu>` gives you a floating button that the user can **drag into any screen
corner**, and a menu that **opens from that corner** in the right direction with the
right spacing — no matter how big your button or menu is. The component is *headless*:
you supply the button and the menu, it supplies the behaviour.

## Quick start (plain HTML)

```html
<flying-menu>
  <button slot="trigger" aria-label="Open menu">☰</button>
  <nav slot="menu" aria-label="Primary">
    <a href="/home">Home</a>
    <a href="/docs">Docs</a>
    <a href="/about">About</a>
  </nav>
</flying-menu>

<script type="module">
  import '@igor-ganov/flying-menu'
</script>
```

That's it: tap the button to open/close, drag it to reposition. The corner is remembered
between visits.

## Styling

The component draws nothing of its own. Style your slotted markup as usual, and use the
two **parts** to give the floating wrappers a look:

```css
flying-menu::part(menu) {
  background: Canvas;
  color: CanvasText;
  border: 1px solid color-mix(in srgb, CanvasText 20%, transparent);
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.35);
}

/* Very long menus: scroll instead of running off-screen. */
flying-menu::part(menu) {
  max-height: 80vh;
  overflow: auto;
}
```

Layering and timing knobs:

```css
flying-menu {
  --flying-menu-z-trigger: 1000;
  --flying-menu-z-menu: 999;
  --flying-menu-transition: 180ms ease;
}
```

### Animation

The menu **pops in** in place — it never slides across the screen from a previous
corner. You can re-time the built-in animation with `--flying-menu-transition`, or
write your own using the `::part(menu)` part and the host's `:state(open)` state:

```css
/* Custom scale-and-fade entry, fully owned by you. */
flying-menu::part(menu) { transition: opacity .15s, scale .15s; opacity: 0; scale: .96; }
flying-menu:state(open)::part(menu) { opacity: 1; scale: 1; }
```

The animation is automatically disabled for users who prefer reduced motion.

## Configuring behaviour

```html
<flying-menu
  corner="top-right"      <!-- starting corner -->
  margin="24"             <!-- distance kept from the screen edges (px) -->
  gap="12"                <!-- distance between button and menu (px) -->
  drag-threshold="12"     <!-- how far a press must move to count as a drag -->
  storage-key="nav-fab"   <!-- where the corner is saved -->
></flying-menu>
```

Add `no-persist` to stop saving the corner.

## Reacting to it in code

```js
const menu = document.querySelector('flying-menu')

// Open/close programmatically:
menu.openMenu()
menu.closeMenu()
menu.toggle()

// Listen:
menu.addEventListener('flying-menu-toggle', (e) => console.log('open?', e.detail.open))
menu.addEventListener('flying-menu-corner', (e) => console.log('moved to', e.detail.corner))

// Veto an open (e.g. while a form is dirty):
menu.addEventListener('flying-menu-toggle', (e) => {
  if (shouldBlock) e.preventDefault()
})
```

## Framework snippets

### Vue

```vue
<script setup>
import '@igor-ganov/flying-menu'
import { useRouter } from 'vue-router'
const router = useRouter()
const menu = ref()
// Close on navigation:
router.afterEach(() => menu.value?.closeMenu())
</script>

<template>
  <flying-menu ref="menu">
    <button slot="trigger" aria-label="Open menu">☰</button>
    <nav slot="menu" aria-label="Primary">
      <RouterLink to="/home">Home</RouterLink>
    </nav>
  </flying-menu>
</template>
```

> In Vue, configure the compiler to treat `flying-menu` as a custom element
> (`isCustomElement`) so it doesn't warn about the unknown tag.

### Astro

```astro
---
// component or page front-matter
---
<flying-menu>
  <button slot="trigger" aria-label="Open menu">☰</button>
  <nav slot="menu" aria-label="Primary">
    <a href="/home">Home</a>
  </nav>
</flying-menu>

<script>
  import '@igor-ganov/flying-menu'
</script>
```

## Accessibility

- Always give the trigger an **accessible name** (`aria-label`, or visible text).
- The component keeps `aria-expanded` in sync, moves focus into the menu on open,
  closes on `Escape` (restoring focus to the trigger) and on an outside click, and
  honours `prefers-reduced-motion`.
- While the menu is open, **Tab and Shift+Tab move through its items** and wrap around;
  `Escape` exits. (Arrow-key navigation, if you want a `role="menu"`, is up to you.)
- Choose the right role for your menu content (`nav` for navigation, `role="menu"` with
  `role="menuitem"` children for an actions menu, etc.).

## Tips & gotchas

- **Tall menus**: set `max-height` + `overflow: auto` on `::part(menu)` (see Styling). A
  menu taller than the viewport is pinned to the margin and will otherwise overflow.
- **Custom (non-`<button>`) triggers**: the component makes the wrapper a `role="button"`
  and focusable, but a real `<button>` is preferred for the best assistive-tech support.
- **The button stays put across reloads** — clear it by changing `storage-key` or adding
  `no-persist`.
