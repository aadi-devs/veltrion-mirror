import { createFileRoute } from "@tanstack/react-router";
import { PlansPage } from "@/components/PlansPage";
import { getMinecraftPlans } from "@/lib/api";

export const Route = createFileRoute("/minecraft")({
  head: () => ({
    meta: [
      { title: "Minecraft Server Hosting — Anuverse" },
      { name: "description", content: "Instant-setup Minecraft Java and Bedrock hosting on Ryzen CPUs and NVMe storage, from ₹149/mo." },
      { property: "og:title", content: "Minecraft Server Hosting — Anuverse" },
      { property: "og:description", content: "Instant-setup Minecraft hosting on Ryzen CPUs and NVMe storage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PlansPage
      title="Minecraft Hosting"
      subtitle="Ryzen-powered nodes, NVMe storage and one-click modpacks. Your world is online in under 60 seconds."
      queryKey="minecraft-plans"
      fetcher={getMinecraftPlans}
      category="minecraft"
    />
  ),
});
