# Notes — the 0.5 acceptance sample

A small note-taking app built **entirely on Flint** — no hand-rolled chrome, no
icons of its own, no build step. It is the rebuild of
`prototype/test-mdl2.html` and the gate for 0.5.0: if a component could not
carry its part, it showed up here.

**Two chrome arrangements, one app.** Both pages share `notes.css` and
`notes.js`; they differ only in where two controls sit.

| Page | Hamburger | Note actions (⋮) |
|---|---|---|
| `index.html` — Keep's arrangement | inside the search pill | in the editor's meta footer |
| `classic.html` — classic arrangement | beside the pill, its own button | in the editor's top bar |

Open either file directly (they use relative paths: `../../css` and `../../js`),
or visit `/samples/notes/` and `/samples/notes/classic.html` on the docs site.
The drawer footer links the two.

```
samples/notes/
  index.html     Keep's chrome + the seed notes (the data lives here)
  classic.html   the same app with the classic chrome
  notes.css      author CSS: bar alignment, masonry fallback, canvas, empty state
  notes.js       app logic: model, views, masonry, editor, labels, menu, undo
  README.md      this file
```

## What each surface is made of

| Surface | Component |
|---|---|
| App shell | `.fl-shell-drawer` — off-canvas drawer below 905px, the permanent 280px column above |
| Top bar | `.fl-top-bar--transparent` with **no visible title**: the search pill takes the title's slot. Brand at ≥905, aligned over the drawer column |
| Search pill | `fl-field` with a rounded box; `index.html` also puts a real `<button>` in its leading slot |
| Drawer | `.fl-drawer`, `.fl-drawer__header` (phones), `.fl-nav`, `.fl-nav-item`, `.fl-section-label`, `.fl-divider`, `.fl-drawer__footer` |
| Note grid | `.fl-card` as a real `<button>`, `__title`, `__text`, a `.fl-chip` tag — packed into columns by `notes.js`, with balanced CSS columns as the no-JS fallback |
| Create | `.fl-fab` at both widths (no compose bar) |
| Editor | `fl-dialog--fullscreen` — full-bleed below 600px, a 560px card above. Header: back · screen-reader title · (⋮ on `classic.html`) |
| Canvas | two naked controls (`notes-canvas__title` / `__body`), authored by the sample — not a field |
| Meta footer | `.fl-dialog__actions` on a hairline: "Edited …" and, on `index.html`, the ⋮ button |
| Label picker | a second `fl-dialog` with `.fl-option` radio rows, opened from ⋮ → Labels… |
| Editor ⋮ menu | `.fl-menu[popover]` + `.fl-option`, a **child of the dialog** (a modal makes its siblings inert) |
| Feedback | `.fl-snackbar` + `flint.snackbar.show/hide`, one action (Undo / Open) |
| Empty state | composition (M2 has no empty-state component) |

Nothing in this folder re-implements a Flint behaviour: the drawer, the dialog,
the menu and the snackbar come from `flint.js`; the focus trap, Escape,
light-dismiss and top-layer stacking come from `<dialog>` and `popover`.

## App logic (this is author code, by contract)

- **State:** an in-memory array. Reload resets it. `?state=empty` starts with no
  notes; `?state=snack` opens the snackbar preview. Both pages accept both.
- **Seed = markup:** the notes in `index.html`/`classic.html` are the seed;
  `notes.js` reads them into the model on load, so the sample data lives in one
  place. The archived seed card carries `hidden`, so it does not show up in the
  list with scripting off.
- **Views:** Notes (unarchived), Archive (archived) and the three fixed labels
  (Work / Personal / Ideas). The drawer's selected row names the current view;
  the bar has no visible title.
- **Search** filters the current view live (title + body).
- **Masonry:** cards are placed into the shortest column, row-major (Keep's
  order). 2 columns below 600px, then 240px-minimum columns up to four. The
  placement is ~20 lines in `notes.js`; without it the stylesheet's balanced
  CSS columns still render the grid.
