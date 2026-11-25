/* Notes sample — the app layer. Everything below is author logic: a model in
   memory, a render pass, and the wiring between Flint's components. The library
   supplies the components, the platform supplies the dialog/popover focus
   behaviour; nothing here re-implements either.

   One script serves both pages (index.html, classic.html): the pages differ in
   where the hamburger and the editor's more button sit, never in behaviour, so
   nothing here looks for a layout.

   Deliberately out of scope (see README): persistence, reminders, pinning,
   colours, images, checklists, sharing, multiple labels per note, Trash. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var grid = $("grid");
  var editor = $("editor");
  var editorTitle = $("editor-title");
  var titleInput = $("edit-title");
  var bodyInput = $("edit-body");
  var metaLine = $("edit-meta");
  var viewTitle = $("view-title");
  var searchInput = $("search");
  var fab = $("new-note");
  var empty = $("empty");
  var emptyTitle = $("empty-title");
  var emptyText = $("empty-text");
  var menu = $("note-menu");
  var menuArchive = $("menu-archive");
  var labelsDialog = $("labels-dialog");
  var labelsForm = $("labels-form");
  var snack = $("snack");
  var snackMsg = $("snack-msg");
  var snackAction = $("snack-action");

  /* The one element that opens the note menu — in the footer on index.html,
     in the top bar on classic.html. */
  var moreButton = document.querySelector('[popovertarget="note-menu"]');

  /* The three labels are a fixed set — no label CRUD in a sample. They exist to
     exercise the chip component and view filtering, nothing more. */
  var LABELS = { work: "Work", personal: "Personal", ideas: "Ideas" };
  var VIEWS = { notes: "Notes", archive: "Archive", work: "Work",
                personal: "Personal", ideas: "Ideas" };

  /* --- Model ------------------------------------------------------------- *
     The seed is the markup, not a second copy of it: the notes above are
     converted to objects on load, then the grid is re-rendered from the model.
     Editing the HTML seed is the only place to change the sample data. */
  var nextId = 1;
  var notes = [].map.call(grid.querySelectorAll("[data-note]"), function (el) {
    var note = {
      id: parseInt(el.getAttribute("data-id"), 10) || nextId,
      title: el.querySelector(".fl-card__title").textContent.trim(),
      body: el.querySelector(".fl-card__text").textContent.trim(),
      label: el.getAttribute("data-label") || "",
      meta: el.getAttribute("data-meta") || "Edited earlier",
      archived: el.hasAttribute("data-archived")
    };
    nextId = Math.max(nextId, note.id + 1);
    return note;
  });

  var preview = new URLSearchParams(location.search).get("state");
  if (preview === "empty") notes = [];

  var view = "notes";
  var query = "";
  var current = null;       // the note in the editor
  var isNewBlank = false;   // created by the FAB, not typed into yet
  var pending = null;       // { run } — what the snackbar action will do

  function log(action) { console.log("action:" + action); }

  /* --- Render ------------------------------------------------------------ */
  function inView(note) {
    if (view === "archive") {
      if (!note.archived) return false;
    } else {
      if (note.archived) return false;
      if (LABELS[view] && note.label !== LABELS[view]) return false;
    }
    if (!query) return true;
    var haystack = (note.title + " " + note.body).toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function cardFor(note) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = "fl-card";
    el.setAttribute("data-note", "");
    el.setAttribute("data-id", note.id);
    el.setAttribute("data-meta", note.meta);
    el.setAttribute("data-label", note.label);

    var title = document.createElement("span");
    title.className = "fl-card__title";
    title.textContent = note.title || "Untitled";
    el.appendChild(title);

    var body = document.createElement("span");
    body.className = "fl-card__text";
    body.textContent = note.body;
    el.appendChild(body);

    if (note.label) {
      var tag = document.createElement("span");
      tag.className = "fl-chip";
      tag.textContent = note.label;
      el.appendChild(tag);
    }
    el.addEventListener("click", function () { openEditor(note, false, el); });
    return el;
  }

  /* --- Masonry ----------------------------------------------------------- *
     Keep's grid packs cards into the shortest column, row-major. CSS cannot
     say that (columns flow top-down, grid aligns rows), so the sample places
     the cards itself; the stylesheet's balanced columns are the no-JS
     fallback. The gap comes from CSS, so both layouts stay in step. */
  var MASONRY_MIN = 240;
  var masonryFrame = 0;

  function layoutGrid() {
    var cards = [].slice.call(grid.querySelectorAll("[data-note]"));
    grid.classList.add("is-masonry");

    if (!cards.length || !grid.clientWidth) {
      grid.style.height = "0px";
      return;
    }

    var gap = parseFloat(getComputedStyle(grid).getPropertyValue("--notes-gap")) || 0;
    var width = grid.clientWidth;
    var columns = window.matchMedia("(min-width: 600px)").matches
      ? Math.max(1, Math.min(4, Math.floor((width + gap) / (MASONRY_MIN + gap))))
      : 2;
    var columnWidth = (width - (columns - 1) * gap) / columns;

    cards.forEach(function (card) { card.style.width = columnWidth + "px"; });

    var heights = [];
    for (var i = 0; i < columns; i++) heights.push(0);

    cards.forEach(function (card) {
      var shortest = heights.indexOf(Math.min.apply(null, heights));
      card.style.transform = "translate(" +
        Math.round(shortest * (columnWidth + gap)) + "px," +
        Math.round(heights[shortest]) + "px)";
      heights[shortest] += card.offsetHeight + gap;
    });

    grid.style.height = Math.round(Math.max.apply(null, heights) - gap) + "px";
  }

  function layoutSoon() {
    if (masonryFrame) return;
    masonryFrame = requestAnimationFrame(function () {
      masonryFrame = 0;
      layoutGrid();
    });
  }

  window.addEventListener("resize", layoutSoon);

  function render() {
    var shown = notes.filter(inView);

    grid.replaceChildren.apply(grid, shown.map(cardFor));
    grid.hidden = shown.length === 0;

    var nothing = shown.length === 0;

    empty.hidden = !nothing;
    if (nothing) {
      if (notes.length === 0) {
        emptyTitle.textContent = "No notes yet";
        emptyText.textContent = "Notes you create appear here. Press the button in the corner to start one.";
      } else if (query) {
        emptyTitle.textContent = "No matching notes";
        emptyText.textContent = "Try a different word, or clear the search.";
      } else if (view === "archive") {
        emptyTitle.textContent = "Nothing archived";
        emptyText.textContent = "Archived notes leave the list and wait here.";
      } else if (LABELS[view]) {
        emptyTitle.textContent = "No " + LABELS[view] + " notes";
        emptyText.textContent = "Give a note this label from its editor to see it here.";
      } else {
        emptyTitle.textContent = "No notes here";
        emptyText.textContent = "Notes you move to this view appear here.";
      }
    }

    viewTitle.textContent = VIEWS[view];
    layoutGrid();
  }

  /* --- Views & search ----------------------------------------------------- */
  /* One owner for the current view: the title, the drawer's aria-current and
     the grid all read it. Keep keeps the FAB on Archive too, so the snackbar
     sits at one height in every view (see the snackbar's FAB clearance). */
  function setView(name) {
    view = name;
    [].forEach.call(document.querySelectorAll("[data-view]"), function (el) {
      if (el.getAttribute("data-view") === view) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
  }

  $("nav").addEventListener("click", function (e) {
    var row = e.target.closest("[data-view]");
    if (!row) return;
    setView(row.getAttribute("data-view"));
    flint.drawer(false);   /* mobile: navigation closes the drawer (Keep) */
    render();
  });

  searchInput.addEventListener("input", function () {
    query = searchInput.value.trim().toLowerCase();
    render();
  });

  /* --- Editor ------------------------------------------------------------- */
  function openEditor(note, isNew, invoker) {
    current = note;
    isNewBlank = !!isNew;
    titleInput.value = note.title;
    bodyInput.value = note.body;
    metaLine.textContent = note.meta;
    editorTitle.textContent = isNew ? "New note" : "Edit note";
    menuArchive.textContent = note.archived ? "Unarchive" : "Archive";
    flint.dialog.open(editor, invoker);
    (isNew ? titleInput : bodyInput).focus();
  }

  function closeEditor() {
    flint.dialog.close(editor);
  }

  /* Live binding: there is no Save button (Keep's model), so the model and the
     meta line update on every keystroke. */
  editor.addEventListener("input", function (e) {
    if (!current) return;
    if (e.target === titleInput || e.target === bodyInput) {
      current.title = titleInput.value;
      current.body = bodyInput.value;
      current.meta = "Edited just now";
      metaLine.textContent = current.meta;
    }
  });

  /* Any close path — the back control, Escape, a scrim click — lands here.
     A brand-new note nobody typed into is discarded, not left as "Untitled". */
  editor.addEventListener("close", function () {
    var note = current;
    var wasNew = isNewBlank;
    var discarded = wasNew && !titleInput.value.trim() && !bodyInput.value.trim();
    if (discarded) {
      notes = notes.filter(function (n) { return n !== note; });
      log("discard-blank");
    }
    current = null;
    isNewBlank = false;

    /* A note is never born archived, so one composed from Archive belongs to
       Notes; take the view with it rather than dropping the author back into
       a list the new note is not in. A discarded blank changes nothing, and
       archiving the note from its own menu keeps the view. */
    if (!discarded && wasNew && view === "archive" && !note.archived) setView("notes");

    render();

    /* The render replaced the card that had focus; put focus back on it, or on
       the first card / the FAB when it left the view. */
    var again = note && notes.indexOf(note) !== -1 && inView(note);
    var target = again ? grid.querySelector('[data-id="' + note.id + '"]')
                       : grid.querySelector("[data-note]");
    if (!target) target = fab;
    if (target) target.focus();
  });

  /* --- FAB ---------------------------------------------------------------- *
     Present in every view, Archive included (Keep's placement, and it keeps
     the snackbar's clearance at one height). A note is never born archived,
     so one composed from Archive is handed to Notes when the editor closes. */
  fab.addEventListener("click", function () {
    log("new-note");
    flint.snackbar.hide(snack);
    var note = {
      id: nextId++,
      title: "",
      body: "",
      /* Creating inside a label view pre-assigns that label (Keep's behaviour). */
      label: LABELS[view] || "",
      meta: "New note",
      archived: false
    };
    notes.unshift(note);
    openEditor(note, true, fab);
  });

  /* --- Labels picker ------------------------------------------------------ *
     A second modal over the editor: opening it must not close the note, and
     Save writes the chosen label back to the note that is already open. */
  var labelRadios = [].slice.call(labelsForm.querySelectorAll('input[name="label"]'));

  function openLabels() {
    if (!current) return;
    labelRadios.forEach(function (radio) {
      radio.checked = radio.value === (current.label || "");
    });
    flint.dialog.open(labelsDialog, moreButton);
  }

  labelsDialog.addEventListener("close", function () {
    var save = labelsDialog.returnValue === "save";
    labelsDialog.returnValue = "";   /* the next open decides again */
    if (!save || !current) return;
    var picked = labelsForm.querySelector('input[name="label"]:checked');
    current.label = picked ? picked.value : "";
    current.meta = "Edited just now";
    metaLine.textContent = current.meta;
    log("label:" + (current.label ? current.label.toLowerCase() : "none"));
  });

  /* --- Snackbar ----------------------------------------------------------- */
  function showSnack(message, label, run, actionLog) {
    pending = { run: run, log: actionLog };
    snackMsg.textContent = message;
    snackAction.textContent = label;
    flint.snackbar.show(snack);
  }

  snackAction.addEventListener("click", function () {
    if (!pending) return;
    var action = pending;
    pending = null;
    log(action.log);
    action.run();
  });

  /* --- ⋮ menu ------------------------------------------------------------- */
  menu.addEventListener("click", function (e) {
    var item = e.target.closest('[role="menuitem"]');
    if (!item) return;
    menu.hidePopover();          /* menus dismiss on selection (M2) */
    if (!current) return;
    var act = item.getAttribute("data-act");
    if (act === "labels") openLabels();
    else if (act === "archive") archiveCurrent();
    else if (act === "duplicate") duplicateCurrent();
    else if (act === "delete") deleteCurrent();
  });

  function archiveCurrent() {
    var note = current;
    var was = note.archived;
    note.archived = !was;
    note.meta = "Edited just now";
    log((was ? "unarchive:note-" : "archive:note-") + note.id);
    closeEditor();
    showSnack(was ? "Note unarchived" : "Note archived", "Undo", function () {
      note.archived = was;
      render();
    }, "undo");
  }

  function duplicateCurrent() {
    var note = current;
    var copy = {
      id: nextId++,
      title: note.title.trim() ? "Copy of " + note.title : "Untitled",
      body: note.body,
      label: note.label,
      meta: "Edited just now",
      archived: note.archived
    };
    notes.splice(notes.indexOf(note) + 1, 0, copy);
    log("duplicate:note-" + note.id);
    closeEditor();
    showSnack("Note duplicated", "Open", function () {
      setView(copy.archived ? "archive" : "notes");
      render();
      openEditor(copy, false, null);
    }, "open-duplicate");
  }

  function deleteCurrent() {
    var note = current;
    var index = notes.indexOf(note);
    notes.splice(index, 1);
    log("delete:note-" + note.id);
    closeEditor();
    showSnack("Note deleted", "Undo", function () {
      notes.splice(index, 0, note);
      render();
    }, "undo");
  }

  /* --- Preview states ----------------------------------------------------- */
  render();
  if (preview === "snack") {
    showSnack("Note deleted", "Undo", function () { render(); }, "undo");
  }
})();
