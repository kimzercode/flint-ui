# AGENTS.md — how this library is built

Rules for anyone (human or AI agent) changing Flint UI. These are not style
preferences; they are the constraints that kept the CSS small, the HTML valid,
and the docs honest. When a task seems to require breaking one of these, stop
and fix the architecture instead.

## What Flint is

A vanilla CSS + minimal-JS Material-2-style library in the Google flat idiom
(~2019–2020): **no shadows anywhere** — separation comes from 1px borders and
tinted states. No dependencies, no build step for the library itself, no
webfonts. The docs site is the only thing that builds, and it is built *with*
Flint.

Priority order, when in doubt: **reliable and usable library first; animations
are a bonus; never trade behavior, accessibility or correctness for visuals.**

## Core principles

### 1. One owner per concern

Every pixel and every behavior has exactly one owner. If two elements can
conceivably own the same border, state or behavior, the design is wrong —
choose one and delete the other.

- The field's `.fl-field__box` owns the chrome (border, fill, radius, height,
  all states); the `.fl-field__input` is a naked control (text, font, color,
  semantics only). Never style chrome on the control.
- Variant intent lives on the root (`fl-field--filled`, `fl-field--error`);
  semantics live on the control (`disabled`, `aria-invalid`, `maxlength`);
  presentation reads both. Three layers, three elements, no overlap.
- JS behaviors are delegated on `document`, so dynamically added elements work
  without a rescan (see `flint.js`).

### 2. No two structures for the same component

If a component needs a wrapper to host affixes, icons or counters, then *all*
instances use that wrapper — not "plain fields keep the old markup, complex
fields get the new one". Two contracts means every state rule written twice,
two docs pages, and users who mix them and get double borders. Fix the
contract once; migrate every instance. (This library is pre-production: the
cost of migration is always lower now than later.)

### 3. States are tokens, not re-declarations

Component state rules should **assign private custom properties** (`--_`
prefix = internal, not public API), and the base declaration consumes them.
Adding a state must be a one-line token change, never a re-declared
`border`/`box-shadow`/`background`.

```css
.fl-thing {
  --_border: var(--fl-border);
  border: 1px solid var(--_border);
}
.fl-thing:hover  { --_border: var(--fl-text); }
.fl-thing--error { --_border: var(--fl-error); }
```

Variant defaults come *before* state rules so states win the cascade. This
also composes variants × states without a selector matrix.

### 4. No padding math, no geometry computed from siblings

CSS cannot measure a sibling's width. Any "absolutely position this inside
that element and pad to clear it" design is rejected — especially for
variable-width content (`$` vs `USD`). Put the border on a wrapper and lay
the children out with flexbox; let each child own its inset.

### 5. Valid HTML is the contract

The markup shown in demos/docs is the API. It must be valid HTML before it is
pretty: a `<label>` may not contain another labelable element (buttons,
another input); interactive elements get `type="button"`; the accessible name
of a control must not accidentally absorb helper text (so labels link via
`for`, they don't wrap helper text). If a demo needs a `<div>` where a demo
once used a `<label>`, change the demo, not the HTML rules.

### 6. Zero JS is the default; JS only where CSS cannot

CSS-only components ship with zero script (tooltips, progress, field chrome).
JS is added only for behavior CSS cannot express (dialogs, snackbars, the
password toggle) and is kept to the minimum: delegation, a few lines, no
framework, no focus traps the platform already provides (`<dialog>` +
`showModal()`). The library must still *render* correctly with JS off, and
each docs page says plainly what works without it.

### 7. Ship slots, not content

The library provides slots (`.fl-field__icon`, `.fl-icon`), never an icon
set, and never injects content into author markup (e.g. no auto-injected
error `!` icon — the author adds a trailing icon). Wireframe placeholders
(`.fl-icon`) exist so demos render without an icon font.

### 8. Honest deviations and honest gaps

When the M2 spec is deviated from (44px fields vs 56dp, inverse-surface
snackbar without shadow), record it in `docs-site/NOTES.md` and say so on the
component page. When something cannot be done (CSS-only Escape dismissal,
touch long-press, `field-sizing` in Firefox), document the gap and the
mitigation — never silently skip it, never fake it.

### 9. Audit the reference before building

Each component is built against the official Material reference screenshots
(user-supplied per component in `*-docs/` folders): read them all first,
produce the audit table (match / gap / deviation), then implement. The spec's
own "don't" panels (no shadows on tooltips, succinct labels, static-label
fields are valid) are requirements too.

### 10. Every shipping change is verified, then documented

- Playwright probe before commit: behavior gates first (states, keyboard,
  no-JS, a11y), then visuals via screenshots. Pixel-check what
  `getComputedStyle` cannot see.
- Docs page updated in the same change: usage, anatomy, behavior,
  accessibility (incl. known gaps), code, theming. A shipped component with a
  stale docs page is a bug.
- `NOTES.md` rows for decisions and gaps; `PLAN-0.4.md` (or the active plan)
  updated; `CHANGELOG.md` at release.

## Mechanics

- Untracked user files stay untouched (`js/docs.js`, `test*.html`,
  `*-docs/` reference folders, `m2.material.io*.png`).
- Commits: `git add` explicit paths only — **never `git add js`** (sweeps the
  user's `js/docs.js`); use `git add js/flint.js`.
- Docs build: `npm run build` in `docs-site/` (vendors `css/`, `js/`,
  `demos/` into `src/vendor/`, then Eleventy). `docs/` is committed output.
- Tokens are the theming API; `--_`-prefixed tokens are internal and must not
  appear in docs theming tables.
- Browser baseline: evergreen (2023+). `:has()` and logical properties are
  allowed; document any feature that degrades without them.
