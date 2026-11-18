# Notes — the 0.5 acceptance sample

A small note-taking app built **entirely on Flint** — no hand-rolled chrome, no
icons of its own, no build step. It is the rebuild of `prototype/test-mdl2.html`
and the gate for 0.5.0: if a component could not carry its part, it showed up
here.

Open `samples/notes/index.html` directly (it uses relative paths: `../../css`
and `../../js`), or visit `/samples/notes/` on the docs site.

```
samples/notes/
  index.html   markup, the six-note seed, every component
  notes.css    author CSS: grid rhythm, preview clamp, empty state (≈60 lines)
  notes.js     app logic: model, views, editor, menu, undo (≈250 lines)
  README.md    this file
```

## What each surface is made of

| Surface | Component |
|---|---|
| App shell | `.fl-shell-drawer` — off-canvas drawer on phones, the permanent 280px column from 905px |
| Top bar | `.fl-top-bar--transparent` + `.fl-top-bar__title` + the search pill (`fl-field` with a rounded box) |
| Drawer | `.fl-drawer`, `.fl-drawer__header`, `.fl-nav`, `.fl-nav-item`, `.fl-section-label`, `.fl-divider`, `.fl-drawer__footer` |
| Note grid | `.fl-card-grid` recipe: `.fl-card` as a real `<button>`, `.fl-card__title`, `.fl-card__text`, a `.fl-chip` tag |
| New note | `.fl-fab` (`--fl-fab-inset` handles the tab-less app) |
| Editor | `fl-dialog--fullscreen` + `.fl-dialog__header` (close · title · ⋮), `.fl-dialog__body` |
| Fields | `.fl-field` + `.fl-field__label` + `.fl-field__box` + `.fl-field__input`; the body is a `--grow` textarea |
| Label picker | `.fl-chip-set` with choice chips (native radios in a `fieldset`) |
| Editor ⋮ menu | `.fl-menu[popover]` + `.fl-option` (anchored by `flint.js`) |
| Feedback | `.fl-snackbar` + `flint.snackbar.show/hide`, one action (Undo / Open) |
| Empty state | composition (M2 has no empty-state component) |

Nothing in this folder re-implements a Flint behaviour: the drawer, the dialog,
the menu and the snackbar come from `flint.js`; the focus trap, Escape,
light-dismiss and top-layer stacking come from `<dialog>` and `popover`.

## App logic (this is author code, by contract)

- **State:** an in-memory array. Reload resets it. `?state=empty` starts with no
  notes; `?state=snack` opens the snackbar preview.
- **Seed = markup:** the notes in `index.html` are the seed; `notes.js` reads
  them into the model on load, so the sample data lives in one place.
- **Views:** Notes (unarchived), Archive (archived) and the three fixed labels
  (Work / Personal / Ideas). The bar title names the current view.
- **Search** filters the current view live (title + body).
- **Editor:** live two-way binding — there is no Save button, closing saves.
  A brand-new note nobody typed into is discarded, not left as "Untitled".
- **Labels:** one per note, chosen with the chip radios. Creating a note while a
  label view is active pre-assigns that label.
- **⋮ menu:** Archive / Unarchive, Duplicate (inserts the copy right after the
  original) and Delete. All three close the editor.
- **Undo is real:** the snackbar's Undo re-inserts a deleted note at its old
  index or reverses an archive; after a duplicate, the action becomes **Open**
  and jumps to the copy. Same one-action sheet, no second structure.

## No JavaScript

The seeded grid renders (it is markup), the shell renders, and the page is
readable. Nothing opens the editor and the search does not filter: the app
layer is `notes.js`. That is the honest no-JS state of a client-side sample —
documented, not hidden.

## Accessibility

- The editor is a native `<dialog>` opened with `showModal()`: focus trap,
  Escape, inert background and focus return are the platform's.
- Every icon-only control has a label; the close control is labelled "Close
  note", the ⋮ trigger "Note actions".
- Labels are a native `fieldset`/`legend` + radios, so the group is named
  without ARIA.
- Opening an existing note focuses the body (the thing you most often change);
  a new note focuses the title. Closing returns focus to that note's card, or to
  the first card when the note left the view (archive, delete).
- The snackbar is a `role="status"` region, so Undo is announced politely
  without stealing focus.

## Deliberate deviations (recorded in `docs-site/NOTES.md`)

1. The bar keeps a **view title** on phones — Keep hides it; three views share
   one layout here, and the title is the orientation.
2. **One card column below 600px**, not Keep's two: the documented 240px grid
   floor gives ~20-character lines at 390px.
3. The editor uses **outlined fields**, not Keep's borderless canvas. The
   field's chrome is a library contract; a borderless variant is a 0.6
   candidate, not a gate-time override.
4. **FAB instead of the compose bar** — the compose bar's four actions (pen,
   image, mic, checklist) are not in the library, and faking them would lie.
5. **One label per note**, assigned inline. Keep allows several and opens a
   separate picker.
6. The editor header is **close · title · ⋮** (M2 full-screen anatomy) rather
   than Keep's pin/reminder/archive icon row.
7. **Archive is real; Trash is not.** Delete is undo-only, which keeps the
   snackbar honest.
8. Duplicating **closes the editor** so the snackbar (which cannot render above
   a modal dialog) is visible. Keep keeps the editor open.

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
