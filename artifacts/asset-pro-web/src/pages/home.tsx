import {
  ArrowUpRight,
  Boxes,
  Database,
  Languages,
  Monitor,
  Network,
  Package,
  ShieldCheck,
  Tag,
} from "lucide-react";
import {
  getGetCurrentUserQueryKey,
  getHealthCheckQueryKey,
  useGetCurrentUser,
  useHealthCheck,
} from "@workspace/api-client-react";
import { Link, Redirect } from "wouter";

import { useLang } from "../hooks/use-language";

export function HomeRoute() {
  const { t } = useLang();
  const user = useGetCurrentUser({
    query: { queryKey: getGetCurrentUserQueryKey(), retry: false },
  });

  if (user.isLoading) return <div className="state-panel">{t.loading}</div>;
  return user.data ? <Redirect to="/dashboard" /> : <Landing />;
}

export function Landing() {
  const { t, toggle, lang } = useLang();
  const health = useHealthCheck({
    query: {
      queryKey: getHealthCheckQueryKey(),
      refetchInterval: 45_000,
    },
  });
  const isConnected = health.data?.database === "connected";
  const connectionState = health.isLoading
    ? "checking"
    : isConnected
      ? "online"
      : "offline";
  const connectionLabel = health.isLoading
    ? t.loading
    : isConnected
      ? t.online
      : t.unavailable;

  return (
    <main className="landing" dir={lang === "ar" ? "rtl" : "ltr"}>
      <nav className="landing-nav">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Boxes size={20} />
          </span>
          <span>
            <b>{t.brand}</b>
            <small>{t.subtitle}</small>
          </span>
        </Link>
        <button className="language-btn" onClick={toggle}>
          <Languages size={16} />
          {t.language}
        </button>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy fade-in">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            {t.platformEyebrow}
          </div>
          <h1>{t.welcomeTitle}</h1>
          <p>{t.welcomeText}</p>
          <div className="hero-actions">
            <Link href="/sign-in" className="btn btn-primary">
              {t.signIn}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="hero-foot">
            <ShieldCheck size={16} />
            {t.secureWorkspace}
          </div>
        </div>

        <div className="hero-visual fade-in">
          <div className="visual-glow" />
          <div className="asset-stack">
            <div className="stack-top">
              <span className="stack-label">
                <Database size={14} />
                {t.assetOverview}
              </span>
              <span
                className={`live-dot ${connectionState}`}
                role="status"
                aria-live="polite"
              >
                {connectionLabel}
              </span>
            </div>
            <div className="visual-count">
              <span>{t.assetManagement}</span>
              <strong>—</strong>
              <small>
                {health.isLoading
                  ? t.loading
                  : isConnected
                    ? t.liveInventoryData
                    : t.waitingForDatabase}
              </small>
            </div>
            <div className="visual-lines">
              <div>
                <span>
                  <Monitor size={16} />
                  {t.devices}
                </span>
                <i />
                <b>—</b>
              </div>
              <div>
                <span>
                  <Network size={16} />
                  {t.network}
                </span>
                <i />
                <b>—</b>
              </div>
              <div>
                <span>
                  <Package size={16} />
                  {t.stock}
                </span>
                <i />
                <b>—</b>
              </div>
            </div>
            <div className="visual-foot">
              <span className="signal-bars">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span>
                {health.isLoading
                  ? t.loading
                  : isConnected
                    ? t.liveInventoryData
                    : t.waitingForDatabase}
              </span>
            </div>
          </div>
          <div className="floating-tag">
            <Tag size={17} />
            <span>
              ASSET
              <br />
              <b>PRO</b>
            </span>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>ASSET PRO WEB</span>
        <span>{t.landingTagline}</span>
        <span>
          © {new Date().getFullYear()} Asset Pro · Developed by Ali and Anas
        </span>
      </footer>
    </main>
  );
}
