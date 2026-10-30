import {
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  CircleAlert,
  Monitor,
  Network,
  Package,
  Settings2,
  Tag,
  Users,
  RefreshCw,
  ScanLine,
} from "lucide-react";
import {
  getHealthCheckQueryKey,
  getGetDashboardActivityQueryKey,
  getGetDashboardSummaryQueryKey,
  useGetDashboardActivity,
  useGetDashboardSummary,
  useHealthCheck,
} from "@workspace/api-client-react";
import { Link } from "wouter";

import { ActivityList, EmptyState, StatCard } from "../components/shared-ui";
import { Shell } from "../components/shell";
import { useLang } from "../hooks/use-language";

export function DashboardPage() {
  const { t, lang } = useLang();
  const health = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 45_000 },
  });
  const summary = useGetDashboardSummary({
    query: {
      queryKey: getGetDashboardSummaryQueryKey(),
      enabled: health.data?.database === "connected",
    },
  });
  const activity = useGetDashboardActivity(
    { limit: 8 },
    {
      query: {
        queryKey: getGetDashboardActivityQueryKey({ limit: 8 }),
        enabled: health.data?.database === "connected",
      },
    },
  );
  const data = summary.data;
  const isDisconnected = health.data?.database !== "connected";
  const cards = [
    {
      label: t.devices,
      value: data?.totalDevices,
      icon: Monitor,
      tone: "teal",
      foot: `${t.assigned}: ${data?.inUseDevices ?? "—"} · ${t.storedCount}: ${data?.storedDevices ?? "—"}`,
    },
    {
      label: t.network,
      value: data?.networkAssets,
      icon: Network,
      tone: "blue",
      foot: t.allRecords,
    },
    {
      label: t.employeesCount,
      value: data?.employees,
      icon: Users,
      tone: "amber",
      foot: t.allRecords,
    },
    {
      label: t.stock,
      value: data?.stockItems,
      icon: Package,
      tone: "rose",
      foot: `${t.lowStock}: ${data?.lowStockItems ?? "—"}`,
    },
  ];
  return (
    <Shell
      title={t.dashboard}
      description={t.dashboardIntro}
      active="dashboard"
      actions={
        <span
          className={`health-chip ${isDisconnected ? "offline" : "online"}`}
        >
          <i />
          {isDisconnected ? t.unavailable : t.connected}
        </span>
      }
    >
      {isDisconnected && (
        <div className="inline-notice">
          <CircleAlert size={17} />
          <span>{t.noConnection}</span>
          <button onClick={() => health.refetch()}>{t.retry}</button>
        </div>
      )}
      {!isDisconnected && summary.isError && (
        <div className="inline-notice danger-notice">
          <CircleAlert size={17} />
          <span>{t.error}</span>
          <button onClick={() => summary.refetch()}>{t.retry}</button>
        </div>
      )}
      <div className="stats-grid">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            {...card}
            value={isDisconnected ? "—" : (card.value ?? "—")}
          />
        ))}
      </div>
      <section className="status-strip">
        <div>
          <div className="section-title">
            <span>{t.currentStatus}</span>
            <small>{t.deviceCondition}</small>
          </div>
        </div>
        <div className="status-metrics">
          {[
            {
              label: t.assigned,
              value: data?.inUseDevices,
              icon: BadgeCheck,
              color: "green",
            },
            {
              label: t.storedCount,
              value: data?.storedDevices,
              icon: Package,
              color: "gold",
            },
            {
              label: t.service,
              value: data?.maintenanceDevices,
              icon: RefreshCw,
              color: "blue",
            },
            {
              label: t.damagedCount,
              value: data?.damagedDevices,
              icon: CircleAlert,
              color: "red",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div className="status-metric" key={label}>
              <span className={`metric-icon ${color}`}>
                <Icon size={15} />
              </span>
              <div>
                <b>{isDisconnected ? "—" : (value ?? "—")}</b>
                <small>{label}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="activity-section">
        <div className="section-head">
          <div className="section-title">
            <span>{t.recentActivity}</span>
            <small>{t.activityDescription}</small>
          </div>
          <Link className="subtle-link" href="/movements">
            {t.allActivity}
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <ActivityList
          items={activity.data}
          isLoading={!isDisconnected && activity.isLoading}
          error={!isDisconnected && !!activity.isError}
          retry={() => activity.refetch()}
        />
        {isDisconnected && (
          <EmptyState title={t.noActivity} detail={t.noConnection} />
        )}
      </section>
      <div className="dashboard-lower">
        <Link href="/movements" className="quick-action">
          <span className="quick-icon">
            <ScanLine size={19} />
          </span>
          <span>
            <b>{t.movements}</b>
            <small>{t.assignTransferConsume}</small>
          </span>
          <ChevronLeft size={16} />
        </Link>
        <Link href="/asset-tags" className="quick-action">
          <span className="quick-icon gold">
            <Tag size={19} />
          </span>
          <span>
            <b>{t.tags}</b>
            <small>{t.managePrintTags}</small>
          </span>
          <ChevronLeft size={16} />
        </Link>
        <Link href="/settings" className="quick-action">
          <span className="quick-icon blue">
            <Settings2 size={19} />
          </span>
          <span>
            <b>{t.settings}</b>
            <small>{t.branchDepartmentLookups}</small>
          </span>
          <ChevronLeft size={16} />
        </Link>
      </div>
    </Shell>
  );
}
