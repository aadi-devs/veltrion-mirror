// Slug → backend category-id mapping for the product menus.
// Backend categories are matched loosely so renaming server-side stays safe.

export interface CatalogGroup {
  slug: string;
  label: string;
  tagline: string;
  /** candidate backend category ids / name fragments */
  match: string[];
}

export const minecraftGroups: CatalogGroup[] = [
  {
    slug: "intel",
    label: "Intel",
    tagline: "Intel Xeon nodes tuned for stable, always-on survival and SMP servers.",
    match: ["intel", "xeon"],
  },
  {
    slug: "amd-epyc",
    label: "AMD EPYC",
    tagline: "EPYC cores with huge cache — ideal for big modpacks and large player counts.",
    match: ["epyc"],
  },
  {
    slug: "amd-ryzen",
    label: "AMD Ryzen",
    tagline: "High-clock Ryzen for the lowest possible tick times on competitive servers.",
    match: ["ryzen"],
  },
];

export const vpsGroups: CatalogGroup[] = [
  {
    slug: "ovh",
    label: "OVH VPS",
    tagline: "OVH-backed virtual machines with enterprise DDoS filtering and clean routing.",
    match: ["ovh"],
  },
  {
    slug: "custom",
    label: "Custom VPS",
    tagline: "Build-your-own specs on our own hardware — RAM, cores and NVMe to order.",
    match: ["custom", "intel", "epyc", "ryzen", "xeon"],
  },
];

export function groupBySlug(groups: CatalogGroup[], slug: string) {
  return groups.find((g) => g.slug === slug);
}
