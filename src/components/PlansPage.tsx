import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, ServerCrash } from "lucide-react";
import type { BillingCycle, PlanCategory } from "@/lib/api";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

const cycles: { id: BillingCycle; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "annually", label: "Annually" },
];

function filterCategories(cats: PlanCategory[], match?: string[]) {
  if (!match || match.length === 0) return cats;
  const hit = cats.filter((c) =>
    match.some((m) => c.id.toLowerCase().includes(m) || c.name.toLowerCase().includes(m)),
  );
  return hit.length ? hit : cats;
}

export function PlansPage({
  title,
  subtitle,
  queryKey,
  fetcher,
  category,
  match,
  tabs,
}: {
  title: string;
  subtitle: string;
  queryKey: string;
  fetcher: () => Promise<PlanCategory[]>;
  category: "minecraft" | "vps";
  match?: string[];
  tabs?: { slug: string; label: string; to: string }[];
}) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const { data, isLoading, error } = useQuery({ queryKey: [queryKey], queryFn: fetcher });
  const categories = data ? filterCategories(data, match) : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-6 pt-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">{subtitle}</p>

        {tabs && (
          <div className="mt-8 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <Link
                key={t.slug}
                to={t.to}
                className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition data-[status=active]:text-primary-foreground"
                activeProps={{ style: { background: "var(--gradient-primary)" } }}
              >
                {t.label}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 inline-flex rounded-xl border border-border bg-card/60 p-1">
          {cycles.map((c) => (
            <button
              key={c.id}
              onClick={() => setCycle(c.id)}
              className={`px-4 py-2 text-sm rounded-lg transition ${
                cycle === c.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              style={cycle === c.id ? { background: "var(--gradient-primary)" } : undefined}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground py-20">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading plans…
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/60 p-6 my-10">
            <ServerCrash className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="font-semibold">Couldn't reach the Anuverse API</p>
              <p className="text-sm text-muted-foreground">
                Set <code>VITE_BACKEND_URL</code> to your backend origin, then reload.
              </p>
            </div>
          </div>
        )}

        {categories?.map((cat) => (
          <section key={cat.id} className="mt-14">
            <h2 className="text-2xl font-semibold mb-6">{cat.name}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cat.plans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 flex flex-col hover:border-primary/50 transition"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="text-sm text-muted-foreground">{cat.name}</div>
                  <div className="text-xl font-bold">{plan.name}</div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">₹{plan.price[cycle]}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground flex-1">
                    {plan.ram && <Spec text={`${plan.ram} RAM`} />}
                    {plan.vcores != null && <Spec text={`${plan.vcores} vCores`} />}
                    {(plan.disk || plan.nvme) && <Spec text={`${plan.disk ?? plan.nvme} NVMe`} />}
                    {plan.players != null && <Spec text={`~${plan.players} players`} />}
                    <Spec text="DDoS protection" />
                  </ul>
                  <Link
                    to="/checkout/$planId"
                    params={{ planId: plan.id }}
                    search={{ cycle, category }}
                    className="mt-6 text-center text-sm font-semibold px-4 py-2.5 rounded-lg text-primary-foreground"
                    style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                  >
                    Order now
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}

function Spec({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="w-4 h-4 text-primary" />
      {text}
    </li>
  );
}
