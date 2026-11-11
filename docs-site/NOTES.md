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
| Button disabled state styling (buttons page documents the gap) | interim: `[disabled]` blocks clicks but keeps full color; docs suggest opacity | `fl-btn[disabled]` + `--fl-disabled`-based treatment in a patch/0.3 |
| `:active` state for outline/text buttons (only filled has one) | outline/text rest on hover fill | symmetric `:active` fills in a patch/0.3 |
| Whole-clickable card (feed items that navigate) | cards host controls; rows handle whole-target clicks | documented "link-cover" pattern or `a.fl-card` support |
