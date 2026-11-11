/* Flint UI docs — docs-only behavior (never part of the library):
   1. Design/Implementation tab switching (ARIA tabs, hash-aware)
   2. Copy buttons on code snippets
   3. TOC scrollspy (IntersectionObserver over visible panel sections)
   4. Sidebar component-name filter
   All enhancements; the site renders fine with JS disabled. */
(function () {
  "use strict";

  var doc = document;
  doc.documentElement.classList.remove("docs-no-js");
  doc.documentElement.classList.add("docs-js");

  /* --- 1. Tabs ------------------------------------------------------------- */
  var tabs = [].slice.call(doc.querySelectorAll("[data-fl-docs-tab]"));
  var panels = [].slice.call(doc.querySelectorAll("[data-fl-docs-panel]"));
  var tocItems = [].slice.call(doc.querySelectorAll("[data-fl-docs-toc-tab]"));

  function setTab(name) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-fl-docs-tab") === name;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(function (panel) {
      var on = panel.getAttribute("data-fl-docs-panel") === name;
      panel.hidden = !on;
    });
    tocItems.forEach(function (li) {
      var on = li.getAttribute("data-fl-docs-toc-tab") === name;
      if (on) { li.removeAttribute("data-inactive"); }
      else { li.setAttribute("data-inactive", ""); }
    });
    // scrollspy baseline: highlight the first visible entry until scroll decides
    var first = doc.querySelector('[data-fl-docs-toc-tab="' + name + '"]');
    if (first) markToc(first.querySelector("a"));
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setTab(tab.getAttribute("data-fl-docs-tab"));
    });
  });

  var tablist = doc.querySelector(".docs-tabbar");
  if (tablist) {
    tablist.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      var current = tabs.findIndex(function (t) {
        return t.getAttribute("aria-selected") === "true";
      });
      var next = e.key === "ArrowRight" ? current + 1 : current - 1;
      next = (next + tabs.length) % tabs.length;
      tabs[next].focus();
      setTab(tabs[next].getAttribute("data-fl-docs-tab"));
    });
  }

  // Establish the initial tab state in the DOM (Design by default, or
  // Implementation when the hash points into it). Deferred scripts run
  // before first paint, so the TOC never flashes the full list — and if
  // this script never loads, no-JS rendering shows everything.
  setTab(/^#i-/.test(location.hash) ? "impl" : "design");

  /* --- 2. Copy buttons ------------------------------------------------------ */
  function fallbackCopy(text) {
    var ta = doc.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    doc.body.appendChild(ta);
    ta.select();
    try { doc.execCommand("copy"); } catch (e) { /* no-op */ }
    doc.body.removeChild(ta);
  }

  doc.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-fl-docs-copy]");
    if (!btn) return;
    var code = btn.closest(".docs-snippet").querySelector("code");
    var text = code.textContent;
    var done = function () {
      var original = btn.getAttribute("data-fl-docs-copy") || "Copy";
      btn.textContent = "Copied";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
      }, 1500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text);
        done();
      });
    } else {
      fallbackCopy(text);
      done();
    }
  });

  /* --- 3. TOC scrollspy ------------------------------------------------------ */
  var tocLinks = [].slice.call(doc.querySelectorAll("[data-fl-docs-toc] a"));
  function markToc(link) {
    tocLinks.forEach(function (a) {
      var on = a === link;
      a.classList.toggle("is-current", on);
      if (on) { a.setAttribute("aria-current", "true"); }
      else { a.removeAttribute("aria-current"); }
    });
  }

  var headings = [].slice.call(doc.querySelectorAll(".docs-panel h2[id]"));
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var link = doc.querySelector('[data-fl-docs-toc] a[href="#' + entry.target.id + '"]');
        if (link && !entry.target.closest("[hidden]")) { markToc(link); }
      });
    }, { rootMargin: "-96px 0px -60% 0px" });
    headings.forEach(function (h) { observer.observe(h); });
  }

  /* --- 4. Sidebar filter ------------------------------------------------------ */
  var filter = doc.querySelector("[data-fl-docs-filter]");
  if (filter) {
    var lists = filter.getAttribute("data-fl-docs-filter").split(/\s+/);
    filter.addEventListener("input", function () {
      var q = filter.value.trim().toLowerCase();
      lists.forEach(function (id) {
        var list = doc.getElementById(id);
        if (!list) return;
        var visible = 0;
        [].slice.call(list.children).forEach(function (li) {
          var hit = li.textContent.toLowerCase().indexOf(q) !== -1;
          li.hidden = !hit;
          if (hit) visible += 1;
        });
        list.hidden = visible === 0;
      });
    });
  }
})();
