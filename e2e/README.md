# `e2e` — Playwright tests

End-to-end coverage of the custom element in real browsers (Chromium, Firefox, WebKit),
driven against the Vite demo (`/`, plus `?scenario=big` for a large trigger + tall menu).

```
helpers.ts          ready(), shadow-piercing locators, inlinePos(), dragTriggerTo()
toggle.spec.ts      tap/keyboard toggle, cancelable event            (US-1, AC-6.5)
drag.spec.ts        threshold, snap, corner event, large-trigger inset (US-2, US-3)
menu-anchor.spec.ts per-corner anchoring + viewport clamp + re-anchor  (US-4)
persist.spec.ts     corner survives reload, custom key, no-persist      (US-5)
a11y.spec.ts        ARIA, focus move, Escape, outside-click, reduced-motion, axe (US-6)
headless.spec.ts    parts, imperative API, no imposed chrome, reflected props (US-7)
```

## Conventions

- **No timeouts.** Assertions are event/DOM-driven; web-first `expect(...)` polling and
  custom-event promises only — never `waitForTimeout`.
- **Stable geometry.** Tests that assert pixel positions first
  `emulateMedia({ reducedMotion: 'reduce' })`, which the component honours by removing
  transitions, so bounding boxes are final immediately.
- **State via reflected attributes.** `open` and `corner` reflect, so most state checks
  are `toHaveAttribute` polls.

## Run

```sh
bun run test:e2e                      # all browsers
bunx playwright test e2e/drag.spec.ts --project=chromium --reporter=list
```
