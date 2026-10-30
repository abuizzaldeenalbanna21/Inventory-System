import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  Boxes,
  Building2,
  ChevronDown,
  ChevronLeft,
  FileBarChart2,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Network,
  Search,
  Settings2,
  Tag,
  Users,
  Database,
  Warehouse,
} from "lucide-react";
import {
  getHealthCheckQueryKey,
  getGetCurrentUserQueryKey,
  useGetCurrentUser,
  useHealthCheck,
} from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { reportMeta } from "../translations";

import { useLang } from "../hooks/use-language";

export function Shell({
  children,
  title,
  description,
  active,
  actions,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  active?: string;
  actions?: ReactNode;
}) {
  const { t, toggle, lang } = useLang();
  const health = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 45_000 },
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const userQuery = useGetCurrentUser({
    query: { queryKey: getGetCurrentUserQueryKey(), retry: false },
  });
  const user = userQuery.data;
  const signOut = async () => {
    try {
      const response = await fetch("/api/web/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok)
        throw new Error(`Logout request failed with HTTP ${response.status}`);
      await queryClient.clear();
      setLocation("/");
    } catch (exception) {
      console.error("Sign-out failed.", exception);
      window.alert(t.signOutError);
    }
  };
  const nav = [
    {
      group: t.overview,
      links: [
        {
          href: "/dashboard",
          title: t.dashboard,
          icon: LayoutDashboard,
          key: "dashboard",
        },
      ],
    },
    {
      group: t.modules,
      links: [
        {
          href: "/modules/employee-devices",
          title: t.employeeDevices,
          icon: Monitor,
          key: "employee-devices",
        },
        {
          href: "/modules/network-assets",
          title: t.networkAssets,
          icon: Network,
          key: "network-assets",
        },
        {
          href: "/modules/employees",
          title: t.employees,
          icon: Users,
          key: "employees",
        },
        {
          href: "/modules/it-store",
          title: t.itStore,
          icon: Warehouse,
          key: "it-store",
        },
      ],
    },
    {
      group: t.reports,
      links: Object.entries(reportMeta).map(([key, title]) => ({
        href: `/reports/${key}`,
        title: lang === "ar" ? title.ar : title.en,
        icon: FileBarChart2,
        key: `report-${key}`,
      })),
    },
    {
      group: t.toolsSettings,
      links: [
        {
          href: "/movements",
          title: t.movements,
          icon: ArrowLeftRight,
          key: "movements",
        },
        { href: "/asset-tags", title: t.tags, icon: Tag, key: "asset-tags" },
        {
          href: "/settings",
          title: t.settings,
          icon: Settings2,
          key: "settings",
        },
      ],
    },
  ];
  return (
    <div
      className={`app-shell ${mobileOpen ? "menu-open" : ""}`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <aside className="sidebar sidebar-scroll">
        <Link href="/dashboard" className="brand side-brand">
          <span className="brand-mark">
            <Boxes size={20} />
          </span>
          <span>
            <b>{t.brand}</b>
            <small>{t.subtitle}</small>
          </span>
        </Link>
        <div className="workspace-label">
          <span className="workspace-symbol">
            <Building2 size={15} />
          </span>
          <span>
            <b>{t.admin}</b>
            <small>{user?.displayName || t.user}</small>
          </span>
          <ChevronDown size={14} />
        </div>
        <nav className="side-nav">
          {nav.map((group) => (
            <div className="nav-group" key={group.group}>
              <div className="nav-group-title">{group.group}</div>
              {group.links.map(({ href, title, icon: Icon, key }) => (
                <Link
                  key={key}
                  href={href}
                  className={`nav-link ${active === key ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                  data-testid={`link-nav-${key}`}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{title}</span>
                  {active === key && <i />}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="connection-card">
            <span className="connection-icon">
              <Database size={16} />
            </span>
            <span>
              <b>{t.currentStatus}</b>
              <small>
                {health.data?.database === "connected"
                  ? t.connected
                  : t.unavailable}
              </small>
            </span>
            <span
              className={
                health.data?.database === "connected"
                  ? "status-online"
                  : "status-offline"
              }
            />
          </div>
          <button
            className="nav-link signout"
            onClick={signOut}
            data-testid="button-sign-out"
          >
            <LogOut size={17} />
            <span>{t.signOut}</span>
          </button>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="mobile-backdrop"
          aria-label={t.close}
          onClick={() => setMobileOpen(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t.toggleNavigation}
          >
            <Menu size={19} />
          </button>
          <div className="crumb">
            <span>{t.brand}</span>
            <ChevronLeft size={14} />
            <b>{title}</b>
          </div>
          <div className="top-actions">
            <div className="global-search">
              <Search size={16} />
              <input
                placeholder={t.search}
                aria-label={t.search}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    window.dispatchEvent(
                      new CustomEvent("asset-search", {
                        detail: (e.target as HTMLInputElement).value,
                      }),
                    );
                }}
              />
              <kbd>⌘ K</kbd>
            </div>
            <button
              className="language-btn top-lang"
              onClick={toggle}
              data-testid="button-language"
            >
              <Languages size={15} />
              {t.language}
            </button>
            <span className="top-divider" />
            <div className="user-chip">
              <span className="avatar">
                {(user?.displayName || "A").slice(0, 1)}
              </span>
              <span>
                <b>{user?.displayName || t.user}</b>
                <small>{user?.email || "—"}</small>
              </span>
            </div>
          </div>
        </header>
        <div className="page-content fade-in">
          <div className="page-heading">
            <div>
              <div className="overline">
                {active === "dashboard"
                  ? t.overview
                  : active === "settings"
                    ? t.configuration
                    : t.operations}
              </div>
              <h1>{title}</h1>
              {description && <p>{description}</p>}
            </div>
            {actions && <div className="heading-actions">{actions}</div>}
          </div>
          {children}
          <footer
            style={{
              color: "#647a77",
              fontSize: 12,
              marginTop: 32,
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} Asset Pro · Developed by Ali and Anas
          </footer>
        </div>
      </main>
    </div>
  );
}
