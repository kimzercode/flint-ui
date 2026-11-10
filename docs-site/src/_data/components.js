// Single source of truth for the components index, the sidebar, and later
// prev/next links and planned stub pages.
//
// status:
//   "ready"   — exists in the library, has a full docs page
//   "planned" — on the roadmap, gets a stub page + muted card only
const real = [
  {
    name: "Auth shell",
    slug: "auth",
    status: "ready",
    summary: "Centered 400px column with an outlined-field card for sign-in screens.",
  },
  {
    name: "Bottom-nav shell",
    slug: "bottom-nav",
    status: "ready",
    summary: "App frame with a top bar and 3–5 destinations pinned to the bottom.",
  },
  {
    name: "Drawer shell",
    slug: "drawer",
    status: "ready",
    summary: "App frame with a permanent 280px nav column on desktop, off-canvas on mobile.",
  },
  {
    name: "Lists",
    slug: "lists",
    status: "ready",
    summary: "Single/two/three-line content rows in the Gmail-2020 style.",
  },
  {
    name: "Rail shell",
    slug: "rail",
    status: "ready",
    summary: "App frame that is a bottom nav on mobile and an 80px icon rail on desktop.",
  },
];

const planned = [
  {
    name: "Buttons",
    slug: "buttons",
    status: "planned",
    plannedIn: "0.2",
    summary: "Filled, outlined and text buttons with flat state layers.",
  },
  {
    name: "Cards",
    slug: "cards",
    status: "planned",
    plannedIn: "0.2",
    summary: "Outlined content containers, no shadows.",
  },
  {
    name: "Dialog",
    slug: "dialog",
    status: "planned",
    plannedIn: "0.2",
    summary: "Modal dialog over the existing scrim, with focus handling.",
  },
  {
    name: "Bottom sheet",
    slug: "bottom-sheet",
    status: "planned",
    plannedIn: "0.2",
    summary: "Sheet docked above the tab bar, reusing the scrim.",
  },
];

const all = [...real, ...planned];

export { real, planned, all };
