/*!
 * Flint UI — flint.js v0.6.0
 * The entire JS surface: nav selected-state, drawer toggling, and the dialog
 * / sheet wiring (triggers, focus return, non-dismissible opt-out), the
 * snackbar (one at a time, 4s auto-dismiss), the password field toggle,
 * the menu anchoring (the Popover API does the rest) and the top bar's
 * scroll-hide observer.
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
   * Enter/Space are native and disabled rows are skipped.
   *
   * role="listbox" turns the same panel into the select's option list: focus
   * starts on the selected row, letters type-ahead, and choosing writes the
   * value (see chooseOption). Action menus are untouched. */
  var MENU_ITEMS = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"]';

  function menuInvoker(menu) {
    return document.querySelector('[popovertarget="' + menu.id + '"]');
  }

  function menuItems(menu) {
    return Array.prototype.filter.call(
      menu.querySelectorAll(MENU_ITEMS),
      function (el) { return !el.disabled; });
  }

  function positionMenu(menu) {
    var btn = menuInvoker(menu);
    if (!btn) return;
    var full = menu.classList.contains("fl-menu--fullwidth");
    /* A fullwidth panel belongs to the field, not to the naked control
       inside it: the box owns the outer rectangle (and its 1px border). */
    var ref = full ? (btn.closest(".fl-field__box") || btn) : btn;
    var r = ref.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;
    if (full) menu.style.width = Math.round(r.width) + "px";   /* attach to the field */
    var w = menu.offsetWidth;
    var h = menu.offsetHeight;
    if (full) {
      /* A fullwidth panel hugs its field: fit the roomier side and scroll
         inside it. Without this a long option list would run off-screen. */
      var below = vh - r.bottom - 8;
      var above = r.top - 8;
      menu.style.maxHeight = Math.max(120, below >= above ? below : above) + "px";
      h = menu.offsetHeight;
    }
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

  /* Type-ahead (listbox only — an action menu has no value to match).
     A repeated single letter cycles; a longer buffer matches from the start. */
  var typeBuffer = "";
  var typeTimer = 0;
  function typeAhead(menu, key) {
    clearTimeout(typeTimer);
    typeBuffer += key.toLowerCase();
    typeTimer = setTimeout(function () { typeBuffer = ""; }, 600);
    var items = menuItems(menu);
    if (!items.length) return;
    var start = items.indexOf(document.activeElement);
    if (typeBuffer.length === 1) start++;
    for (var n = 0; n < items.length; n++) {
      var i = (start + n + items.length) % items.length;
      if (items[i].textContent.trim().toLowerCase().indexOf(typeBuffer) === 0) {
        items[i].focus();
        return;
      }
    }
  }

  function isTypeKey(e) {
    return e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey;
  }

  /* A hidden input's .value setter writes its value attribute (the browser's
     "default" value mode for type=hidden), so form.reset() cannot restore the
     markup's original. Remember the painted default before the first change;
     the reset handler below replays it. Keyed by the select root, so dynamic
     replacements do not share state. */
  var selectDefaults = new WeakMap();

  function rememberSelect(root) {
    if (selectDefaults.has(root)) return;
    var input = root.querySelector('input[type="hidden"]');
    var label = root.querySelector(".fl-select__value");
    selectDefaults.set(root, {
      value: input ? input.getAttribute("value") || "" : "",
      text: label ? label.textContent : ""
    });
  }

  function initSelectDefaults() {
    var selects = document.querySelectorAll(".fl-select");
    for (var i = 0; i < selects.length; i++) rememberSelect(selects[i]);
  }

  /* One owner for a select's value: the trigger text, the row state and the
     hidden input always move together. */
  function setSelectValue(root, option) {
    rememberSelect(root);            /* capture the default before overwriting */
    var label = root.querySelector(".fl-select__value");
    var input = root.querySelector('input[type="hidden"]');
    var rows = root.querySelectorAll('[role="option"]');
    for (var i = 0; i < rows.length; i++) {
      rows[i].setAttribute("aria-selected", rows[i] === option ? "true" : "false");
    }
    if (label) label.textContent = option ? option.textContent.trim() : "";
    if (input) input.value = option ? (option.value || option.textContent.trim()) : "";
  }

  function chooseOption(option) {
    var menu = option.closest(".fl-menu");
    var btn = menuInvoker(menu);
    var root = btn && btn.closest(".fl-select");
    var changed = option.getAttribute("aria-selected") !== "true";
    if (root) setSelectValue(root, option);
    menu.hidePopover();
    if (btn) btn.focus();          /* the platform usually restores it too */
    /* Like a native select: input then change, both bubbling from the value
       carrier. Re-choosing the current row only closes. */
    if (changed && root) {
      var input = root.querySelector('input[type="hidden"]');
      if (input) {
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }

  document.addEventListener("toggle", function (e) {   /* toggle doesn't bubble */
    var menu = e.target;
    if (!menu.classList || !menu.classList.contains("fl-menu")) return;
    var btn = menuInvoker(menu);
    if (e.newState === "open") {
      typeBuffer = "";               /* a new list starts a new type-ahead */
      clearTimeout(typeTimer);
      positionMenu(menu);
      if (btn) btn.setAttribute("aria-expanded", "true");
      var selected = menu.getAttribute("role") === "listbox"
        ? menu.querySelector('[role="option"][aria-selected="true"]:not(:disabled)')
        : null;
      var first = selected || menu.querySelector(MENU_ITEMS + ":not(:disabled)");
      if (first) first.focus();
      if (menu.__flintType) {   /* typed on the closed anchor: jump to a match */
        var typed = menu.__flintType;
        menu.__flintType = "";
        typeAhead(menu, typed);
      }
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
    if (!dir && e.key !== "Home" && e.key !== "End") {
      if (menu.getAttribute("role") === "listbox" && isTypeKey(e)) {
        e.preventDefault();
        typeAhead(menu, e.key);
      }
      return;
    }
    e.preventDefault();
    var items = menuItems(menu);
    if (!items.length) return;
    var i = items.indexOf(document.activeElement);
    var next = e.key === "Home" ? 0
             : e.key === "End" ? items.length - 1
             : (i + dir + items.length) % items.length;
    items[next].focus();
  });

  /* Closed select: ArrowDown/ArrowUp opens the list, and typing a letter
     opens it on the first match (native select behaviour). Space and Enter
     stay the button's own click. */
  document.addEventListener("keydown", function (e) {
    var anchor = e.target.closest && e.target.closest(".fl-select__anchor");
    if (!anchor) return;
    var type = isTypeKey(e);
    if (!type && e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    var menu = document.getElementById(anchor.getAttribute("popovertarget"));
    if (!menu || menu.matches(":popover-open")) return;
    e.preventDefault();
    menu.__flintType = type ? e.key : "";
    menu.showPopover();
  });

  /* A form reset restores the hidden input's value attribute — but choosing
     already overwrote that attribute (hidden inputs reflect .value into it).
     Replay the remembered default instead: value, selected row and painted
     text, once the platform has finished resetting. */
  document.addEventListener("reset", function (e) {
    var form = e.target;
    if (!form || !form.querySelectorAll) return;
    setTimeout(function () {
      var selects = form.querySelectorAll(".fl-select");
      for (var i = 0; i < selects.length; i++) {
        var root = selects[i];
        var input = root.querySelector('input[type="hidden"]');
        if (!input) continue;
        if (!selectDefaults.has(root)) rememberSelect(root);
        var def = selectDefaults.get(root);
        var match = null;
        var rows = root.querySelectorAll('[role="option"]');
        for (var j = 0; j < rows.length; j++) {
          if ((rows[j].value || rows[j].textContent.trim()) === def.value) match = rows[j];
        }
        if (match) {
          setSelectValue(root, match);
        } else {
          /* The default was "nothing chosen" (a placeholder value): clear the
             rows and restore the original painted text. */
          var label = root.querySelector(".fl-select__value");
          for (var k = 0; k < rows.length; k++) rows[k].setAttribute("aria-selected", "false");
          if (label) label.textContent = def.text;
          input.value = def.value;
        }
      }
    }, 0);
  });

  /* Capture defaults as soon as the document is parsed (a script in <head>
     may run before the fields exist). Dynamic selects are captured on their
     first interaction by setSelectValue. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSelectDefaults);
  } else {
    initSelectDefaults();
  }

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
    /* Choosing a row in a listbox (the select). Delegated, so selects added
       later — a framework render — work without a rescan. */
    var option = e.target.closest('.fl-menu[role="listbox"] [role="option"]');
    if (option && !option.disabled) {
      chooseOption(option);
      return;
    }

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
    if (e.target.matches && e.target.matches("dialog.fl-dialog[open], dialog.fl-sheet[open], dialog.fl-sidesheet[open]")) {
      if (e.target.getAttribute("data-fl-dismissible") === "false") return;
      closeDialog(e.target);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("fl-drawer-open")) {
      setDrawer(false);
    }
  });

  /* --- Top bar scroll-hide (data-fl-scroll-hide) -------------------------- *
   * M2 scrolling behavior: scrolling down (content moves up) hides the bar,
   * scrolling up reveals it, and the bar always shows at the very top.
   * flint.js watches the shell's .fl-content (or the window when the bar
   * is not in a shell) and toggles .is-hidden; the CSS does the slide and
   * the shell row collapse. A 4px threshold keeps touch scroll from
   * jittering the bar. The class is plain CSS state — author JS can drive
   * it without this file.
   *
   * Collapsing the row changes the scroll range: the browser clamps
   * scrollTop and fires scroll events while the row animates. Those
   * self-inflicted events must not flip the state back, so 300ms after a
   * toggle the handler only tracks position (the clamp lands exactly where
   * the user would be — the bar's 64px of scroll range became viewport). */
  function initScrollHide(bar) {
    if (bar.__flintScrollHide) return;
    bar.__flintScrollHide = true;
    var shell = bar.closest(".fl-shell");
    var scroller = shell ? shell.querySelector(".fl-content") : null;
    var last = 0;
    var settle = 0;   /* truthy while our own row transition is settling */

    function setHidden(on) {
      if (on !== bar.classList.contains("is-hidden")) {
        bar.classList.toggle("is-hidden", on);
        clearTimeout(settle);
        settle = setTimeout(function () { settle = 0; }, 300);
      }
    }

    (scroller || window).addEventListener("scroll", function () {
      var y = scroller ? scroller.scrollTop : window.scrollY;
      if (y <= 0) {   /* the very top always reveals — even while settling */
        last = y;
        setHidden(false);
        return;
      }
      if (settle) { last = y; return; }   /* our own row transition, not the user */
      if (y > last + 4) setHidden(true);
      else if (y < last - 4) setHidden(false);
      last = y;
    }, { passive: true });
  }

  function scan(root) {
    var groups = (root || document).querySelectorAll("[data-fl-nav]");
    for (var i = 0; i < groups.length; i++) initNav(groups[i]);
    var bars = (root || document).querySelectorAll("[data-fl-scroll-hide]");
    for (var j = 0; j < bars.length; j++) initScrollHide(bars[j]);
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
