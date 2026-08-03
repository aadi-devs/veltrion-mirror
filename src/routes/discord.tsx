import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Crown, Users, LifeBuoy, ExternalLink } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { Reveal } from "@/components/Reveal";

const DISCORD_INVITE = "https://discord.gg/anuverse";
const OWNER_NAME = "Anu";
const OWNER_TAG = "@anuverse";

export const Route = createFileRoute("/discord")({
  head: () => ({
    meta: [
      { title: "Join the Anuverse Discord — Support & Community" },
      { name: "description", content: "Join the Anuverse Discord for setup help, ticket support, uptime updates and the community behind our hosting." },
      { property: "og:title", content: "Join the Anuverse Discord" },
      { property: "og:description", content: "Support, uptime updates and the Anuverse hosting community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiscordPage,
});

function DiscordPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-6 pt-16">
        <Reveal from="down"><h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Anuverse Discord</h1></Reveal>
        <p className="mt-4 text-muted-foreground max-w-2xl text-lg">
          Support tickets, node status, giveaways and everyone else running a server with us — all in one place.
        </p>

        <Reveal from="scale" delay={120}><div
          className="lift group mt-10 rounded-2xl border border-border bg-card/60 backdrop-blur p-8 flex flex-col sm:flex-row items-center gap-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div
            className="icon-spin-hover float-y w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            <Crown className="w-9 h-9 text-primary-foreground" />
          </div>
          <div className="text-center sm:text-left">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Owner &amp; Founder</div>
            <div className="text-2xl font-bold mt-1">{OWNER_NAME}</div>
            <div className="text-sm text-muted-foreground font-mono">{OWNER_TAG}</div>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              Runs the nodes, answers tickets and ships the panel. Ping him in the server if something looks wrong.
            </p>
          </div>
        </div></Reveal>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { icon: LifeBuoy, title: "Ticket support", desc: "Open a ticket and get a human, usually within minutes." },
            { icon: Users, title: "Community", desc: "Server owners sharing plugins, modpacks and configs." },
            { icon: MessageCircle, title: "Status updates", desc: "Maintenance and node status announced before it hits you." },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 90}><div className="group lift scan-card h-full rounded-2xl border border-border bg-card/60 p-6 hover:border-primary/60">
              <c.icon className="icon-spin-hover w-5 h-5 text-primary" />
              <div className="mt-3 font-semibold">{c.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </div></Reveal>
          ))}
        </div>

        <Reveal delay={80}><div className="mt-10 text-center">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noreferrer"
            className="glow-btn press inline-flex items-center gap-2 text-base font-semibold px-8 py-3.5 rounded-xl text-primary-foreground"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            Join the Discord <ExternalLink className="w-4 h-4" />
          </a>
          <p className="mt-3 text-xs text-muted-foreground">Opens {DISCORD_INVITE} in a new tab.</p>
        </div></Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
