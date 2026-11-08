# Flint UI

Flat, Google-flavored (2019–2020 era) app shells for building web apps on mobile
and laptop viewports. Pure CSS + ~50 lines of vanilla JS. **No shadows anywhere** —
surface separation comes from 1px borders (`#dadce0`) and tinted states (`#e8f0fe`).

```
css/flint.css      tokens + reset + shells + small building blocks
js/flint.js        the entire JS surface: nav selected-state toggling
demos/             working demos of each shell
CHANGELOG.md       release notes per version
LICENSE            MIT
```

Open `index.html` to reach the demos.

## Quick start

```html
<link rel="stylesheet" href="css/flint.css">
<script src="js/flint.js" defer></script>
```

No webfonts: text uses the system font stack (`--fl-font`), so the library makes
zero font requests.
- Icons are flat gray wireframe placeholders (`<span class="fl-icon"></span>`) —
no icon font to load, so first paint stays fast. On active items (selected
tabs, nav rows, the FAB) the placeholder takes the active color, previewing
what a real icon would do. Swap in a real icon set later by restyling that
one class.
- The reset is global (`box-sizing: border-box`, zero margins), so nothing
special is needed on `<body>`. `class="fl-reset"` is optional — it only adds
the shell typography + surface color for pages that are not a `.fl-shell`.

## Bottom-nav shell

```html
<body class="fl-reset">
<div class="fl-shell">
  <header class="fl-top-bar">
    <button class="fl-icon-btn"><span class="fl-icon"></span></button>
    <h1 class="fl-top-bar__title">App name</h1>
    <button class="fl-icon-btn"><span class="fl-icon"></span></button>
  </header>

  <main class="fl-content">…</main>

  <nav class="fl-tab-bar" data-fl-nav aria-label="Primary">
    <button class="fl-tab" aria-current="page">
      <span class="fl-tab__icon"><span class="fl-icon"></span></span>
      <span class="fl-tab__label">Home</span>
    </button>
    <!-- 3–5 destinations; add <span class="fl-badge">N</span> for counts -->
  </nav>
</div>
</body>
```

- The shell is a grid (`auto 1fr auto`, `100dvh`): the app bar and tab bar stay
  put, only `.fl-content` scrolls.
- **Responsive**: `<905px` stacked icon-over-label tabs; `≥905px` inline pills
  in a centered 56px bar, plus a max-width content column
  (`--fl-content-max: 960px`).
- Selected destination: accent-colored icon + label on mobile (M2 bottom-nav
  style, no pill); on desktop the tint pill wraps the destination — the
  Gmail-2020 side-nav pattern.
- Optional flat FAB: `<button class="fl-fab">` — white circle with a border,
  docked above the tab bar, honours `env(safe-area-inset-bottom)`.
- Works with links too: `<a class="fl-tab" href="/inbox">…</a>` (JS reflects the
  selection state; with server routing you can just set `aria-current` yourself).

## Drawer shell

```html
<div class="fl-shell-drawer">
  <header class="fl-top-bar">
    <button class="fl-icon-btn fl-only-mobile" data-fl-drawer-open
            aria-label="Open navigation menu" aria-controls="my-drawer" aria-expanded="false">
      <span class="fl-icon"></span>
    </button>
    <h1 class="fl-top-bar__title">App name</h1>
  </header>

  <aside class="fl-drawer" id="my-drawer">
    <div class="fl-drawer__header">
      App name
      <button class="fl-icon-btn fl-only-mobile" data-fl-drawer-close aria-label="Close navigation menu">…</button>
    </div>
    <nav class="fl-nav" data-fl-nav aria-label="Primary">
      <a class="fl-nav-item" aria-current="page" href="#"><span class="fl-icon"></span>Inbox<span class="fl-badge">3</span></a>
      <a class="fl-nav-item" href="#"><span class="fl-icon"></span>Sent</a>
    </nav>
    <hr class="fl-divider">
    <div class="fl-drawer__footer">…account row…</div>
  </aside>

  <div class="fl-scrim" data-fl-drawer-close aria-hidden="true"></div>
  <main class="fl-content">…</main>
</div>
```

- `≥905px`: permanent 280px left column (grid). Below: fixed, off-canvas,
  slides over a scrim.
- `flint.js` toggles a `fl-drawer-open` class on `<body>`, syncs
  `aria-expanded` on the open button, and closes on Escape or scrim click.
