/*!
 * Flint UI — flint.js v0.5.0-dev
 * The entire JS surface: nav selected-state, drawer toggling, and the dialog
 * / sheet wiring (triggers, focus return, non-dismissible opt-out), the
 * snackbar (one at a time, 4s auto-dismiss), the password field toggle and
 * the menu anchoring (the Popover API does the rest).
 * The CSS and the platform do the rest (aria-current/body classes, the
 * <dialog> focus trap, the inert background), so the library still renders
 * correctly with JS off.
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

  /* --- Dialog & bottom sheet --------------------------------------------- *
   * Modal surfaces are native <dialog> elements: showModal() provides the
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

  /* Non-dismissible dialogs (data-fl-dismissible="false"): the user must
     choose an action, so Escape (the native "cancel" event) is refused.
     Scrim clicks are refused in the click handler below; explicit
     data-fl-close buttons and <form method="dialog"> still close. */
  document.addEventListener("cancel", function (e) {
    if (e.target.getAttribute &&
        e.target.getAttribute("data-fl-dismissible") === "false") {
      e.preventDefault();
    }
  }, true);

  /* --- Password toggle: show/hide a password field ------------------------ *
   * The action label swaps ("Show password" ↔ "Hide password") — no
   * aria-pressed, which would announce a contradictory state next to a
   * changing name. The input is resolved via aria-controls first,
   * closest(".fl-field") as fallback. Typing a type flip resets the caret
   * in some engines, so selection is saved and restored. */
  function togglePassword(btn) {
    var id = btn.getAttribute("aria-controls");
    var input = id ? document.getElementById(id) : null;
    if (!input) {
      var field = btn.closest(".fl-field");
      input = field && field.querySelector(".fl-field__input");
    }
    if (!input || (input.type !== "password" && input.type !== "text")) return;

    var show = input.type === "password";
    var start = input.selectionStart;
    var end = input.selectionEnd;
    input.type = show ? "text" : "password";
    input.focus();
    try { input.setSelectionRange(start, end); } catch (err) { /* not selectable */ }
    btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    btn.classList.toggle("is-revealed", show);   /* icon-swap hook for authors */
  }

  /* --- Snackbar: status feedback, not modal ------------------------------ *
   * One at a time (M2) and a 4s auto-dismiss timer. The visible state is a
   * plain class, so author JS can drive it without this file. */
  function showSnackbar(el) {
    var current = document.querySelector(".fl-snackbar.is-visible");
    if (current && current !== el) hideSnackbar(current);   /* never stack */
    clearTimeout(el.__flintTimer);
    el.classList.add("is-visible");
    el.__flintTimer = setTimeout(function () { hideSnackbar(el); }, 4000);
  }

  function hideSnackbar(el) {
    clearTimeout(el.__flintTimer);
    el.classList.remove("is-visible");
  }

  /* --- Menu (dropdown) ----------------------------------------------------- *
   * Native Popover API does light-dismiss (tap outside), Escape, one-menu-
   * at-a-time and top-layer stacking. flint.js adds only what the platform
   * cannot: anchoring the panel to its trigger with viewport flips (CSS
   * cannot measure the trigger), aria-expanded sync, focus-in on open and
   * the WAI-ARIA arrow-key pattern. Menu items are .fl-option buttons, so
   * Enter/Space are native and disabled rows are skipped. */
  var MENU_ITEMS = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]';

  function menuInvoker(menu) {
    return document.querySelector('[popovertarget="' + menu.id + '"]');
  }

  function positionMenu(menu) {
    var btn = menuInvoker(menu);
    if (!btn) return;
    var r = btn.getBoundingClientRect();
    var w = menu.offsetWidth;
    var h = menu.offsetHeight;
    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;
    var left = r.left;
    var top = r.bottom;
    if (left + w > vw - 8) left = r.right - w;   /* flip: align right edges */
    if (left < 8) left = 8;
    if (top + h > vh - 8) top = r.top - h;       /* flip: open upwards */
    if (top < 8) top = 8;
    menu.style.margin = "0";
    menu.style.left = Math.round(left) + "px";
    menu.style.top = Math.round(top) + "px";
  }

  document.addEventListener("toggle", function (e) {   /* toggle doesn't bubble */
    var menu = e.target;
    if (!menu.classList || !menu.classList.contains("fl-menu")) return;
    var btn = menuInvoker(menu);
    if (e.newState === "open") {
      positionMenu(menu);
      if (btn) btn.setAttribute("aria-expanded", "true");
      var first = menu.querySelector(MENU_ITEMS + ":not(:disabled)");
      if (first) first.focus();
    } else if (btn) {
      btn.setAttribute("aria-expanded", "false");
      /* Focus return to the invoker is the platform's job on Esc and
         light dismiss; only restore it when focus was inside the panel. */
      if (menu.contains(document.activeElement)) btn.focus();
    }
  }, true);

  document.addEventListener("keydown", function (e) {
    var menu = e.target.closest && e.target.closest(".fl-menu");
    if (!menu || !menu.matches(":popover-open")) return;
    if (e.key === "Tab") {           /* menus are not tab stops (WAI-ARIA) */
      e.preventDefault();
      menu.hidePopover();
      return;
    }
    var dir = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!dir && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    var items = Array.prototype.filter.call(
      menu.querySelectorAll(MENU_ITEMS),
      function (el) { return !el.disabled; });
    if (!items.length) return;
    var i = items.indexOf(document.activeElement);
    var next = e.key === "Home" ? 0
             : e.key === "End" ? items.length - 1
             : (i + dir + items.length) % items.length;
    items[next].focus();
  });

  /* An open menu follows its trigger (scroll, resize) — M2: menus stay
     next to the element that generates them. Capture: scroll rarely
     bubbles. */
  function repositionOpenMenus() {
    var open = document.querySelectorAll(".fl-menu:popover-open");
    for (var i = 0; i < open.length; i++) positionMenu(open[i]);
  }
  document.addEventListener("scroll", repositionOpenMenus, true);
  window.addEventListener("resize", repositionOpenMenus);


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

    var pwToggle = e.target.closest("[data-fl-password-toggle]");
    if (pwToggle) {
      e.preventDefault();          /* even if type="button" was forgotten */
      togglePassword(pwToggle);
      return;
    }

    var openBtn = e.target.closest("[data-fl-open]");
    if (openBtn) {
      var target = document.getElementById(openBtn.getAttribute("data-fl-open"));
      if (target && target.tagName === "DIALOG") openDialog(target, openBtn);
      else if (target && target.classList.contains("fl-snackbar")) showSnackbar(target);
      return;
    }

    var closeBtn = e.target.closest("[data-fl-close]");
    if (closeBtn) {
      var dlg = closeBtn.closest("dialog");
      var id = closeBtn.getAttribute("data-fl-close");
      if (dlg && (!id || dlg.id === id)) {
        closeDialog(dlg);
        return;
      }
      var snack = closeBtn.closest(".fl-snackbar");
      if (snack && (!id || snack.id === id)) hideSnackbar(snack);
      return;
    }

    /* A click whose target is the <dialog> element itself is a scrim click:
       the card look and all padding live on the inner surface, so clicks on
       the card never reach the dialog element. Non-dismissible dialogs
       ignore it. */
    if (e.target.matches && e.target.matches("dialog.fl-dialog[open], dialog.fl-sheet[open]")) {
      if (e.target.getAttribute("data-fl-dismissible") === "false") return;
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
    dialog: { open: openDialog, close: closeDialog },
    snackbar: { show: showSnackbar, hide: hideSnackbar },
    menu: { position: positionMenu }
  };
})();
