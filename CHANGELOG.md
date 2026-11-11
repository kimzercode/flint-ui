# Changelog

All notable changes to Flint UI are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com); versioning follows
[SemVer](https://semver.org) — during 0.x the API may still change.

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
