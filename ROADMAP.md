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
| **0.5.0** | Data display + app chrome | Data table, standalone tabs, pagination, avatar, chips (split from badges) — plus the app-chrome set that enables a Gmail/Keep-style master-detail app build: **menu** (dropdown with scrim, Escape, instant dismiss — deferred here from 0.4), **side sheet** (standard + modal, completes the sheet family; audit against a `sheets-side-docs/` reference folder before building), **top app bar** promoted to a component (own docs page, safe-area top inset, action ordering, scroll-hide, contextual action bar state; extended/prominent/dense/images-in-bar/translucency deliberately discarded — mobile-first native feel), **split shell** (list pane + detail pane ≥600px), **checkbox-driven selection state** on list rows, docs recipes (empty state, card grid). **Acceptance: the notes prototype (`prototype/test-mdl2.html`) rebuilt entirely on Flint components as the first `samples/` entry — zero hand-rolled chrome; only the app logic (data, undo) is author code.** |
| **0.6.0** | Theming | Dark theme (token-driven, cheap), theming guide, brand-override example. |
| **0.7.0** | Quality | Accessibility audit, reduced-motion support, browser matrix, icon guidance (real SVG set vs. placeholders). |
| **1.0.0** | API freeze | Class-naming promise, full docs coverage. The "mini design system" milestone. |

Deliberately deferred (v1+ or never): JS framework wrappers, SCSS/build
tooling, theming engines, RTL support.

Sequencing rule: **build the docs shell thin, then never add a component
without its page.** Docs without components is an empty shell; components
without docs are a pile of CSS.
