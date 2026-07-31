import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";
import * as api from "@/lib/api";
import type { BillingCycle } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

type Search = { cycle: BillingCycle; category: "minecraft" | "vps" };

export const Route = createFileRoute("/checkout/$planId")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    cycle: (search.cycle as BillingCycle) ?? "monthly",
    category: (search.category as Search["category"]) ?? "minecraft",
  }),
  head: () => ({
    meta: [
      { title: "Checkout — Anuverse Hosting" },
      { name: "description", content: "Complete your Anuverse order: confirm your plan, pay by UPI and submit your payment reference." },
      { property: "og:title", content: "Checkout — Anuverse Hosting" },
      { property: "og:description", content: "Confirm your plan and complete payment for your Anuverse server." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { planId } = Route.useParams();
  const { cycle, category } = Route.useSearch() as Search;
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const plansQuery = useQuery({
    queryKey: [category === "vps" ? "vps-plans" : "minecraft-plans"],
    queryFn: category === "vps" ? api.getVpsPlans : api.getMinecraftPlans,
  });

  const found = plansQuery.data ? api.findPlan(plansQuery.data, planId) : null;

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [order, setOrder] = useState<api.CreatedOrder | null>(null);
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await api.createOrder({
        plan_id: planId,
        plan_category: category,
        billing_cycle: cycle,
        customer_name: customerName,
        email,
        discord,
      });
      setOrder(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create order");
    } finally {
      setBusy(false);
    }
  }

  async function confirmPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!order || !screenshot) return;
    setBusy(true);
    setError(null);
    try {
      await api.submitPayment(order.order_ref, utr, screenshot);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit payment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold">Checkout</h1>

        <div
          className="mt-6 rounded-2xl border border-border bg-card/60 backdrop-blur p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {plansQuery.isLoading && (
            <p className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading plan…
            </p>
          )}
          {found && (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground">{found.category.name}</div>
                <div className="text-xl font-bold">{found.plan.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {found.plan.ram} RAM · {found.plan.vcores} vCores · {found.plan.disk ?? found.plan.nvme} NVMe
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">₹{found.plan.price[cycle]}</div>
                <div className="text-sm text-muted-foreground capitalize">{cycle}</div>
              </div>
            </div>
          )}
          {plansQuery.data && !found && <p className="text-destructive">Plan not found.</p>}
        </div>

        {!authLoading && !user && (
          <div className="mt-6 rounded-2xl border border-border bg-card/60 p-6">
            <p className="text-sm text-muted-foreground">You need an account to place an order.</p>
            <Link
              to="/auth"
              className="mt-4 inline-block text-sm font-semibold px-4 py-2.5 rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Sign in to continue
            </Link>
          </div>
        )}

        {user && !order && (
          <form onSubmit={placeOrder} className="mt-6 rounded-2xl border border-border bg-card/60 p-6 space-y-4">
            <h2 className="font-semibold">Your details</h2>
            <Field label="Full name" value={customerName} onChange={setCustomerName} required />
            <Field label="Email" value={email} onChange={setEmail} type="email" required />
            <Field label="Discord username" value={discord} onChange={setDiscord} required />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              disabled={busy}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-primary-foreground disabled:opacity-60"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Continue to payment
            </button>
          </form>
        )}

        {order && !done && (
          <div className="mt-6 rounded-2xl border border-border bg-card/60 p-6 space-y-5">
            <div>
              <h2 className="font-semibold">Pay ₹{order.amount} via UPI</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Order reference <span className="font-mono text-foreground">{order.order_ref}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={order.upi_uri}
                className="text-sm font-semibold px-5 py-2.5 rounded-lg text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                Open UPI app
              </a>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(order.upi_uri)}
                className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border border-border hover:bg-card transition"
              >
                <Copy className="w-4 h-4" /> Copy payment link
              </button>
            </div>

            <form onSubmit={confirmPayment} className="space-y-4 pt-2 border-t border-border">
              <h3 className="font-semibold pt-4">Confirm your payment</h3>
              <Field label="UTR / transaction ID" value={utr} onChange={setUtr} required />
              <label className="block">
                <span className="text-sm text-muted-foreground">Payment screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                  className="mt-1 w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:text-secondary-foreground"
                />
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                disabled={busy}
                className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-lg text-primary-foreground disabled:opacity-60"
                style={{ background: "var(--gradient-primary)" }}
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />} Submit payment
              </button>
            </form>
          </div>
        )}

        {done && (
          <div className="mt-6 rounded-2xl border border-border bg-card/60 p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
            <h2 className="mt-4 text-xl font-bold">Payment submitted</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Our team is verifying your transaction. Your server will be provisioned shortly.
            </p>
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="mt-6 text-sm font-semibold px-5 py-2.5 rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Go to dashboard
            </button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition"
      />
    </label>
  );
}
