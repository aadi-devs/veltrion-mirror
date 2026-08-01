import { createFileRoute, notFound } from "@tanstack/react-router";
import { PlansPage } from "@/components/PlansPage";
import { getVpsPlans } from "@/lib/api";
import { vpsGroups, groupBySlug } from "@/lib/catalog";

export const Route = createFileRoute("/vps/$type")({
  loader: ({ params }) => {
    const group = groupBySlug(vpsGroups, params.type);
    if (!group) throw notFound();
    return { group };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Plan not found — Anuverse" }, { name: "robots", content: "noindex" }] };
    }
    const { group } = loaderData;
    return {
      meta: [
        { title: `${group.label} — Anuverse VPS Hosting` },
        { name: "description", content: group.tagline },
        { property: "og:title", content: `${group.label} — Anuverse VPS Hosting` },
        { property: "og:description", content: group.tagline },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: VpsType,
});

function VpsType() {
  const { group } = Route.useLoaderData();
  return (
    <PlansPage
      title={group.label}
      subtitle={group.tagline}
      queryKey="vps-plans"
      fetcher={getVpsPlans}
      category="vps"
      match={group.match}
      tabs={vpsGroups.map((g) => ({ slug: g.slug, label: g.label, to: `/vps/${g.slug}` }))}
    />
  );
}
