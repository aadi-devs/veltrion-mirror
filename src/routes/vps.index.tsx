import { createFileRoute } from "@tanstack/react-router";
import { PlansPage } from "@/components/PlansPage";
import { getVpsPlans } from "@/lib/api";
import { vpsGroups } from "@/lib/catalog";

export const Route = createFileRoute("/vps/")({
  head: () => ({
    meta: [
      { title: "VPS Hosting — OVH & Custom Builds | Anuverse" },
      { name: "description", content: "Full-root Linux VPS on OVH infrastructure or custom-built Anuverse hardware with NVMe storage." },
      { property: "og:title", content: "VPS Hosting — Anuverse" },
      { property: "og:description", content: "OVH and custom-built Linux VPS with NVMe storage and full root access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PlansPage
      title="VPS Hosting"
      subtitle="Two ways to run: OVH-backed machines with enterprise filtering, or custom builds on Anuverse hardware."
      queryKey="vps-plans"
      fetcher={getVpsPlans}
      category="vps"
      tabs={vpsGroups.map((g) => ({ slug: g.slug, label: g.label, to: `/vps/${g.slug}` }))}
    />
  ),
});
