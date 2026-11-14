# 0.4.0 execution plan — overlays + forms completion

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
| 1 | Infra: native `<dialog>` wiring, §13 CSS, `demos/overlay.html` | ✅ `bfccd5a` (24 Playwright checks pass) |
| 2 | **Dialog component**: pinned-actions surface, `fl-btn--danger`, `demos/dialog.html`, docs page (retire stub) | ✅ `dd9b4cf` (15 Playwright checks pass) |
| 2b | **Dialog completion** (M2 audit): 560px height cap, `.fl-dialog__list`/`__option` (simple + confirmation choice rows), `.fl-dialog__actions--stacked`, `.fl-dialog--fullscreen` + `.fl-dialog__header`, `data-fl-dismissible="false"` (ignore scrim + Escape, keep `data-fl-close`), demos (pick-a-label, confirmation w/ disabled confirm, full-screen compose), docs Types/Actions/Dismissal sections | ⬅ next |
| 3 | Bottom sheet: presentation (drag handle, desktop width), `demos/sheet.html`, docs page (retire stub) | |
| 4 | Snackbar: CSS + auto-dismiss timer in flint.js, `data-fl-open` dispatch on `.fl-snackbar`, docs | |
| 5 | Progress: `<progress>` + conic-gradient circle, CSS only, docs | |
| 6 | Tooltip: CSS-only hover/focus, four directions, docs | |
| 7 | **Forms completion** (Addendum B): `.fl-field__prefix`/`__suffix`, `__counter`, leading/trailing `__icon` slots, `data-fl-password-toggle`, `field-sizing: content` auto-grow, docs recipes (helper↔error swap, live counter) + decision notes | |
| 8 | Overlays guide page (shared layer, focus protocol, no-JS fallbacks) + trim repetition from component pages | |
| 9 | Release: `?v=0.4.0` in `base.njk`, CSS/JS headers drop `-dev` (also fix footer "v0.1.0"), `components.js` (dialog/sheet → ready, + snackbar/progress/tooltip), CHANGELOG `[0.4.0]` ("overlays + forms completion"), ROADMAP ✅ (README + `roadmap.njk` synced), tag `v0.4.0`, GitHub release, live-site check | |

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

Deferred (already logged): listbox menu (0.5, on this overlay infra).

## After 0.4 (decided sequencing)

Fictional-app samples (`samples/`, flagship mail client; every shipping
component in ≥1 sample) → template gallery → guided-build docs page → themed
token-override variants → tutorial series last (~0.7, near API freeze).
