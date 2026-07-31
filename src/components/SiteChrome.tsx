import { Link } from "@tanstack/react-router";
import { ChevronDown, Gamepad2, Box, Sparkles, Cloud, Database, Cpu, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const minecraftItems = [
  { icon: Gamepad2, title: "Java Edition", desc: "Vanilla, modded and modpack servers" },
  { icon: Box, title: "Bedrock Edition", desc: "Cross-play survival and realms" },
  { icon: Sparkles, title: "Modpacks", desc: "Forge, Fabric and one-click installs" },
];

const vpsItems = [
  { icon: Cloud, title: "Linux VPS", desc: "Full-root Ubuntu, Debian and AlmaLinux" },
  { icon: Database, title: "Storage VPS", desc: "Big NVMe blocks for backups and media" },
  { icon: Cpu, title: "Gaming VPS", desc: "High-frequency cores for game nodes" },
];

function NavDropdown({
  label,
  to,
  items,
}: {
  label: string;
  to: string;
  items: { icon: React.ElementType; title: string; desc: string }[];
}) {
  return (
    <div className="relative group">
      <Link
        to={to}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/60 transition"
      >
        {label}
        <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
      </Link>
      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[320px]">
        <div
          className="rounded-2xl border border-border bg-popover/95 backdrop-blur-xl p-2"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {items.map((item) => (
            <Link key={item.title} to={to} className="flex items-start gap-3 p-3 rounded-xl hover:bg-card transition">
              <div
                className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}
              >
                <item.icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div
            className="w-8 h-8 rounded-lg"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          />
          Anuverse
        </Link>
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <NavDropdown label="Minecraft" to="/minecraft" items={minecraftItems} />
          <NavDropdown label="VPS" to="/vps" items={vpsItems} />
          <Link to="/" hash="features" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/60 transition">
            Why Us
          </Link>
          <Link to="/" hash="support" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/60 transition">
            Discord
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
              Login
            </Link>
          )}
          <Link
            to="/minecraft"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <div className="w-6 h-6 rounded-md" style={{ background: "var(--gradient-primary)" }} />
          Anuverse Hosting
        </div>
        <p>© {new Date().getFullYear()} Anuverse. All rights reserved.</p>
      </div>
    </footer>
  );
}
