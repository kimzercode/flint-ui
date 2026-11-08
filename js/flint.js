/*!
 * Flint UI — flint.js v0.1.0
 * The entire JS surface: nav selected-state management and drawer toggling.
 * The CSS does the rest (aria-current/body classes drive the styles), so the
 * library still renders correctly with JS disabled.
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

  /* --- Wiring ------------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-fl-drawer-open]")) {
      setDrawer(true);
    } else if (e.target.closest("[data-fl-drawer-close]")) {
      setDrawer(false);
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

  window.flint = { scan: scan, drawer: setDrawer };
})();
