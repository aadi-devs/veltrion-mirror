import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Zap,
  Shield,
  Cpu,
  HardDrive,
  Globe,
  Headphones,
  ArrowRight,
  Sparkles,
  Terminal,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteChrome";
import { NodeGlobe } from "@/components/NodeGlobe";
import { HeroCanvas } from "@/components/HeroCanvas";
import { StatsGraph3D } from "@/components/StatsGraph3D";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anuverse Hosting — High-Performance Game & Web Hosting" },
      {
        name: "description",
        content:
          "Blazing fast Minecraft, VPS and web hosting powered by NVMe SSDs, DDoS protection, and 24/7 support. Launch your world with Anuverse.",
      },
      { property: "og:title", content: "Anuverse Hosting — Power Your Universe" },
      {
        property: "og:description",
        content: "Premium game & web hosting with instant setup, DDoS protection, and 99.9% uptime.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SiteHeader />
      <Hero />
      <Ticker />
      <StatsSection />
      <Features />
      <Plans />
      <Locations />
      <CTA />
      <Footer />
    </div>
  );
}

/* ---------------- Hero ---------------- */

const ROTATING = ["Minecraft servers", "VPS instances", "Discord bots", "web apps"];

function useTypewriter(words: string[]) {
  const [text, setText] = useState("");
  const idx = useRef(0);
  const dir = useRef<1 | -1>(1);

  useEffect(() => {
    let timer: number;
    const tick = () => {
      const word = words[idx.current % words.length]!;
      const cur = word.slice(0, text.length + dir.current);
      setText(cur);
      let delay = dir.current === 1 ? 65 : 32;
      if (dir.current === 1 && cur === word) {
        dir.current = -1;
        delay = 1600;
      } else if (dir.current === -1 && cur === "") {
        dir.current = 1;
        idx.current += 1;
        delay = 260;
      }
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, 90);
    return () => window.clearTimeout(timer);
  }, [text, words]);

  return text;
}

