import { createFileRoute, notFound } from "@tanstack/react-router";
import { PlansPage } from "@/components/PlansPage";
import { getMinecraftPlans } from "@/lib/api";
import { minecraftGroups, groupBySlug } from "@/lib/catalog";

export const Route = createFileRoute("/minecraft/$category")({
  loader: ({ params }) => {
    const group = groupBySlug(minecraftGroups, params.category);
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
        { title: `${group.label} Minecraft Hosting — Anuverse` },
        { name: "description", content: group.tagline },
        { property: "og:title", content: `${group.label} Minecraft Hosting — Anuverse` },
        { property: "og:description", content: group.tagline },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: MinecraftCategory,
});

function MinecraftCategory() {
  const { group } = Route.useLoaderData();
  return (
    <PlansPage
      title={`${group.label} Minecraft Hosting`}
      subtitle={group.tagline}
      queryKey="minecraft-plans"
      fetcher={getMinecraftPlans}
      category="minecraft"
      match={group.match}
      tabs={minecraftGroups.map((g) => ({ slug: g.slug, label: g.label, to: `/minecraft/${g.slug}` }))}
    />
  );
}
