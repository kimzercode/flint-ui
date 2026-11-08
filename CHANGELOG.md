# Changelog

All notable changes to Flint UI are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com); versioning follows
[SemVer](https://semver.org) — during 0.x the API may still change.

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
