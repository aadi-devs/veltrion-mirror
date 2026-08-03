import { Link } from "@tanstack/react-router";
import { ChevronDown, Cpu, Server, Zap, Cloud, Settings2, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { minecraftGroups, vpsGroups } from "@/lib/catalog";

const icons: Record<string, React.ElementType> = {
  intel: Cpu,
  "amd-epyc": Server,
  "amd-ryzen": Zap,
  ovh: Cloud,
  custom: Settings2,
};

function NavDropdown({
  label,
  to,
  items,
}: {
  label: string;
  to: string;
  items: { slug: string; label: string; tagline: string }[];
}) {
  return (
    <div className="relative group">
      <Link
        to={to}
        className="relative flex items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all duration-300 group-hover:-translate-y-0.5"
      >
        {label}
        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />
        <span
          className="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-[1.5px] origin-right scale-x-0 group-hover:scale-x-100 group-hover:origin-left transition-transform duration-300"
          style={{ background: "var(--gradient-primary)" }}
        />
      </Link>
      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 min-w-[340px] opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div
          className="relative rounded-2xl border border-border bg-popover/95 backdrop-blur-xl p-2 origin-top scale-95 group-hover:scale-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <span
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 rounded-[3px] border-l border-t border-border bg-popover"
            aria-hidden
          />
          {items.map((item, i) => {
            const Icon = icons[item.slug] ?? Server;
            return (
              <Link
                key={item.slug}
                to={`${to}/${item.slug}`}
                className="group/item flex items-start gap-3 p-3 rounded-xl hover:bg-card transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 hover:translate-x-1"
                style={{ transitionDelay: `${80 + i * 60}ms` }}
              >
                <div
                  className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover/item:rotate-[-8deg] group-hover/item:scale-110"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Icon className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.tagline}</div>
                </div>
              </Link>
            );
          })}
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
          <NavDropdown label="Minecraft" to="/minecraft" items={minecraftGroups} />
          <NavDropdown label="VPS" to="/vps" items={vpsGroups} />
          <Link to="/why-us" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/60 transition">
            Why Us
          </Link>
          <Link to="/discord" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card/60 transition">
            Discord
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-sm text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1"
                >
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground hidden sm:block">
                My servers
              </Link>
              <button
                onClick={logout}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                aria-label="Log out"
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
      <div className="max-w-7xl mx-auto px-6 grid gap-8 sm:grid-cols-4 text-sm text-muted-foreground">
        <div>
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <div className="w-6 h-6 rounded-md" style={{ background: "var(--gradient-primary)" }} />
            Anuverse Hosting
          </div>
          <p className="mt-3">Minecraft and VPS hosting on NVMe hardware.</p>
        </div>
        <div>
          <div className="font-semibold text-foreground">Minecraft</div>
          <ul className="mt-3 space-y-2">
            {minecraftGroups.map((g) => (
              <li key={g.slug}>
                <Link to={`/minecraft/${g.slug}`} className="hover:text-foreground">
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-semibold text-foreground">VPS</div>
          <ul className="mt-3 space-y-2">
            {vpsGroups.map((g) => (
              <li key={g.slug}>
                <Link to={`/vps/${g.slug}`} className="hover:text-foreground">
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-semibold text-foreground">Company</div>
          <ul className="mt-3 space-y-2">
            <li>
              <Link to="/why-us" className="hover:text-foreground">Why Us</Link>
            </li>
            <li>
              <Link to="/discord" className="hover:text-foreground">Discord</Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">My servers</Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="max-w-7xl mx-auto px-6 mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Anuverse. All rights reserved.
      </p>
    </footer>
  );
}
