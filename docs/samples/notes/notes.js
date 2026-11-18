/* Notes sample — the app layer. Everything below is author logic: a model in
   memory, a render pass, and the wiring between Flint's components. The library
   supplies the components, the platform supplies the dialog/popover focus
   behaviour; nothing here re-implements either.

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
  var snack = $("snack");
  var snackMsg = $("snack-msg");
  var snackAction = $("snack-action");

  /* The three labels are a fixed set — no label CRUD in a sample. They exist to
     exercise the chip component and view filtering, nothing more. */
  var LABELS = { work: "Work", personal: "Personal", ideas: "Ideas" };
  var VIEWS = { notes: "Notes", archive: "Archive", work: "Work",
                personal: "Personal", ideas: "Ideas" };

  /* --- Model ------------------------------------------------------------- *
     The seed is the markup, not a second copy of it: the six notes above are
     converted to objects on load, then the grid is re-rendered from the model.
     Editing the HTML seed is the only place to change the sample data. */
  var nextId = 1;
  var notes = [].map.call(grid.querySelectorAll("[data-note]"), function (el) {
    var tag = el.querySelector(".fl-chip");
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

  function render() {
    var shown = notes.filter(inView);

    grid.replaceChildren.apply(grid, shown.map(cardFor));
    grid.hidden = shown.length === 0;

    var nothing = shown.length === 0;

    empty.hidden = !nothing;
    if (nothing) {
      if (notes.length === 0) {
        emptyTitle.textContent = "No notes yet";
        emptyText.textContent = "Notes you create appear here. Press the button below to start one.";
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
    fab.hidden = view === "archive";   /* you cannot create an archived note */
  }

  /* --- Views & search ----------------------------------------------------- */
  $("nav").addEventListener("click", function (e) {
    var row = e.target.closest("[data-view]");
    if (!row) return;
    view = row.getAttribute("data-view");
    [].forEach.call(document.querySelectorAll("[data-view]"), function (el) {
      if (el === row) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    flint.drawer(false);   /* mobile: navigation closes the drawer (Keep) */
    render();
  });

  searchInput.addEventListener("input", function () {
    query = searchInput.value.trim().toLowerCase();
    render();
  });

  /* --- Editor ------------------------------------------------------------- */
  function setLabelChips(label) {
    [].forEach.call(editor.querySelectorAll('input[name="label"]'), function (radio) {
      radio.checked = radio.value === (label || "");
    });
  }

  function openEditor(note, isNew, invoker) {
    current = note;
    isNewBlank = !!isNew;
    titleInput.value = note.title;
    bodyInput.value = note.body;
    metaLine.textContent = note.meta;
    editorTitle.textContent = isNew ? "New note" : "Edit note";
    menuArchive.textContent = note.archived ? "Unarchive" : "Archive";
    setLabelChips(note.label);
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

  editor.addEventListener("change", function (e) {
    if (current && e.target.name === "label") current.label = e.target.value;
  });

  /* Any close path — the close control, Escape, a scrim click — lands here.
     A brand-new note nobody typed into is discarded, not left as "Untitled". */
  editor.addEventListener("close", function () {
    var note = current;
    if (isNewBlank && !titleInput.value.trim() && !bodyInput.value.trim()) {
      notes = notes.filter(function (n) { return n !== note; });
      log("discard-blank");
    }
    current = null;
    isNewBlank = false;
    render();

    /* The render replaced the card that had focus; put focus back on it, or on
       the first card / the FAB when it left the view. */
    var again = note && notes.indexOf(note) !== -1 && inView(note);
    var target = again ? grid.querySelector('[data-id="' + note.id + '"]')
                       : grid.querySelector("[data-note]");
    if (!target) target = fab.hidden ? searchInput : fab;
    if (target) target.focus();
  });

  /* --- FAB ---------------------------------------------------------------- */
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
    if (act === "archive") archiveCurrent();
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
      view = copy.archived ? "archive" : "notes";
      [].forEach.call(document.querySelectorAll("[data-view]"), function (el) {
        if (el.getAttribute("data-view") === view) el.setAttribute("aria-current", "page");
        else el.removeAttribute("aria-current");
      });
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
