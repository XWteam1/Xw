// Fixed for now per the build spec (assumption #4: should eventually be
// configurable in settings rather than hardcoded — not built yet).
export const OWNERS = ["Murad", "Anas", "Almas", "XW"] as const;
export type Owner = (typeof OWNERS)[number];

export const PLATFORMS = ["Instagram", "LinkedIn", "YouTube"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const FORMATS_BY_PLATFORM: Record<Platform, readonly string[]> = {
  Instagram: ["Static", "Carousel", "Reel / Video"],
  LinkedIn: ["Static", "Carousel", "LinkedIn post", "LinkedIn long-form"],
  YouTube: ["Reel / Video"],
};

export const OWNER_COLOR: Record<Owner, string> = {
  Murad: "#6E56CF",
  Anas: "#2E7DBB",
  Almas: "#B5533C",
  XW: "#0E7C86",
};