- **Editor:** live two-way binding — there is no Save button, closing saves.
  A brand-new note nobody typed into is discarded, not left as "Untitled".
- **Labels:** one per note, chosen in the picker dialog. Creating a note while a
  label view is active pre-assigns that label.
- **⋮ menu:** Labels…, Duplicate (inserts the copy right after the original),
  Archive/Unarchive and Delete. Everything but Labels closes the editor.
- **Undo is real:** the snackbar's Undo re-inserts a deleted note at its old
  index or reverses an archive; after a duplicate, the action becomes **Open**
  and jumps to the copy. Same one-action sheet, no second structure.

## No JavaScript

The seeded grid renders (it is markup, in balanced CSS columns), the shell
renders, and the page is readable. Nothing opens the editor and the search does
not filter: the app layer is `notes.js`. That is the honest no-JS state of a
client-side sample — documented, not hidden.

## Accessibility

- The editor is a native `<dialog>` opened with `showModal()`: focus trap,
  Escape, inert background and focus return are the platform's.
- The bar's `<h1>` is visually hidden, not removed — heading navigation still
  announces the current view, exactly as the drawer row does visually.
- Every icon-only control has a label: "Open navigation", "Close navigation",
  "Close note", "Note actions".
- The editor canvas has no visible labels, so both controls carry `aria-label`
  ("Title", "Note") and a placeholder. The caret is the focus indicator, as in
  Keep (recorded deviation).
- The label picker is a `form role="radiogroup"` whose rows are `<label>`s, so
  the group is named and the whole row is the target; Save closes with
  `method="dialog"`.
- Opening an existing note focuses the body (the thing you most often change);
  a new note focuses the title. Closing returns focus to that note's card, or to
  the first card when the note left the view (archive, delete).
- The snackbar is a `role="status"` region, so Undo is announced politely
  without stealing focus.

## Deliberate deviations (recorded in `docs-site/NOTES.md`)

1. **No view title in the bar.** Keep hides it too; here the drawer's selected
   row names the view and the bar's `h1` is screen-reader-only.
2. **The editor is a canvas, not a form.** The title and body are naked
   controls composed by the sample; `.fl-field` still owns every field's chrome
   and a borderless editor is not a field variant. The caret is the only focus
   indicator (Keep's behaviour).
3. **FAB instead of the compose bar**, at every width. The bar's four actions
   (pen, image, mic, checklist) do not exist in the library; faking them would
   lie.
4. **Masonry is placed by the sample.** CSS columns balance but flow
   top-down; a row-aligned grid leaves holes. The no-JS fallback is CSS
   columns.
5. **Two columns on phones**, Keep's grid, instead of the recipe's 240px floor.
6. **No hamburger on desktop.** The drawer is pinned, so a toggle would be a
   dead control; Keep's web bar has one because its drawer collapses.
7. **One label per note**, chosen in a small dialog instead of Keep's inline
   chip row.
8. **Archive is real; Trash is not.** Delete is undo-only, which keeps the
   snackbar honest.
9. **Duplicating closes the editor** so the snackbar (which cannot render above
   a modal dialog) is visible. Keep keeps the editor open.
10. **Two pages, not a switcher.** The chrome delta is markup placement, so
    each page is plain HTML with no variant logic in CSS or JS.

## Out of scope (and why)

Reminders, pinning, colours/themes, images, drawings, voice, checklists,
collaborators, sharing, label CRUD, Trash, bulk select, grid/list toggle and
the tablet split pane. Each is a product feature, and most would need a
component Flint does not have (a date picker, a colour system, a drawing
canvas). Half-implementing them is how a sample starts to lie.

## Known gaps

- **No persistence** — the model is in memory.
- Real SVG glyphs are not shipped: every icon is the `.fl-icon` placeholder.
- The editor is full-screen on phones and a 560px card above 600px; there is no
  tablet split pane (Keep's dual pane uses per-pane bars and is device-native).
