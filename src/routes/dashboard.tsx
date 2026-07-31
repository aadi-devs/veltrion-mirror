import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Server, ExternalLink } from "lucide-react";
import { getMyOrders } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Servers — Anuverse Dashboard" },
      { name: "description", content: "View your Anuverse orders, server credentials, panel links and renewal dates in one place." },
      { property: "og:title", content: "My Servers — Anuverse Dashboard" },
      { property: "og:description", content: "Manage your Anuverse orders and server credentials." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const statusStyles: Record<string, string> = {
  paid: "bg-primary/15 text-primary",
  pending: "bg-secondary text-secondary-foreground",
  rejected: "bg-destructive/15 text-destructive",
};

function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold">My servers</h1>
        <p className="mt-2 text-muted-foreground">
          {user ? `Signed in as ${user.email}` : "Sign in to view your orders."}
        </p>

        {!authLoading && !user && (
          <Link
            to="/auth"
            className="mt-6 inline-block text-sm font-semibold px-5 py-2.5 rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            Sign in
          </Link>
        )}

        {(authLoading || (user && isLoading)) && (
          <p className="mt-10 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading your orders…
          </p>
        )}

        {error && <p className="mt-10 text-destructive text-sm">Couldn't load your orders.</p>}

        {data && data.length === 0 && (
          <div className="mt-10 rounded-2xl border border-border bg-card/60 p-10 text-center">
            <Server className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">No orders yet.</p>
            <Link
              to="/minecraft"
              className="mt-5 inline-block text-sm font-semibold px-5 py-2.5 rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Browse plans
            </Link>
          </div>
        )}

        <div className="mt-10 space-y-4">
          {data?.map((o) => (
            <div
              key={o.order_ref}
              className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold">{o.plan_name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[o.status] ?? "bg-secondary"}`}>
                      {o.status}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {o.provision_status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {o.plan_category} · {o.ram} RAM · {o.vcores} vCores · {o.disk} NVMe
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground font-mono">{o.order_ref}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">₹{o.price}</div>
                  <div className="text-xs text-muted-foreground capitalize">{o.billing_cycle}</div>
                  {o.renewal_date && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Renews {new Date(o.renewal_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {(o.panel_url || o.server || o.server_password) && (
                <div className="mt-5 pt-4 border-t border-border grid gap-2 text-sm sm:grid-cols-3">
                  {o.server && (
                    <div>
                      <div className="text-xs text-muted-foreground">Server</div>
                      <div className="font-mono">{o.server}</div>
                    </div>
                  )}
                  {o.server_password && (
                    <div>
                      <div className="text-xs text-muted-foreground">Password</div>
                      <div className="font-mono">{o.server_password}</div>
                    </div>
                  )}
                  {o.panel_url && (
                    <a
                      href={o.panel_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline self-end"
                    >
                      Open panel <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {o.provision_error && <p className="mt-4 text-sm text-destructive">{o.provision_error}</p>}
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