function Hero() {
  const typed = useTypewriter(ROTATING);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Subtle 3D tilt on the floating console card
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 12}deg) rotateX(${-py * 12}deg) translateZ(0)`;
    };
    const onLeave = () => {
      el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section className="relative pt-28 pb-28 px-6 overflow-hidden min-h-[94vh] flex items-center">
      <div className="absolute inset-0 z-0">
        <HeroCanvas />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, oklch(0.13 0.04 285 / 0.35) 55%, oklch(0.13 0.04 285) 100%)",
          }}
        />
        <div
          className="hero-orb absolute top-[18%] left-[12%] w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="hero-orb absolute bottom-[22%] right-[8%] w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "var(--accent-cyan)", animationDelay: "-7s" }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 w-full grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
        <div>
          <Reveal from="down">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs mb-8 lift">
              <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--primary-glow)" }} />
              <span className="text-muted-foreground">Now live · Ryzen 9 7950X nodes in 8 regions</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Deploy
              <br />
              <span className="shimmer-text caret">{typed}</span>
              <br />
              in 60 seconds.
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              No images, no fluff — just raw NVMe throughput, DDoS-absorbing edges and 99.9% uptime across a
              live global mesh you can spin with your own hands.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#plans"
                className="glow-btn press inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
              >
                Explore Plans <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#stats"
                className="press inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border bg-card/40 backdrop-blur hover:bg-card hover:border-primary/60 transition-all duration-300 hover:-translate-y-1"
              >
                See live stats
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal from="scale" delay={200}>
          <div
            ref={cardRef}
            className="float-y rounded-2xl border border-border bg-card/70 backdrop-blur-xl overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)", transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--primary-glow)" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent-cyan)" }} />
              <span className="ml-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Terminal className="w-3.5 h-3.5" /> anuverse@edge
              </span>
            </div>
            <ConsoleLines />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const CONSOLE = [
  { t: "$ anuverse deploy --plan quasar --region eu-fra", c: "fg" },
  { t: "→ allocating Ryzen 9 7950X vCores ......... ok", c: "cy" },
  { t: "→ attaching 80GB NVMe (Gen4) ............. ok", c: "cy" },
  { t: "→ arming DDoS shield (4.2 Tbps) .......... ok", c: "cy" },
  { t: "→ booting Paper 1.21 ..................... ok", c: "cy" },
  { t: "✓ live at play.anuverse.gg · 41ms · 20 TPS", c: "pk" },
];

function ConsoleLines() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= CONSOLE.length) {
      const r = window.setTimeout(() => setN(0), 4200);
      return () => window.clearTimeout(r);
    }
    const t = window.setTimeout(() => setN((v) => v + 1), 520);
    return () => window.clearTimeout(t);
  }, [n]);

  return (
    <div className="p-5 font-mono text-[12.5px] leading-7 min-h-[220px]">
      {CONSOLE.slice(0, n).map((l, i) => (
        <div
          key={l.t}
          style={{
            animation: "fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) both",
            color:
              l.c === "cy"
                ? "var(--accent-cyan)"
                : l.c === "pk"
                  ? "var(--primary-glow)"
                  : "var(--foreground)",
          }}
        >
          {l.t}
        </div>
      ))}
      {n < CONSOLE.length && <span className="caret" />}
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

/* ---------------- Ticker ---------------- */

const TICKER = [
  "99.98% UPTIME",
  "NVMe GEN4",
  "4.2 Tbps DDOS SHIELD",
  "RYZEN 9 7950X",
  "24 NODES",
  "60s DEPLOY",
  "24/7 HUMAN SUPPORT",
  "FULL MOD SUPPORT",
];

function Ticker() {
  return (
    <div className="marquee-wrap relative border-y border-border overflow-hidden py-3 bg-card/30">
      <div className="marquee-track flex gap-10 w-max whitespace-nowrap">
        {[...TICKER, ...TICKER].map((t, i) => (
          <span
            key={t + i}
            className="text-xs tracking-[0.25em] font-semibold text-muted-foreground flex items-center gap-10"
          >
            {t}
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary-glow)" }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 3D Stats ---------------- */

function StatsSection() {
  return (
    <section id="stats" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary-glow)" }}>
            Live Fleet Telemetry
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">Our numbers, in three dimensions.</h2>
          <p className="mt-4 text-muted-foreground">
            A real 3D graph — orbit it, zoom it, hover any bar to read the exact figure.
          </p>
        </Reveal>
        <Reveal from="scale" delay={120}>
          <StatsGraph3D />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Features ---------------- */

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
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary-glow)" }}>
            Why Anuverse
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">Built for players who hate lag.</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <div className="group lift scan-card h-full p-6 rounded-2xl border border-border bg-card/50 backdrop-blur hover:border-primary/60">
                <div
                  className="icon-spin-hover w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                >
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Plans ---------------- */

const plans = [
  { name: "Nebula", price: "2", ram: "4 GB", cpu: "200%", storage: "30 GB NVMe", slots: "Up to 20 players", popular: false },
  { name: "Quasar", price: "6", ram: "12 GB", cpu: "400%", storage: "80 GB NVMe", slots: "Up to 80 players", popular: true },
  { name: "Supernova", price: "14", ram: "32 GB", cpu: "800%", storage: "200 GB NVMe", slots: "Unlimited players", popular: false },
];

function Plans() {
  return (
    <section id="plans" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary-glow)" }}>
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">Pick a plan. Launch a world.</h2>
          <p className="mt-4 text-muted-foreground">
            Upgrade or cancel anytime. All plans include DDoS protection and full mod support.
          </p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 100} from="scale">
              <div
                className={`lift scan-card relative h-full p-8 rounded-2xl border bg-card/50 backdrop-blur ${
                  p.popular ? "border-primary md:-translate-y-3" : "border-border"
                }`}
                style={p.popular ? { boxShadow: "var(--shadow-glow)" } : {}}
              >
                {p.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground pulse-dot"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-bold">${p.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {[p.ram + " DDR5 RAM", p.cpu + " CPU (Ryzen 9)", p.storage, p.slots, "Free subdomain", "One-click modpacks"].map(
                    (f) => (
                      <li key={f} className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
                        <Check className="w-4 h-4 shrink-0" style={{ color: "var(--primary-glow)" }} />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ),
                  )}
                </ul>
                <a
                  href="/minecraft"
                  className={`glow-btn press mt-8 block text-center py-3 rounded-xl font-semibold ${
                    p.popular ? "text-primary-foreground" : "border border-border hover:bg-secondary"
                  }`}
                  style={p.popular ? { background: "var(--gradient-primary)" } : {}}
                >
                  Deploy {p.name}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Locations ---------------- */

function Locations() {
  return (
    <section id="locations" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--primary-glow)" }}>
            Global Network
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">Our nodes, live on the globe.</h2>
          <p className="mt-4 text-muted-foreground">Spin it, zoom it, hover a node to see where your server lives.</p>
        </Reveal>
        <Reveal from="scale" delay={100}>
          <NodeGlobe />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- CTA + Footer ---------------- */

function CTA() {
  return (
    <section id="support" className="py-24 px-6 border-t border-border">
      <Reveal from="scale">
        <div
          className="lift max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center border border-border relative overflow-hidden"
          style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-card)" }}
        >
          <div
            className="hero-orb absolute -top-20 -right-16 w-72 h-72 rounded-full blur-3xl opacity-30"
            style={{ background: "var(--primary)" }}
          />
          <h2 className="relative text-4xl md:text-5xl font-bold">Ready to launch your universe?</h2>
          <p className="relative mt-4 text-muted-foreground text-lg">Deploy in 60 seconds. 7-day money-back guarantee.</p>
          <a
            href="/minecraft"
            className="glow-btn press relative mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            Get started <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 group">
          <div
            className="icon-spin-hover w-6 h-6 rounded-md"
            style={{ background: "var(--gradient-primary)" }}
          />
          <span className="font-semibold text-foreground">Anuverse Hosting</span>
        </div>
        <p>© {new Date().getFullYear()} Anuverse. All rights reserved.</p>
      </div>
    </footer>
  );
}
