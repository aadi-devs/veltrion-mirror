import { createFileRoute } from "@tanstack/react-router";
import { PlansPage } from "@/components/PlansPage";
import { getMinecraftPlans } from "@/lib/api";
import { minecraftGroups } from "@/lib/catalog";

export const Route = createFileRoute("/minecraft/")({
  head: () => ({
    meta: [
      { title: "Minecraft Server Hosting — Intel, EPYC & Ryzen | Anuverse" },
      { name: "description", content: "Minecraft hosting on Intel Xeon, AMD EPYC and AMD Ryzen nodes with NVMe storage and instant setup." },
      { property: "og:title", content: "Minecraft Server Hosting — Anuverse" },
      { property: "og:description", content: "Intel, EPYC and Ryzen Minecraft nodes with NVMe storage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PlansPage
      title="Minecraft Hosting"
      subtitle="Pick your CPU platform — Intel, AMD EPYC or AMD Ryzen. Every node runs NVMe storage and DDoS filtering."
      queryKey="minecraft-plans"
      fetcher={getMinecraftPlans}
      category="minecraft"
      tabs={minecraftGroups.map((g) => ({ slug: g.slug, label: g.label, to: `/minecraft/${g.slug}` }))}
    />
  ),
});
