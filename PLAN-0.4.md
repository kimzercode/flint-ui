# 0.4.0 execution plan — overlays

Working checklist for the remaining 0.4 steps (full design rationale in
`~/.opencode/plan/flint-ui-0.4-overlays.md` and the Phase 3 section of the
long-term plan). Update the status column as steps land.

## Status

| Step | Deliverable | Status |
|---|---|---|
| 1 | Infra: native `<dialog>` wiring, §13 CSS, `demos/overlay.html` | ✅ `bfccd5a` (24 Playwright checks pass) |
| 2 | **Dialog component**: pinned-actions surface, `fl-btn--danger`, `demos/dialog.html`, docs page (retire stub) | ✅ step 2 |
| 3 | Bottom sheet: full presentation (drag handle, desktop width), `demos/sheet.html`, docs page (retire stub) | |
| 4 | Snackbar: CSS + auto-dismiss timer in flint.js, `data-fl-open` dispatch on `.fl-snackbar`, docs | |
| 5 | Progress: `<progress>` + conic-gradient circle, CSS only, docs | |
| 6 | Tooltip: CSS-only hover/focus, four directions, docs | |
| 7 | Overlays guide page (shared layer, focus protocol, no-JS fallbacks) + trim repetition from component pages | |
| 8 | Release: `?v=0.4.0` in `base.njk`, CSS/JS headers drop `-dev`, `components.js` (dialog/sheet → ready, + snackbar/progress/tooltip), CHANGELOG `[0.4.0]`, ROADMAP ✅ (README + `roadmap.njk` synced), tag `v0.4.0`, GitHub release, live-site check | |

## Gates (every step)

1. Playwright probe of the new behavior passes (pattern: `/tmp/opencode/ovshot.mjs`;
   playwright-core in `/tmp/opencode/node_modules`, headless shell at
   `~/.cache/ms-playwright/chromium_headless_shell-1248/...` — reinstall if `ERR_MODULE_NOT_FOUND`).
2. Screenshots reviewed (desktop 1024 + mobile 390).
3. `npm run build` in `docs-site/`, commit **from repo root**, push.
4. Docs honesty rule: every page states its no-JS fallback.

## Return visit: 0.3 forms — "we missed somethings" (user request)

Before or after 0.4 finishes, walk this candidate list with the user and
decide ship / document-decision / reject. Ordered by how much the samples
will need them:

1. **Floating labels** — the M2 filled/outlined signature; we shipped static
   top labels. Confirm the decision or add.
2. **Indeterminate checkbox** — select-all rows in trees/lists; definitely
   missing. (CSS: dash glyph on `:indeterminate`; zero JS.)
3. **Field icons** — leading/trailing slots (search field in every sample).
4. **Character counter** — count slot in the help row (`aria-live` note).
5. **Prefix/suffix text** — currency, domain, units.
6. **Required marking** — asterisk convention on `fl-field__label`.
7. **Password visibility toggle** — trailing icon recipe (1 line of author
   JS or `data-fl` toggle) vs. library feature.
8. **Form layout helpers** — vertical rhythm between fields, two-column rows.
9. **Helper↔error text swap recipe** — today `fl-field__help` is recolored by
   the error state; document swapping its text on `aria-invalid`, or add a
   second slot.
10. **`:user-invalid` styling** — style only after the user has typed/touched;
    would make "error before interaction" go away without classes.

Also already logged as deferred: listbox menu (0.5, on this overlay infra).

## After 0.4 (decided sequencing)

Fictional-app samples (`samples/`, flagship mail client; every shipping
component in ≥1 sample) → template gallery → guided-build docs page → themed
token-override variants → tutorial series last (~0.7, near API freeze).
