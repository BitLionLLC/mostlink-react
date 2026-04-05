/** Slugs match the `:tab` segment on `/site/:id/:tab`. */
export const SITE_EDITOR_TABS = [
  { id: 0, label: "Links", slug: "links" },
  { id: 1, label: "Style", slug: "style" },
  { id: 2, label: "Analytics", slug: "analytics" },
  { id: 3, label: "Settings", slug: "settings" },
];

export const SITE_EDITOR_TAB_SLUGS = SITE_EDITOR_TABS.map((t) => t.slug);
