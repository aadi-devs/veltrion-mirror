import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Shield, Zap, HardDrive, Headphones, Globe, RefreshCw } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/why-us")({
  head: () => ({
    meta: [
      { title: "Why Anuverse — Hardware, Uptime & Support" },
      { name: "description", content: "Why players and developers pick Anuverse: NVMe hardware, DDoS filtering, 99.9% uptime, instant setup and human support." },
      { property: "og:title", content: "Why Anuverse — Hardware, Uptime & Support" },
      { property: "og:description", content: "NVMe hardware, DDoS filtering, 99.9% uptime and human support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WhyUs,
});

const reasons = [
  { icon: Zap, title: "Instant provisioning", desc: "Orders are provisioned automatically through our panel — your server is online minutes after payment is confirmed." },
  { icon: HardDrive, title: "Pure NVMe storage", desc: "Every node runs enterprise NVMe. World loading, chunk saves and database writes stay fast under load." },
  { icon: Shield, title: "DDoS filtering", desc: "Always-on layer 4 and layer 7 filtering in front of every Minecraft and VPS node, at no extra cost." },
  { icon: Globe, title: "Low-latency routing", desc: "India-first routing with clean upstream peering, so your players get stable ping instead of lag spikes." },
  { icon: Headphones, title: "Real human support", desc: "Tickets and Discord answered by people who actually run the nodes — not a script." },
  { icon: RefreshCw, title: "Honest renewals", desc: "Clear renewal dates in your dashboard, no surprise price jumps, cancel whenever you like." },
];

const stats = [
  { value: "99.9%", label: "Uptime target" },
  { value: "<60s", label: "Setup time" },
  { value: "24/7", label: "Discord support" },
  { value: "NVMe", label: "On every node" },
];

function WhyUs() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-6 pt-16">
        <Reveal from="down"><h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Why Anuverse</h1></Reveal>
        <p className="mt-4 text-muted-foreground max-w-2xl text-lg">
          We run a small number of very good machines instead of a large number of oversold ones. That single
          decision is behind everything below.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} from="scale"><div className="lift scan-card h-full rounded-2xl border border-border bg-card/60 p-6 text-center">
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div></Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 70}>
            <div
              className="group lift scan-card h-full rounded-2xl border border-border bg-card/60 backdrop-blur p-6 hover:border-primary/60"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div
                className="icon-spin-hover w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}
              >
                <r.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="mt-4 font-semibold text-lg">{r.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
            </div>
            </Reveal>
          ))}
        </div>

        <Reveal from="scale"><div className="lift mt-14 rounded-2xl border border-border bg-card/60 p-10 text-center">
          <h2 className="text-2xl font-bold">Ready to move in?</h2>
          <p className="mt-2 text-muted-foreground">Pick a plan and we'll have you online before your friends log off.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/minecraft"
              className="glow-btn press text-sm font-semibold px-5 py-2.5 rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
            >
              Minecraft plans
            </Link>
            <Link to="/vps" className="press text-sm font-semibold px-5 py-2.5 rounded-lg border border-border hover:border-primary/60 transition-colors">
              VPS plans
            </Link>
          </div>
        </div></Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
