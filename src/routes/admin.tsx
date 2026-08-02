import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldAlert, Check, X, Save } from "lucide-react";
import {
  getAllOrders,
  markOrderPaid,
  rejectOrder,
  getMinecraftPlans,
  getVpsPlans,
  saveAdminPlan,
  type Plan,
  type BillingCycle,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Area — Anuverse" },
      { name: "description", content: "Anuverse staff area for reviewing orders, confirming payments and editing hosting plans." },
      { property: "og:title", content: "Admin Area — Anuverse" },
      { property: "og:description", content: "Staff order review and plan management." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<"orders" | "plans" | "nodes">("orders");

  if (isLoading) {
    return (
      <Shell>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Checking access…
        </p>
      </Shell>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <Shell>
        <div className="rounded-2xl border border-border bg-card/60 p-10 text-center">
          <ShieldAlert className="w-8 h-8 mx-auto text-destructive" />
          <p className="mt-3 font-semibold">Staff only</p>
          <p className="text-sm text-muted-foreground mt-1">
            {user ? "Your account doesn't have admin access." : "Sign in with an admin account to continue."}
          </p>
          {!user && (
            <Link
              to="/auth"
              className="mt-5 inline-block text-sm font-semibold px-5 py-2.5 rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Sign in
            </Link>
          )}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="inline-flex rounded-xl border border-border bg-card/60 p-1">
        {(["orders", "plans", "nodes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-lg capitalize transition ${
              tab === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            style={tab === t ? { background: "var(--gradient-primary)" } : undefined}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "orders" ? <OrdersPanel /> : tab === "plans" ? <PlansPanel /> : <NodesPanel />}
    </Shell>
  );
}

function NodesPanel() {
  const [nodes, setNodes] = useState<NetworkNode[]>(() => loadNodes());

  useEffect(() => {
    setNodes(loadNodes());
  }, []);

  const commit = (next: NetworkNode[]) => {
    setNodes(next);
    saveNodes(next);
  };

  const update = (id: string, patch: Partial<NetworkNode>) =>
    commit(nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  const add = () =>
    commit([
      ...nodes,
      {
        id: `node-${Date.now()}`,
        city: "New city",
        country: "Country",
        lat: 0,
        lon: 0,
        status: "planned",
      },
    ]);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={add}
          className="text-xs font-semibold px-3 py-2 rounded-lg text-primary-foreground inline-flex items-center gap-1"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add node
        </button>
        <button
          onClick={() => {
            resetNodes();
            setNodes(loadNodes());
          }}
          className="text-xs font-semibold px-3 py-2 rounded-lg border border-border inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset to defaults
        </button>
        <span className="text-xs text-muted-foreground">
          Changes appear instantly on the landing page globe.
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((n) => (
          <div key={n.id} className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <input
                value={n.city}
                onChange={(e) => update(n.id, { city: e.target.value })}
                className="flex-1 bg-transparent border-b border-border pb-1 font-semibold focus:outline-none focus:border-primary"
                aria-label="City"
              />
              <button
                onClick={() => commit(nodes.filter((x) => x.id !== n.id))}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${n.city}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Field label="Country" value={n.country} onChange={(v) => update(n.id, { country: v })} />
              <label className="block">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Status</span>
                <select
                  value={n.status}
                  onChange={(e) => update(n.id, { status: e.target.value as NetworkNode["status"] })}
                  className="w-full bg-transparent border border-border rounded-lg px-2 py-1 mt-1 focus:outline-none focus:border-primary"
                >
                  {["online", "maintenance", "planned"].map((s) => (
                    <option key={s} value={s} className="bg-background">
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label="Latitude"
                value={String(n.lat)}
                onChange={(v) => update(n.id, { lat: Number(v) || 0 })}
              />
              <Field
                label="Longitude"
                value={String(n.lon)}
                onChange={(v) => update(n.id, { lon: Number(v) || 0 })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold">Admin area</h1>
        <p className="mt-2 text-muted-foreground">Review payments, provision servers and manage the catalogue.</p>
        <div className="mt-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

function OrdersPanel() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-orders"], queryFn: getAllOrders });
  const [filter, setFilter] = useState<string>("all");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-orders"] });
  const approve = useMutation({ mutationFn: markOrderPaid, onSuccess: invalidate });
  const reject = useMutation({ mutationFn: rejectOrder, onSuccess: invalidate });

  const rows = (data ?? []).filter((o) => filter === "all" || o.status === filter);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "paid", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg border capitalize transition ${
              filter === f ? "border-primary text-primary" : "border-border text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="mt-8 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
        </p>
      )}
      {error && <p className="mt-8 text-destructive text-sm">Couldn't load orders.</p>}

      <div className="mt-6 space-y-4">
        {rows.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-card/60 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold">{o.plan_name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {o.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {o.provision_status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {o.user_name ?? o.customer_name} · {o.user_email} · Discord {o.discord}
                </p>
                <p className="mt-1 text-xs font-mono text-muted-foreground">
                  {o.order_ref} · UTR {o.utr || "—"} · {o.ram} / {o.vcores} vCores / {o.disk}
                </p>
                {o.provision_error && <p className="mt-2 text-sm text-destructive">{o.provision_error}</p>}
              </div>
              <div className="text-right">
                <div className="font-bold">₹{o.price}</div>
                <div className="text-xs text-muted-foreground capitalize">{o.billing_cycle}</div>
                <div className="mt-3 flex gap-2 justify-end">
                  <button
                    onClick={() => approve.mutate(o.order_ref)}
                    disabled={approve.isPending}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-primary-foreground inline-flex items-center gap-1"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Check className="w-3.5 h-3.5" /> Mark paid
                  </button>
                  <button
                    onClick={() => reject.mutate(o.order_ref)}
                    disabled={reject.isPending}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border inline-flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            </div>
            {o.payment_screenshot && (
              <a
                href={o.payment_screenshot}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs text-primary hover:underline"
              >
                View payment screenshot
              </a>
            )}
          </div>
        ))}
        {data && rows.length === 0 && <p className="text-sm text-muted-foreground">No orders in this view.</p>}
      </div>
    </div>
  );
}

function PlansPanel() {
  const mc = useQuery({ queryKey: ["minecraft-plans"], queryFn: getMinecraftPlans });
  const vps = useQuery({ queryKey: ["vps-plans"], queryFn: getVpsPlans });
  const groups = [
    { key: "minecraft" as const, label: "Minecraft", q: mc },
    { key: "vps" as const, label: "VPS", q: vps },
  ];

  return (
    <div className="mt-6 space-y-12">
      {groups.map(({ key, label, q }) => (
        <section key={key}>
          <h2 className="text-xl font-semibold">{label} plans</h2>
          {q.isLoading && (
            <p className="mt-4 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </p>
          )}
          {q.data?.map((cat) => (
            <div key={cat.id} className="mt-6">
              <div className="text-sm text-muted-foreground">
                {cat.name} <span className="font-mono text-xs">({cat.id})</span>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.plans.map((plan) => (
                  <PlanEditor key={plan.id} category={key} categoryId={cat.id} plan={plan} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

const cycleKeys: BillingCycle[] = ["monthly", "quarterly", "annually"];

function PlanEditor({
  category,
  categoryId,
  plan,
}: {
  category: "minecraft" | "vps";
  categoryId: string;
  plan: Plan;
}) {
  const [draft, setDraft] = useState<Plan>(plan);
  const save = useMutation({ mutationFn: (p: Plan) => saveAdminPlan(category, categoryId, p) });

  const set = (patch: Partial<Plan>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3">
      <input
        value={draft.name}
        onChange={(e) => set({ name: e.target.value })}
        className="w-full bg-transparent border-b border-border pb-1 font-semibold focus:outline-none focus:border-primary"
        aria-label="Plan name"
      />
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Field label="RAM" value={draft.ram ?? ""} onChange={(v) => set({ ram: v })} />
        <Field label="vCores" value={String(draft.vcores ?? "")} onChange={(v) => set({ vcores: Number(v) || 0 })} />
        <Field label="Disk" value={draft.disk ?? draft.nvme ?? ""} onChange={(v) => set({ disk: v })} />
        <Field label="Players" value={String(draft.players ?? "")} onChange={(v) => set({ players: Number(v) || 0 })} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        {cycleKeys.map((c) => (
          <Field
            key={c}
            label={c}
            value={String(draft.price?.[c] ?? "")}
            onChange={(v) => set({ price: { ...draft.price, [c]: Number(v) || 0 } })}
          />
        ))}
      </div>
      <button
        onClick={() => save.mutate(draft)}
        disabled={save.isPending}
        className="w-full text-xs font-semibold px-3 py-2 rounded-lg text-primary-foreground inline-flex items-center justify-center gap-1"
        style={{ background: "var(--gradient-primary)" }}
      >
        {save.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        {save.isSuccess ? "Saved" : "Save plan"}
      </button>
      {save.error && <p className="text-xs text-destructive">{(save.error as Error).message}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground capitalize">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-border rounded-lg px-2 py-1 mt-1 focus:outline-none focus:border-primary"
      />
    </label>
  );
}
