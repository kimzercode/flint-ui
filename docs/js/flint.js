/*!
 * Flint UI — flint.js v0.4.0-dev
 * The entire JS surface: nav selected-state, drawer toggling, and the overlay
 * wiring (dialog / bottom sheet triggers + focus return). The CSS and the
 * platform do the rest (aria-current/body classes, the <dialog> focus trap,
 * the inert background), so the library still renders correctly with JS off.
 */
(function () {
  "use strict";

  var NAV_ITEMS = ".fl-tab, .fl-nav-item";

  /* --- Nav selected state ------------------------------------------------ */
  function activate(container, target) {
    var items = container.querySelectorAll(NAV_ITEMS);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var on = item === target;
      item.classList.toggle("is-active", on);
      if (on) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    }
  }

  function initNav(container) {
    if (container.__flintNav) return;
    container.__flintNav = true;
    container.addEventListener("click", function (e) {
      var target = e.target.closest(NAV_ITEMS);
      if (!target || !container.contains(target)) return;
      // Let anchors navigate; still reflect the selection state.
      activate(container, target);
    });
  }

  /* --- Drawer (mobile off-canvas shell) ---------------------------------- */
  function setDrawer(open) {
    document.body.classList.toggle("fl-drawer-open", open);
    var buttons = document.querySelectorAll("[data-fl-drawer-open]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-expanded", open ? "true" : "false");
    }
  }

  /* --- Overlays: dialog / bottom sheet ----------------------------------- *
   * Modal overlays are native <dialog> elements: showModal() provides the
   * focus trap, the inert background, Escape-to-close and top-layer stacking,
   * so flint.js only wires triggers and focus return. Delegation means
   * dynamically added dialogs work without a rescan. The "close" event does
   * not bubble, hence the capture listener. */
  function openDialog(dialog, invoker) {
    dialog.__flintInvoker = invoker || document.activeElement;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");  /* pre-<dialog> engines: visible, not modal */
    }
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  document.addEventListener("close", function (e) {
    var invoker = e.target.__flintInvoker;
    if (invoker && document.contains(invoker)) {
      invoker.focus();
    }
  }, true);

  /* --- Wiring ------------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-fl-drawer-open]")) {
      setDrawer(true);
      return;
    }
    if (e.target.closest("[data-fl-drawer-close]")) {
      setDrawer(false);
      return;
    }

    var openBtn = e.target.closest("[data-fl-open]");
    if (openBtn) {
      var target = document.getElementById(openBtn.getAttribute("data-fl-open"));
      if (target && target.tagName === "DIALOG") openDialog(target, openBtn);
      return;
    }

    var closeBtn = e.target.closest("[data-fl-close]");
    if (closeBtn) {
      var dlg = closeBtn.closest("dialog");
      var id = closeBtn.getAttribute("data-fl-close");
      if (dlg && (!id || dlg.id === id)) closeDialog(dlg);
      return;
    }

    /* A click whose target is the <dialog> element itself is a scrim click:
       the card look and all padding live on the inner surface, so clicks on
       the card never reach the dialog element. */
    if (e.target.matches && e.target.matches("dialog.fl-dialog[open], dialog.fl-sheet[open]")) {
      closeDialog(e.target);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("fl-drawer-open")) {
      setDrawer(false);
    }
  });

  function scan(root) {
    var groups = (root || document).querySelectorAll("[data-fl-nav]");
    for (var i = 0; i < groups.length; i++) initNav(groups[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      scan(document);
    });
  } else {
    scan(document);
  }

  window.flint = {
    scan: scan,
    drawer: setDrawer,
    dialog: { open: openDialog, close: closeDialog }
  };
})();
