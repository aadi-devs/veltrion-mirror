import { createFileRoute } from "@tanstack/react-router";
import { PlansPage } from "@/components/PlansPage";
import { getVpsPlans } from "@/lib/api";

export const Route = createFileRoute("/vps")({
  head: () => ({
    meta: [
      { title: "VPS Hosting — Intel Xeon & AMD EPYC | Anuverse" },
      { name: "description", content: "Full-root Linux VPS on Intel Xeon and AMD EPYC hardware with NVMe storage and instant deployment." },
      { property: "og:title", content: "VPS Hosting — Anuverse" },
      { property: "og:description", content: "Full-root Linux VPS on Xeon and EPYC hardware with NVMe storage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PlansPage
      title="VPS Hosting"
      subtitle="Full-root virtual machines on enterprise Xeon and EPYC hardware, provisioned in minutes."
      queryKey="vps-plans"
      fetcher={getVpsPlans}
      category="vps"
    />
  ),
});
