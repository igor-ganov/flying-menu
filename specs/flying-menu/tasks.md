# Flying Menu — Tasks

Ordered, small-grained, TDD. Implement one task at a time; write the failing test first,
then code to green; keep the tree green between tasks. Each task lists the requirement(s) it
satisfies and the test(s) that verify it. `[ ]` = todo, `[x]` = done.

## Phase A — Project scaffold
- [x] A1. Init Vite + Lit + TypeScript library project; `package.json` scripts
  (`dev`, `build`, `test` = vitest, `test:e2e` = playwright); `tsconfig` strict, no `any`.
  *Verifies:* infra. *Test:* `bun run build` succeeds; `bun run test` runs 0-pass.
- [x] A2. Add Vitest (happy-dom env) + Playwright config (Chromium/Firefox/WebKit),
  `--reporter` wired. *Test:* empty suites run green in both.
- [x] A3. `src/core/types.ts`, `src/core/constants.ts`, `src/test-ids.ts`.
  *Verifies:* AC-2.3/4.3/2.5/5.3 defaults. *Test:* type-only + constant value assertions.

## Phase B — Functional core (unit-tested, no DOM)
- [x] B1. `core/snap-to-corner.ts`. *Verifies:* AC-2.2. *Test:* `snap-to-corner.test.ts`
  (4 corners + exact-center boundary).
- [x] B2. `core/corner-position.ts` taking measured `Size`. *Verifies:* AC-2.3, AC-3.1, AC-3.2.
  *Test:* `corner-position.test.ts` — 4 corners with **square and non-square** sizes; trigger
  larger than half-viewport still inset by margin.
- [x] B3. `core/drag-machine.ts` (idle/onDown/onMove/onUp/wasTap). *Verifies:* AC-1.1–1.3,
  AC-2.1, AC-2.5. *Test:* `drag-machine.test.ts` — tap below threshold ⇒ `wasTap`; move past
  threshold ⇒ `!wasTap` & correct `current`; Manhattan boundary.
- [x] B4. `core/menu-position.ts` (anchor + clamp). *Verifies:* AC-4.1–4.6. *Test:*
  `menu-position.test.ts` — each corner alignment; tall menu clamps within margin; menu larger
  than viewport pins to margin; re-anchor on corner change.
- [x] B5. `core/persist-corner.ts` + `localStoragePort`. *Verifies:* AC-5.1–5.4. *Test:*
  `persist-corner.test.ts` — parse/guard, default on missing/invalid, save round-trip, storage
  throwing ⇒ default (no throw).
- [x] B6. `a11y/focus.ts` `firstFocusable`. *Verifies:* AC-6.2. *Test:* `focus.test.ts` —
  finds first tabbable; falls back to container when none.

## Phase C — Lit shell
- [x] C1. `flying-menu.styles.ts` + element skeleton: render trigger/menu wrappers with parts,
  `:host` static, hidden menu, reduced-motion media query. *Verifies:* AC-7.1, AC-7.4, AC-6.6.
- [x] C2. Reactive props/attrs (`open`, `corner`, `margin`, `gap`, `drag-threshold`,
  `storage-key`, `no-persist`) + `open()/close()/toggle()`. *Verifies:* AC-7.2, AC-7.3.
- [x] C3. Init: restore corner via `persist-corner`; position trigger via `corner-position`
  using measured size. *Verifies:* AC-5.2, AC-3.1.
- [x] C4. Pointer wiring through `drag-machine`: live drag (inline style, no transition),
  release ⇒ snap + `corner` set + persist + `flying-menu-corner`. *Verifies:* AC-2.1–2.5, AC-5.1.
- [x] C5. Tap ⇒ `toggle()`; emit cancelable `flying-menu-toggle`; keyboard Enter/Space.
  *Verifies:* AC-1.1–1.4, AC-6.5.
- [x] C6. Menu open lifecycle: measure menu, apply `menu-position`, reposition on resize &
  corner change. *Verifies:* AC-4.5, AC-4.6.
- [x] C7. ARIA wiring (haspopup/expanded/controls; button detection via `assignedElements`).
  *Verifies:* AC-6.1.
- [x] C8. Focus management + global listeners: focus into menu on open; Escape close+restore;
  outside pointerdown close. *Verifies:* AC-6.2–6.4.

## Phase D — Demo + E2E + a11y
- [x] D1. `demo/index.html` with two scenarios (small hamburger trigger; large custom trigger +
  tall menu) wired to Vite. *Verifies:* US-3, US-4 manual surface.
- [x] D2. E2E `e2e/toggle.spec.ts` — tap open/close, toggle event, Enter/Space.
  *Verifies:* AC-1.1–1.4, AC-6.5.
- [x] D3. E2E `e2e/drag.spec.ts` — drag past threshold snaps & no toggle; large trigger stays
  in viewport; corner event. *Verifies:* AC-1.3, AC-2.1–2.4, AC-3.2.
- [x] D4. E2E `e2e/menu-anchor.spec.ts` — each corner anchors correctly; tall menu never clips.
  *Verifies:* AC-4.1–4.6.
- [x] D5. E2E `e2e/persist.spec.ts` — corner survives reload; custom storage-key.
  *Verifies:* AC-5.1–5.3.
- [x] D6. E2E `e2e/a11y.spec.ts` — aria attrs; focus move; Escape restore; outside-click close;
  reduced-motion computed style; axe scan open & closed (no serious/critical).
  *Verifies:* AC-6.1–6.7.
- [x] D7. E2E `e2e/headless.spec.ts` — parts present; API methods; no imposed visual styles.
  *Verifies:* AC-7.1–7.4.

## Phase E — Polish & docs
- [x] E1. Full unit + E2E pass across Chromium/Firefox/WebKit; no skips, no timeouts.
- [x] E2. README (root + `src` + `e2e`); `documentation/user` usage guide with framework
  snippets (plain HTML, Vue, Astro).
- [x] E3. Cleanup: remove dead code; final IDE issue check; verify build.

## Notes
- TDD: the acceptance criteria are the failing tests written first (CLAUDE.md).
- No `as`, no `any`, no `null`, `import type`, arrow fns, `readonly`, `inject`-free (no Angular).
- Locator constants in `test-ids.ts`, referenced by both component and E2E.
