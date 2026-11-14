# Docs chrome → library component requirements

The docs site is built with Flint. Anything the docs need that Flint doesn't
provide is logged here as a real component requirement (ROADMAP principle:
"docs needs … become real component requirements, not guesses"), instead of
growing bespoke docs CSS forever.

| Docs need | Current workaround | Future library item |
|---|---|---|
| Layout grid (`sidebar 280px + content`) for docs pages | `.docs-shell` grid in docs.css | A content-layout shell (`fl-shell-docs`?) when exact utility shell variants are solid |
| Docs sidebar with sticky column + current-page highlight | docs.css + `aria-current` pattern (already the library pattern) | Maybe ship the aria-current nav-row pattern as public API docs, no new CSS |
| Code snippet blocks with copy buttons | docs.css `.docs-snippet` + docs.js (step 3+) | Code block component if docs prove it's generally wanted |
| Callout/update card (M2 "MD3 is available" card) | docs.css `.docs-callout` | Candidate for a `fl-callout` in 0.4 feedback release |
| Docs sidebar on phones | **Reuses `.fl-drawer` + `.fl-scrim` + flint.js toggling as-is** (hamburger in the docs topbar, data-fl-drawer-open) | Proof the drawer component generalizes beyond app shells |
| Scrollspy TOC | docs-only JS | Docs-only forever, not a library component |
| Docs sidebar inner scrolling when the component list outgrows the viewport | none (list is short; sticky wrapper intentionally has no `overflow-y`) | M2-style scrolling sidebar if the index reaches ~20 entries |
| Button disabled state styling (was documented as a 0.1 gap) | ~~interim opacity workaround~~ **Resolved in 0.3**: `fl-btn:disabled` gets flat gray treatment per variant (`--fl-divider` fill/border, `--fl-disabled` label) |
| `:active` state for outline/text buttons (only filled had one) | ~~hover fill only~~ **Resolved in 0.3**: outline/text `:active` take `--fl-divider`, matching icon-btn's pressed depth |
| Whole-clickable card (feed items that navigate) | cards host controls; rows handle whole-target clicks | documented "link-cover" pattern or `a.fl-card` support |
| Docs needed field variants (error state, helper text, filled, textarea, disabled) to build real form pages | 0.1 had only the base outlined field | **Shipped in 0.3**: `fl-field__help`, `fl-field--error` + `aria-invalid` hook, `fl-field--filled`, `textarea.fl-field__input`, `:disabled` — plus the `--fl-error` token |
| Dialog demos need a destructive confirm idiom (error-colored action) | text buttons had no destructive treatment | **Shipped in 0.4**: `fl-btn--danger` — `--fl-error` label with the text-button state layer |
| Dialog docs need long-content behavior (scrollable body) without a second scrollbar | step-1 surface scrolled as one block | **Shipped in 0.4**: surface is a flex column — body scrolls (`fl-dialog__body`), title and actions pinned |
