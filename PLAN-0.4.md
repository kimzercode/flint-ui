# 0.4.0 execution plan — containment + forms completion

Working checklist for the remaining 0.4 steps (full design rationale in
`~/.opencode/plan/flint-ui-0.4-overlays.md` — Addendum A is the M2 dialog
audit, Addendum B the forms-completion scope). Update the status column as
steps land.

## Priorities (user directive, 2026-11-14)

**Reliable and usable first; animations are a bonus once the core is done.**
We do not follow the M2 docs to the letter. Concretely:

- No step spends time polishing animation curves, timings or choreography.
  What step 1 already shipped (fade + scale open/close, `prefers-reduced-motion`
  off-switch) is the final animation budget for 0.4.
- New components (sheet, snackbar) may ship with a plain fade/appear if that is
  the cheapest honest behavior — an animation only comes along if it is free.
- Never trade a behavior gate (focus return, Escape, dismissal rules, no-JS
  fallback) for visual polish.

## Status

| Step | Deliverable | Status |
|---|---|---|
| 1 | Infra: native `<dialog>` wiring, §13 CSS, `demos/overlay.html` (demo retired in step 8 — "overlay" is not a Material component) | ✅ `bfccd5a` (24 Playwright checks pass) |
| 2 | **Dialog component**: pinned-actions surface, `fl-btn--danger`, `demos/dialog.html`, docs page (retire stub) | ✅ `dd9b4cf` (15 Playwright checks pass) |
| 2b | **Dialog completion** (M2 audit): 560px height cap, `.fl-dialog__list`/`__option` (simple + confirmation choice rows), `.fl-dialog__actions--stacked`, `.fl-dialog--fullscreen` + `.fl-dialog__header`, `data-fl-dismissible="false"` (ignore scrim + Escape, keep `data-fl-close`), demos (pick-a-label, confirmation w/ disabled confirm, full-screen compose), docs Types/Actions/Dismissal sections | ✅ (30 Playwright checks pass) |
| 3 | Bottom sheet: presentation (drag handle, desktop width), `demos/sheet.html`, docs page (retire stub) | ✅ (22 Playwright checks pass) |
| 4 | Snackbar: CSS + auto-dismiss timer in flint.js, `data-fl-open` dispatch on `.fl-snackbar`, docs | ✅ (17 Playwright checks pass) |
| 5 | Progress: `<progress>` + conic-gradient circle, CSS only, docs | ✅ (11 Playwright checks; audited against user's `progress-docs/` M2 refs: 48dp default, grow+shrink sweep, one-type-per-activity docs, tint-track deviation documented) |
| 6 | Tooltip: CSS-only hover/focus, four directions, docs | ✅ (19 Playwright checks; audited against user's `tooltips-docs/` M2 refs: 24/32px heights + 8/16px gaps, grey-800 container, 300ms hover delay / 0 focus, no arrow no shadow, pointer-events:none, WCAG 1.4.13 + long-press gaps documented) |
| 7 | **Forms completion** (Addendum B): `.fl-field__prefix`/`__suffix`, `__counter`, leading/trailing `__icon` slots, `data-fl-password-toggle`, `field-sizing: content` auto-grow, docs recipes (helper↔error swap, live counter) + decision notes | ✅ (28 Playwright checks; architecture upgraded beyond Addendum B: one structure — `.fl-field__box` owns the chrome for every field, input is a naked control, `<label for>` replaces label-wrapping (valid HTML + clean accessible name), `--_` state tokens, real outline focus ring, filled top-only radius, `aria-invalid` recolors label/help, `--fl-field-h` token; AGENTS.md added) |
| 8 | **Bottom sheets completion** (Addendum C, `bottom-sheets-docs/` audit): 50dvh cap, `--full`, standard sheet, `.fl-option` (56/48), scrim 32%, handle deleted, grid slot, surface-padding contract, safe-area/dvh/hover-guard web-native fixes; `bottom-sheet.njk` rewrite; overlay page replaced by per-component prose | ✅ (probe: 16 CSSOM + 20 behavior checks pass; screenshots at 390 + 1024) |
| 9 | Release: `?v=0.4.0` in `base.njk`, CSS/JS headers drop `-dev` (also fix footer "v0.1.0"), `components.js` (dialog/sheet → ready, + snackbar/progress/tooltip), CHANGELOG `[0.4.0]` ("containment + forms completion"), ROADMAP ✅ (README + `roadmap.njk` synced), tag `v0.4.0`, GitHub release, live-site check | ✅ `release` commit + tag |

## Gates (every step)

1. Playwright probe of the new behavior passes (pattern: `/tmp/opencode/dlgshot.mjs`;
   playwright-core in `/tmp/opencode/node_modules`, headless shell at
   `~/.cache/ms-playwright/chromium_headless_shell-1248/...` — reinstall if `ERR_MODULE_NOT_FOUND`).
2. Screenshots reviewed (desktop 1024 + mobile 390).
3. `npm run build` in `docs-site/`, commit **from repo root**, push
   (never `git add js` — sweeps the user's `docs.js`).
4. Docs honesty rule: every page states its no-JS fallback.

## Locked decisions (do not reopen)

- **Floating labels: rejected permanently.** Fields stay outlined with static
  top labels — classic/Apple idiom, M2's own "text fields with independent
  labels" pattern. Better a11y, zero churn. Record in `NOTES.md` and as a
  "deliberately not floating labels" note on the Text fields page.
- **Password toggle ships in flint.js** (`data-fl-password-toggle`, ~12 lines):
  behavior CSS cannot do; author supplies the icon — Flint ships slots, not an
  icon set.
- Full-screen dialog ships as a modifier only; **no** automatic responsive
  full-screen↔simple morphing, **no** Android back-gesture shim.
- Transitions stay as shipped (fade + scale) — documented deviation, no curve
  tuning (see Priorities).
- Field height stays 44px (documented density deviation from M2's 56px).
- Skip the filled-variant `!` error icon (decorative).
- Either a trailing icon **or** a suffix in a field, not both (M2 rule).

## Step 7 cost envelope

≈52 CSS lines + 12 JS lines, zero dependencies. Unblocks the samples' search
fields, auth forms, currency/units inputs.

## Still open from the 0.3 revisit list (decide during step 7)

Not yet decided — cheap ones may fold into step 7, the rest become 0.5+:

1. **Indeterminate checkbox** — select-all rows; zero-JS CSS dash glyph; likely yes.
2. **Required marking** — asterisk convention on `fl-field__label`.
3. **Form layout helpers** — vertical rhythm / two-column rows.
4. **`:user-invalid` styling** — errors only after the user touched the field.

Deferred (already logged): listbox menu (0.5).

## After 0.4 (decided sequencing)

**0.5 scope decision (2026-11-16, user directive):** 0.5 keeps its data-display
row (data table, tabs, pagination, avatar, chips) and gains the app-chrome set
needed to build a Gmail/Keep-style master-detail app: menu (pulled forward from
this deferral), side sheet, top app bar promoted to a component (extended/
prominent/dense/images/translucency variants permanently discarded — mobile-first
native feel), split shell, checkbox-driven list selection state, empty-state and
card-grid docs recipes. **The notes prototype (`prototype/test-mdl2.html`) is
rebuilt entirely on Flint components as the first `samples/` entry and that
rebuild is 0.5's acceptance gate** — no hand-rolled chrome survives.

Fictional-app samples (`samples/`, flagship mail client; every shipping
component in ≥1 sample) → template gallery → guided-build docs page → themed
token-override variants → tutorial series last (~0.7, near API freeze).