- Rows (`.fl-nav-item`) use the Gmail-2020 inset pill: tinted background
  rounded on the right side, selected via `aria-current="page"`.
- Control it manually: `flint.drawer(true) / flint.drawer(false)`.

## Rail shell

The rail **reuses the bottom-nav markup** — the same `fl-tab-bar`/`fl-tab`
element, no extra classes:

```html
<div class="fl-shell-rail">
  <header class="fl-top-bar">…</header>
  <main class="fl-content">…</main>
  <nav class="fl-tab-bar" data-fl-nav aria-label="Primary">…fl-tab items…</nav>
</div>
```

`<905px` it renders as a standard bottom tab bar; `≥905px` it becomes a
permanent 80px icon rail with the tinted pill on the selected destination.

## Auth shell (zero JS)

```html
<div class="fl-shell-auth">
  <header class="fl-top-bar">…</header>
  <main class="fl-shell-auth__content">
    <form class="fl-auth-card">…</form>
  </main>
</div>
```

Centered 400px column (`.fl-auth-card`), outlined text fields (`.fl-field`).

## Lists

Content rows in the Gmail-2020 style — spec heights, a leading 24px icon or
40px avatar, and a trailing meta zone:

```html
<ul class="fl-list">
  <li class="fl-list-item fl-list-item--two-line">
    <span class="fl-list-item__avatar" aria-hidden="true">AK</span>
    <span class="fl-list-item__text">
      <span class="fl-list-item__title">Aisha Karim</span>
      <span class="fl-list-item__sub">aisha@example.com</span>
    </span>
    <span class="fl-list-item__meta">
      <button class="fl-icon-btn" aria-label="Message Aisha">…</button>
    </span>
  </li>
</ul>
```

- Rows: single-line 48px, `--two-line` 72px, `--three-line` 88px (body clamps
  to two lines); `.fl-list--dense` gives 40/60/76px compact rows.
- Leading zone: `__icon` (24px) or `__avatar` (40px circle — initials text, or
  the class on an `<img>` to crop photos). Avatar rows align text to the
  72dp keyline.
- Trailing `__meta`: icon buttons, inline badges, or secondary text.
- Rows separate by spacing, not rules — opt into 1px dividers with
  `.fl-list--dividers`.
- Interactive rows: put the classes on an `<a>`/`<button>` for whole-row
  hover/active/selected states (keep the meta zone free of nested controls
  there). Selected = tint fill via `aria-current="page"`; content rows keep
  neutral text, unlike nav pills. `aria-disabled="true"` dims a row and blocks
  pointer events.

## How active/selected states work

CSS keys selected styles off `[aria-current="page"]` (with an `.is-active`
fallback). `flint.js` only sets those attributes on click within any
`[data-fl-nav]` container — so with JS disabled the markup still renders
correctly, and in Vue/SSR you can set `aria-current` server-side and skip JS
entirely. To use it manually: `flint.scan()`.

## Theming

Everything is a CSS custom property on `:root` — override them inline or in a
theme stylesheet, no rebuild needed:

```css
:root {
  --fl-accent: #188038;    /* green Google */
  --fl-tint: #e6f4ea;
  --fl-content-max: 720px;
}
```

Key tokens: `--fl-surface`, `--fl-text`, `--fl-text-secondary`, `--fl-icon`,
`--fl-icon-ph`, `--fl-accent`, `--fl-tint`, `--fl-hover`, `--fl-border`, `--fl-radius*`,
`--fl-topbar-h`, `--fl-tabbar-h`, `--fl-content-max`.

## Accessibility notes

- Tabs and icon buttons are real `<button>`s (or links) — keyboard built in;
  `:focus-visible` gets a 2px accent ring.
- Selected tab uses `aria-current="page"` — screen-reader-correct.
- Icon-only buttons need an `aria-label`; badges are `aria-hidden` (put the
  count in the button's label instead).
- List rows: leading icons/avatars and meta badges are `aria-hidden`; give
  icon-only actions an `aria-label`; mark unavailable rows `aria-disabled`.
- Add `viewport-fit=cover` to the meta viewport for safe-area support.

## Roadmap

Done in 0.1.0: bottom-nav, drawer, rail, and auth shells plus the list
component (single/two/three-line, dense, dividers) — all sharing one token
system. Next candidates: checkbox/switch, menu/popover, and snackbars.

## License

[MIT](LICENSE) — free to use in personal and commercial projects.
