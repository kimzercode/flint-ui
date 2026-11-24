# Changelog

All notable changes to Flint UI are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com); versioning follows
[SemVer](https://semver.org) — during 0.x the API may still change.

## [0.5.1] — 2026-11-24

A **sample layout pass** and the fixes it uncovered. No component API changed;
the notes sample is the only thing rebuilt.

### Fixed

- **Modal surfaces jumped during the close animation.** `fl-dialog`,
  `fl-dialog--fullscreen`, `fl-sheet` and `fl-sidesheet` took their placement
  from `[open]` rules. The exit transition keeps the element rendered after
  `[open]` is removed, so the surface fell back to the UA's static position —
  the 560px desktop card jumped to the top-left corner while fading out.
  Placement now lives on the base selectors; the open state carries only
  transform/opacity.
- **Leading icon in the search pill.** The documented pattern is a
  `.fl-field__icon` slot with the glyph inside. The notes sample instead gave a
  bare `.fl-icon` the slot's 48px flex basis, stretching the placeholder into a
  48×22 bar. The two notes pages, the top-bar demo, the Keep recipe and the
  top-app-bar snippet now use the slot — a 22×22 glyph centred in 48px, with
  the input starting at the slot's edge.
- **Pinned drawer stacked above overlays.** At ≥905px the drawer is an in-flow
  grid item, but it kept the off-canvas `z-index: 40` — and a grid item's
  z-index still applies. The snackbar (and any menu positioned over the drawer)
  painted underneath it. The pinned drawer is now `z-index: auto`.

### Changed

- **Notes sample rebuilt against the Keep references**, in two chrome
  arrangements that share one stylesheet and one script:
  `samples/notes/index.html` (hamburger inside the search pill, note actions in
  the meta footer) and `samples/notes/classic.html` (hamburger beside the pill,
  actions in the editor's top bar).
- The phone bar has **no visible title** — the search pill takes the title's
  slot; the `<h1>` remains for heading navigation. The drawer names the app on
  phones and its selected row names the view.
- **Two-column masonry on phones** (240px minimum up to four columns above
  600px), placed row-major by the sample; balanced CSS columns remain the no-JS
  fallback. No compose bar: the FAB creates notes at every width.
- **Borderless editor canvas** — naked title/body controls with `aria-label`s
  instead of fields, a meta-footer hairline ("Edited …") and the note actions
  there or in the top bar. Labels moved to a small radio-row dialog opened from
  ⋮ → Labels….
- Drawer: brand row on phones, labels caption, Archive in its own bottom group,
  and a link between the two arrangements in the footer.

## [0.5.0] — 2026-11-18

The **data display + app chrome** release: the components an app shell needs
before it can be built on Flint — a menu, a documented top app bar, in-page
tabs, a data table and the sheet family's desktop half — plus the first
`samples/` entry, a notes app that is the rebuild of the 0.4-era prototype and
the gate for this release.

### Added

- **Menu** (`fl-menu`) — dropdown on the native Popover API: the browser
  supplies light dismiss, Escape, one-at-a-time and top-layer stacking.
  `flint.js` adds anchoring with edge flipping, `aria-expanded` sync and the
  Arrow/Home/End pattern. No scrim (M2 menus are not modal). Selection rows
  (`aria-checked`) and a group divider are part of the component.
- **Top app bar** — promoted from a shell part to a documented component:
  safe-area top inset, action ordering, `data-fl-scroll-hide` (hides on
  scroll-down, returns on scroll-up, settle-guarded against row-collapse
  feedback), and the **contextual action bar** state (inverse fill, close
  replaces the nav icon, "N selected").
- **Transparent top bar** (`fl-top-bar--transparent`) + **search-in-bar** —
  the Google web pattern: no fill, no border, the search pill is the anchor.
  A transparent bar still fills when contextual — a state change you cannot
  see is not a state change.
- **Tabs** (`fl-tabs`) — in-page tabs on a native radio group, distinct from
  the bottom nav: 48px bar, 2px indicator, fixed ≤4, icon variant, scrollable
  overflow, clustered on desktop. Zero JS; radio semantics documented as the
  deliberate trade (the bar is a form control, not a `tablist`).
- **Data table** (`fl-data-table`) — flat 56/52px rows with a 1px outline,
  numeric alignment, checkbox selection tint, horizontal scroll with a sticky
  selection column on mobile, sortable headers via `aria-sort`, and
  link-based pagination. The truncation slot (`.fl-data-table__truncate`) owns
  ellipsis because auto table layout ignores `max-width` on cells.
- **Chips + avatar** — filter / choice / action / tag chips on native
  checkboxes, radios and buttons (zero JS, pill radius token, optional check
  and remove slots), and one shared `.fl-avatar` (40/32/24) replacing the
  list-only avatar.
- **Side sheet** — standard (persistent desktop panel) and modal (native
  `<dialog>`) on the trailing edge with mobile insets; the 1px leading border
  stands in for M2 elevation.
- **List selection state** — a checkbox owns the state and the row reads it
  (`:has(.fl-check:checked)` → `--fl-tint`); a `<label>` row makes the whole
  line the target.
- **Interactive cards** — `a.fl-card` / `button.fl-card` are shipped
  patterns: the real element is the hit area and the semantics, with the
  element reset in the library. `button` cards use `.fl-card__title/text`
  spans (phrasing content only); anchors and articles keep real headings.
- **Recipes** — card grid, empty state, and the Keep-style app-shell
  composition map, with a runnable skeleton at `demos/recipe-keep.html`.
- **`samples/notes`** — the prototype rebuilt on Flint in the Keep-web form
  factor: transparent bar + search pill, drawer shell (pinned 280px column
  from 905px, off-canvas below), card grid, FAB, live editor as a full-screen
  dialog that becomes a 560px card, label chips, ⋮ menu, and a snackbar whose
  Undo/Open is real. No hand-rolled chrome; the app logic is author code.
  Probed at 390 + 1024px (37 assertions).

### Changed

- **Full-screen dialog** now performs the M2 type swap: full-bleed below
  600px, a 560px card above it, with the dismiss control re-ordered to the
  trailing edge. Header, body and actions share one inset per arrangement
  (16px app bar / 24px card).
- **FAB** distance from the bottom edge is `--fl-fab-inset` (16px + safe area
  by default); a shell that renders `.fl-tab-bar` raises it automatically with
  `:has()`. While a snackbar is visible the FAB steps up 56px instead of
  being covered.
- **Snackbar** gutter is `--fl-snackbar-inset`, and the single action sits at
  the trailing edge.
- **Fields** — `.fl-field__input` is `width: 0` + `flex: 1 1 auto`: a control's
  width comes from the box's flex line, never from its `size` attribute (a
  search pill in a 390px app bar was dragging the whole page 8px sideways).
  The auto-grow textarea loses its resize grip.
- **Navigation rows** can be `<button class="fl-nav-item">` for client-side
  destinations, with the browser chrome reset in the library.
- **`[hidden]`** is a real hiding primitive again (`display: none
  !important`) — author `display` rules had been silently beating it.
- A closed off-canvas drawer sets `visibility: hidden`, so its links leave the
  tab order.

### Docs

- Component pages for menu, tabs, data table, top app bar and side sheet,
  plus the chips/avatar, card, bottom-nav, snackbar and text-field updates.
- `NOTES.md` records every deviation and every gap found by the sample
  (type-swap insets, popover-inside-dialog, no-JS sample state, the Keep
  deviations: view title, one column below 600px, outlined editor fields, FAB
  instead of the compose bar, one label per note, close·title·⋮ header,
  Archive without Trash).

## [0.4.0] — 2026-11-16

The containment + forms completion release: five new components, the
field architecture rebuilt on the field-box contract, and the web-native
fixes that make overlays feel at home in a browser (safe areas, dvh,
hover guards). Every new component is audit-driven against the official
M2 reference screenshots.

### Added

- **Dialog** — the native `<dialog>` in the card vocabulary: showModal()
  provides the focus trap, inert background, Escape and top-layer
  stacking; Flint draws the scrim (`--fl-scrim`), the surface and the
  CSS-only open/close transitions.
  - Pinned-actions surface (title/actions fixed, body scrolls).
  - The M2 dialog types: alert, simple (option rows), confirmation
    (disabled-until-chosen), form, and full-screen (header with close +
    confirming action).
  - `fl-dialog__actions--stacked` — full-width stacked actions for narrow
    surfaces, confirming action on top as M2 shows.
  - `data-fl-dismissible="false"` — scrim and Escape refused; explicit
    actions still close (decisions, not information).
- **Bottom sheet** — audited against 28 M2 references:
  - Modal sheet on `<dialog>`, docked bottom, initial height capped at
    **50dvh** (M2's 50% rule) with `--full` (100dvh + internal scroll +
    required close action) for content that needs the screen.
  - **Standard sheet** (`fl-sheet--standard`) — persistent, non-modal, no
    scrim, no JS: a fixed block element for mini-players, cart bars,
    selection counts; layers below the snackbar.
  - **Grid contents** — the "Open in…" idiom: fixed 3-column
    icon+label tiles.
  - Rows promoted to **`.fl-option`** with `--fl-option-h`: 56px in
    sheets, 48px in dialogs (both spec numbers, one row component).
  - The drag handle was **removed** — it isn't in the M2 spec and
    signaled a gesture that doesn't exist. Swipe-to-dismiss is a
    documented gap (it fights the sheet's own scroll).
- **Snackbar** — inverse-surface status message, non-modal by design:
  one at a time (M2 rule), 4s auto-dismiss in flint.js, optional action
  button (`--fl-accent-inverse`), `fl-snackbar--above-nav` not needed —
  it layers above FABs and the standard sheet.
- **Progress** — linear `<progress>` (determinate + the M2 grow-and-shrink
  indeterminate sweep) and a conic-gradient circle (270° spin), zero JS.
- **Tooltip** — CSS-only identifying label for icon-only controls: grey
  800 container, no arrow, no shadow (the spec's own don'ts), four
  direction modifiers, 300ms hover delay / instant focus, hidden from
  the accessibility tree when not shown.
- **Forms completion** — the field architecture rebuilt (one structure
  for every field):
  - `.fl-field__box` owns the chrome; `.fl-field__input` is a naked
    control — one owner per concern, `--_` state tokens.
  - Affixes (`__prefix`/`__suffix`), leading/trailing `__icon` slots,
    `__footer` with helper/error swap and a live `__counter`.
  - `data-fl-password-toggle` (the one bit of field JS), 
    `fl-field__input--grow` auto-grow (`field-sizing: content` + rows
    fallback).
  - Labels are siblings with `for` (valid HTML with trailing buttons,
    clean accessible names) — a deliberate contract change.
- **Web-native fixes** (audit-surfaced, all surfaces):
  - `env(safe-area-inset-bottom)` on sheet actions, standard sheet and
    snackbar.
  - `dvh` viewport caps everywhere (`vh` fallbacks where they work).
  - Every hover fill guarded by `@media (hover: hover)` — touch never
    leaves a stuck state.
  - `overscroll-behavior: contain` on scroll regions;
    `-webkit-tap-highlight-color: transparent` in the reset.
  - `--fl-z-sheet` layer token (standard sheet below the snackbar).

### Changed

- **Scrim token** aligned to M2: `--fl-scrim: rgb(0 0 0 / 0.32)` (was
  `rgb(32 33 36 / 0.45)`), shared by dialog, sheet and drawer.
- Dialog surface padding moved from the surface to the slots (surface
  padding 0) — the same one-owner-per-contract rule as the field box.
- The 0.4 roadmap theme is "Feedback & containment" — **"overlay" is
  retired as a concept** (Material has no overlay component); shared
  behavior lives on each component page with cross-links.

### Removed

- `demos/overlay.html` and the planned "overlays guide page".
- `.fl-sheet__handle` and the bottom-sheet's `min(86vh, 640px)` initial
  height (superseded by the 50dvh cap).
- `.fl-dialog__option` (renamed to the shared `.fl-option`).

### Deliberately not implemented

- **Expanding bottom sheet** — retired, not deferred: on the web its
  collapsed state is a FAB/sticky action bar and its expanded state is
  `fl-dialog--fullscreen`; the only unique part is the morph state
  machine.
- **Swipe-to-dismiss** and the **Android back-gesture shim** — documented
  gaps; the designed fix (history state + dialog stack) is a 0.5 item.
- **Elevation** on sheets/dialogs — flat 1px borders, unchanged
  deviation.

## [0.3.0] — 2026-11-11

The forms release: real forms are buildable with zero JavaScript, and
semantic state tokens exist before a second theme does.

### Added

- **Text field variants** (first library component growth since 0.1):
  - `fl-field__help` — helper text slot under the input, inside the label.
  - `fl-field--error` and an `aria-invalid="true"` hook — either alone styles
    the error border/ring and recolors the helper text; driven by the new
    semantic token `--fl-error` (#d93025).
  - `fl-field--filled` — M2 filled variant: tinted fill, flat accent bottom
    indicator (2px on focus via inset box-shadow); composes with the error
    state.
  - `textarea.fl-field__input` — auto-height, vertical-only resize.
  - `fl-field__input:disabled` — flat dimmed treatment, hover darkening off.
  - New docs page (Text fields) + `demos/fields.html` live demo.
- **Selection controls** — checkbox, radio and switch as native inputs with
  `appearance:none`, drawn flat (18px boxes/rings, 36×20 switch pill):
  - `fl-check` — 2px-corner box; checked = accent fill + surface check.
  - `fl-radio` — accent ring + gradient dot on check (follows `--fl-accent`).
  - `fl-switch` — checkbox with `role="switch"`; M2 state pair (off: gray
    track/surface thumb, on: tint track/accent thumb), thumb slides via
    background-position.
  - Disabled treatments for all three; keyboard and form semantics stay
    native. Zero JS.
  - New docs page (Selection controls) + `demos/selection.html`.
- **Select** — the styled native `<select>` in the field family: same 44px
  box and hover/focus/error/disabled states as `fl-field__input`, chevron
  drawn in CSS (platform arrow removed via `appearance:none`). The open
  dropdown stays browser-styled by design; a custom listbox menu is planned
  for 0.4/0.5 with the overlay infrastructure. New docs page + dedicated
  `demos/select.html`.
- **Buttons and Cards: full docs pages** with dedicated live demos
  (`demos/buttons.html`, `demos/cards.html`) — promoted from stubs.

### Changed

- **Buttons: disabled and pressed states.** `fl-btn:disabled` now has a flat
  gray treatment per variant (`--fl-divider` fill on filled, `--fl-divider`
  border + `--fl-disabled` label on outline, `--fl-disabled` label on text);
  outline/text gained `:active` fills in `--fl-divider`, matching the icon
  button's pressed depth. Rules are ordered after the variant hovers so the
  cascade is correct. The Buttons docs page no longer documents these as
  gaps.

## [0.2.0] — 2026-11-11

The docs release: the site is built with Flint itself and published on
GitHub Pages.

### Added

- **Documentation site** (`docs/`, source in `docs-site/`): a static
  Material-2-style docs site built with Eleventy and styled entirely with
  Flint itself — same tokens, flat 1px borders, no shadows.
  - One page per shipping component (bottom-nav, rail, drawer, auth, lists)
    with the Design / Implementation two-tab pattern: usage, anatomy,
    behavior and accessibility guidance; live demo embedded from
    `demos/`, copy-button snippets, and per-component token tables.
  - Get started guide (shells comparison, `aria-current` selection, no-JS
    notes, token reference) and the roadmap rendered from `ROADMAP.md`.
  - Honest stub pages for planned components marked *Planned · 0.4* —
    nothing to use yet.
  - Fully static output viewable over `file://` (no server needed); mobile
    sidebar reuses the library's own drawer mechanics; sidebar name filter,
    TOC scrollspy and copy buttons are progressive enhancements that degrade
    gracefully without JS.
  - Published at `https://kimzercode.github.io/flint-ui/` (GitHub Pages,
    serving `docs/` from main).
- Root `index.html` now links to the docs site.

### Changed

- **Auth shell: no app chrome.** The auth demo no longer shows a top app bar —
  auth is a pre-app screen with nothing to navigate to, so the shell is a
  plain page with the centered card (whose title is the page's `h1`). The
  CSS was already header-agnostic (`fl-shell-auth` centers whatever you put
  in it); the demo, docs and README now reflect that. No logo slot by
  default — add your wordmark above the card title if you want one.

## [0.1.0] — 2026-11-06

First versioned release.

### Added

- Design token system on `:root` — flat Google 2019–2020 palette, 4px spacing
  grid, type scale, shape and motion tokens. No shadows anywhere: surface
  separation comes from 1px borders and tinted states.
- Global modern CSS reset (`border-box`, zero margins, form-control font and
  color inheritance, block media).
- App shells, all sharing one token system:
  - **Bottom-nav** — stacked icon-over-label tabs below 905px (M2-style
    color-only selection); inline pills in a centered 56px bar above.
  - **Drawer** — off-canvas behind a scrim below 905px, permanent 280px column
    above; Gmail-2020 inset pill navigation.
  - **Rail** — bottom tab bar on mobile becomes an 80px icon rail on desktop,
    same markup.
  - **Auth** — centered 400px card, zero JS.
- List component — single/two/three-line rows (48/72/88px) and dense variants
  (40/60/76px), 24px icon or 40px avatar leading slots, trailing meta zone,
  opt-in dividers, `aria-current` selection, `aria-disabled` support.
- Building blocks: top bar, tab bar, FAB, badges, cards, buttons
  (filled/outline/text), outlined text field, nav list, icon placeholder,
  icon button, divider, scrim.
- `flint.js` (~50 lines): nav selected state via `aria-current`, drawer
  open/close with Escape and scrim dismissal. Everything renders correctly
  with JS disabled; state can be set server-side.
- Wireframe icon placeholders (no icon font) that take the active color on
  selected items — previewing what a real icon should do.
- Demos for every shell and the list component. Zero network requests: no
  webfonts, no icon fonts, no images.
