# Flint UI — Product Roadmap

Flint UI's goal: a mini design system in the spirit of Material Design 2 —
a small, opinionated set of flat, Google-flavored app shells and components,
backed by a docs site that makes each piece copy-pasteable.

Guiding principles:

- **Docs ship with every component.** A component without a docs page is not
  done. A docs page without a component is a lie.
- **The docs site is built with Flint.** Docs needs (breadcrumbs, callouts,
  code blocks, sidebar) become real component requirements, not guesses.
- **Zero dependencies, forever.** No build step for users; copy two files and
  go. Docs tooling must not leak into the library.
- **Flat, 1px borders, no shadows** — the Material 2019–2020 look — is the
  design constraint that keeps the library small and coherent.
- **Distribution is copy-paste** (the shadcn model): the docs' core feature is
  a copy button on every snippet.

## Roadmap

| Version | Theme | Contents |
|---|---|---|
| **0.2.0** | Docs foundation | `docs/` static site built with Flint (shell from the m2-mock prototype), page template with copy-button snippets, docs pages for the five shipping components (bottom-nav, drawer, rail, auth, lists), SVG anatomy illustrations. Buttons and cards already exist as 0.1 building blocks — their full pages follow as docs-only work; dialog and bottom sheet are planned for 0.4. Prereq: repo pushed to GitHub. |
| **0.3.0** | Forms | ✅ Checkbox, radio, switch, styled native select, text-field variants (filled, error/helper, textarea), button disabled/active states — first library growth since 0.1, driven by docs needs. Zero JS forms; semantic `--fl-error` token precedes theming. |
| **0.4.0** | Feedback & containment | ✅ Dialog (five M2 types, non-dismissible opt-out), bottom sheet (modal + standard, 50dvh cap, grid contents, no drag handle), snackbar (one at a time, 4s auto-dismiss), progress (linear + circular, zero JS), tooltip (CSS-only, four directions) — plus the forms-completion pass: field architecture rebuilt (box owns the chrome), affixes, icons, counter, password toggle, valid-HTML label contract. "Overlay" retired as a concept. |
| **0.5.0** | Data display + app chrome | ✅ Data table (1px outline, sticky selection, `aria-sort`, link paging), tabs (radio-driven, zero JS), chips + avatar, **menu** (native Popover API), **top app bar** promoted (safe-area inset, scroll-hide, contextual action bar state, transparent variant + search-in-bar), checkbox-driven list selection, **side sheet** (standard + modal), interactive cards, FAB/snackbar anchoring tokens, docs recipes (card grid, empty state, Keep-style shell). Master-detail split: still not in Flint (App shells guide later). **Acceptance met:** `samples/notes` rebuilds the prototype entirely on Flint in the Keep-web form factor — pinned 280px drawer from 905px, off-canvas below, full-screen dialog that becomes a 560px card, real Undo — zero hand-rolled chrome; probe 37/37. |
| **0.6.0** | Theming | Dark theme (token-driven, cheap), theming guide, brand-override example. |
| **0.7.0** | Quality | Accessibility audit, reduced-motion support, browser matrix, icon guidance (real SVG set vs. placeholders). |
| **1.0.0** | API freeze | Class-naming promise, full docs coverage. The "mini design system" milestone. |

Deliberately deferred (v1+ or never): JS framework wrappers, SCSS/build
tooling, theming engines, RTL support.

Sequencing rule: **build the docs shell thin, then never add a component
without its page.** Docs without components is an empty shell; components
without docs are a pile of CSS.
