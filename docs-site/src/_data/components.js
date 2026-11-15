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
    name: "Bottom sheet",
    slug: "bottom-sheet",
    status: "ready",
    summary: "Sheet docked to the bottom edge on the native <dialog> — option lists and compact forms.",
  },
  {
    name: "Buttons",
    slug: "buttons",
    status: "ready",
    summary: "Filled, outlined and text buttons with flat state layers.",
  },
  {
    name: "Cards",
    slug: "cards",
    status: "ready",
    summary: "Outlined content containers, no shadows.",
  },
  {
    name: "Dialog",
    slug: "dialog",
    status: "ready",
    summary: "Native <dialog> in the card vocabulary — four types, stacking and focus from the platform.",
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
  {
    name: "Snackbar",
    slug: "snackbar",
    status: "ready",
    summary: "Inverse-surface status message with an optional Undo action — one at a time, 4s auto-dismiss.",
  },
  {
    name: "Progress",
    slug: "progress",
    status: "ready",
    summary: "Linear <progress> and a conic-gradient circle — determinate or indeterminate, zero JavaScript.",
  },
  {
    name: "Select",
    slug: "select",
    status: "ready",
    summary: "The styled native <select> in the field family — chevron drawn in CSS.",
  },
  {
    name: "Selection controls",
    slug: "selection-controls",
    status: "ready",
    summary: "Checkboxes, radios and switches — native inputs drawn flat, zero JS.",
  },
  {
    name: "Text fields",
    slug: "text-fields",
    status: "ready",
    summary: "Outlined and filled inputs with helper text, error states and a textarea.",
  },
  {
    name: "Tooltip",
    slug: "tooltip",
    status: "ready",
    summary: "CSS-only identifying label for icon-only controls — hover and keyboard focus, zero JS.",
  },
];

const planned = [];

const all = [...real, ...planned];

export { real, planned, all };
