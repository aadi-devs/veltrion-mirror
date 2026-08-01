import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Server, ExternalLink, Clock, Copy, Check } from "lucide-react";
import { getMyOrders, type MyOrder } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Servers — Anuverse Dashboard" },
      { name: "description", content: "View your Anuverse servers, order history, credentials, panel links and renewal dates in one place." },
      { property: "og:title", content: "My Servers — Anuverse Dashboard" },
      { property: "og:description", content: "Manage your Anuverse servers, history and renewals." },
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

function daysLeft(date?: string | null) {
  if (!date) return null;
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="font-mono text-sm flex items-center gap-2 hover:text-primary transition"
      >
        {value}
        {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
      </button>
    </div>
  );
}

function OrderCard({ o }: { o: MyOrder }) {
  const left = daysLeft(o.renewal_date);
  return (
    <div
      className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-bold">{o.plan_name}</h3>
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
          <p className="mt-1 text-xs text-muted-foreground">
            Ordered {new Date(o.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">₹{o.price}</div>
          <div className="text-xs text-muted-foreground capitalize">{o.billing_cycle}</div>
          {o.renewal_date && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              <Clock className="w-3 h-3" />
              Renews {new Date(o.renewal_date).toLocaleDateString()}
              {left != null && left >= 0 && ` · ${left}d`}
            </div>
          )}
          {left != null && left < 0 && (
            <div className="mt-2 text-xs text-destructive">Expired {Math.abs(left)}d ago</div>
          )}
        </div>
      </div>

      {(o.panel_url || o.server || o.server_password) && (
        <div className="mt-5 pt-4 border-t border-border grid gap-3 text-sm sm:grid-cols-3">
          {o.server && <CopyField label="Server address" value={o.server} />}
          {o.server_password && <CopyField label="Password" value={o.server_password} />}
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

      {o.status === "pending" && (
        <p className="mt-4 text-xs text-muted-foreground">
          Waiting for payment confirmation — this usually takes a few minutes.
        </p>
      )}
    </div>
  );
}

function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<"servers" | "history">("servers");
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
    enabled: !!user,
  });

  const active = useMemo(
    () => data?.filter((o) => o.status !== "rejected" && (daysLeft(o.renewal_date) ?? 1) >= 0) ?? [],
    [data],
  );
  const history = data ?? [];
  const spend = history
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  const nextRenewal = active
    .map((o) => o.renewal_date)
    .filter(Boolean)
    .sort()[0];

  const list = tab === "servers" ? active : history;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold">My servers</h1>
        <p className="mt-2 text-muted-foreground">
          {user ? `Signed in as ${user.email}` : "Sign in to view your servers."}
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

        {user && data && (
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {[
              { label: "Active servers", value: String(active.length) },
              { label: "Total orders", value: String(history.length) },
              { label: "Paid to date", value: `₹${spend}` },
              {
                label: "Next renewal",
                value: nextRenewal ? new Date(nextRenewal).toLocaleDateString() : "—",
              },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card/60 p-5">
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {user && (
          <div className="mt-8 inline-flex rounded-xl border border-border bg-card/60 p-1">
            {(["servers", "history"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm rounded-lg capitalize transition ${
                  tab === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                style={tab === t ? { background: "var(--gradient-primary)" } : undefined}
              >
                {t === "servers" ? "Active servers" : "Order history"}
              </button>
            ))}
          </div>
        )}

        {(authLoading || (user && isLoading)) && (
          <p className="mt-10 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading your servers…
          </p>
        )}

        {error && <p className="mt-10 text-destructive text-sm">Couldn't load your orders.</p>}

        {data && list.length === 0 && (
          <div className="mt-10 rounded-2xl border border-border bg-card/60 p-10 text-center">
            <Server className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              {tab === "servers" ? "No active servers yet." : "No orders yet."}
            </p>
            <Link
              to="/minecraft"
              className="mt-5 inline-block text-sm font-semibold px-5 py-2.5 rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Browse plans
            </Link>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {list.map((o) => (
            <OrderCard key={o.order_ref} o={o} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
