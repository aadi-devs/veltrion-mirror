import { createFileRoute } from "@tanstack/react-router";
import { Check, Zap, Shield, Cpu, HardDrive, Globe, Headphones, Server, ArrowRight, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-nebula.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anuverse Hosting — High-Performance Game & Web Hosting" },
      { name: "description", content: "Blazing fast Minecraft, VPS and web hosting powered by NVMe SSDs, DDoS protection, and 24/7 support. Launch your world with Anuverse." },
      { property: "og:title", content: "Anuverse Hosting — Power Your Universe" },
      { property: "og:description", content: "Premium game & web hosting with instant setup, DDoS protection, and 99.9% uptime." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <Features />
      <Plans />
      <Locations />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-lg" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }} />
          Anuverse
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#plans" className="hover:text-foreground transition">Plans</a>
          <a href="#locations" className="hover:text-foreground transition">Locations</a>
          <a href="#support" className="hover:text-foreground transition">Support</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">Login</a>
          <a href="#plans" className="text-sm font-semibold px-4 py-2 rounded-lg text-primary-foreground" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-20 pb-32 px-6" style={{ background: "var(--gradient-hero)" }}>
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur text-xs mb-8">
          <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--primary-glow)" }} />
          <span className="text-muted-foreground">Now live · Ryzen 9 7950X nodes in 8 regions</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          Hosting that bends
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
            the universe to your will.
          </span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Deploy Minecraft servers, VPS instances and websites in under 60 seconds. NVMe storage, DDoS-protected, 99.9% uptime — all for a fair price.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a href="#plans" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            Explore Plans <ArrowRight className="w-4 h-4" />
          </a>
          <a href="#features" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border bg-card/40 backdrop-blur hover:bg-card transition">
            See features
          </a>
        </div>

        <div className="mt-16 relative rounded-2xl overflow-hidden border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
          <img src={heroImg} alt="Anuverse network visualization" width={1600} height={1000} className="w-full h-auto" />
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Zap, title: "Instant Deploy", desc: "Your server spins up in under 60 seconds. No waiting, no tickets." },
  { icon: Shield, title: "DDoS Protected", desc: "Enterprise-grade mitigation absorbs multi-Tbps attacks silently." },
  { icon: Cpu, title: "Ryzen 9 CPUs", desc: "Latest-gen 7950X processors clocked at 5.7GHz for buttery TPS." },
  { icon: HardDrive, title: "NVMe Storage", desc: "Blazing NVMe SSDs mean world loads and map saves happen instantly." },
  { icon: Globe, title: "Global Regions", desc: "8 datacenters across NA, EU, and Asia keep pings under 30ms." },
  { icon: Headphones, title: "24/7 Support", desc: "Real engineers on Discord — most tickets answered in minutes." },
];

function Features() {
  return (
    <section id="features" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary-glow)" }}>Why Anuverse</p>
          <h2 className="text-4xl md:text-5xl font-bold">Built for players who hate lag.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur hover:border-primary/50 transition group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const plans = [
  { name: "Nebula", price: "2", ram: "4 GB", cpu: "200%", storage: "30 GB NVMe", slots: "Up to 20 players", popular: false },
  { name: "Quasar", price: "6", ram: "12 GB", cpu: "400%", storage: "80 GB NVMe", slots: "Up to 80 players", popular: true },
  { name: "Supernova", price: "14", ram: "32 GB", cpu: "800%", storage: "200 GB NVMe", slots: "Unlimited players", popular: false },
];

function Plans() {
  return (
    <section id="plans" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary-glow)" }}>Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold">Pick a plan. Launch a world.</h2>
          <p className="mt-4 text-muted-foreground">Upgrade or cancel anytime. All plans include DDoS protection and full mod support.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative p-8 rounded-2xl border bg-card/50 backdrop-blur ${p.popular ? "border-primary" : "border-border"}`}
              style={p.popular ? { boxShadow: "var(--shadow-glow)" } : {}}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold">${p.price}</span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {[p.ram + " DDR5 RAM", p.cpu + " CPU (Ryzen 9)", p.storage, p.slots, "Free subdomain", "One-click modpacks"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4" style={{ color: "var(--primary-glow)" }} />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`mt-8 block text-center py-3 rounded-xl font-semibold transition ${p.popular ? "text-primary-foreground" : "border border-border hover:bg-secondary"}`}
                style={p.popular ? { background: "var(--gradient-primary)" } : {}}
              >
                Deploy {p.name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const locations = ["New York", "Los Angeles", "Dallas", "London", "Frankfurt", "Warsaw", "Singapore", "Sydney"];

function Locations() {
  return (
    <section id="locations" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary-glow)" }}>Global Network</p>
          <h2 className="text-4xl md:text-5xl font-bold">8 regions. One low ping.</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {locations.map((loc) => (
            <div key={loc} className="p-5 rounded-xl border border-border bg-card/40 backdrop-blur flex items-center gap-3">
              <Server className="w-4 h-4" style={{ color: "var(--primary-glow)" }} />
              <span className="font-medium">{loc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="support" className="py-24 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center border border-border relative overflow-hidden" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-card)" }}>
        <h2 className="text-4xl md:text-5xl font-bold">Ready to launch your universe?</h2>
        <p className="mt-4 text-muted-foreground text-lg">Deploy in 60 seconds. 7-day money-back guarantee.</p>
        <a href="#plans" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
          Get started <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md" style={{ background: "var(--gradient-primary)" }} />
          <span className="font-semibold text-foreground">Anuverse Hosting</span>
        </div>
        <p>© {new Date().getFullYear()} Anuverse. All rights reserved.</p>
      </div>
    </footer>
  );
}
