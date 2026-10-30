import { type ReactNode } from "react";
import {
  Activity,
  CircleAlert,
  Monitor,
  RefreshCw,
  Eye,
  Database,
} from "lucide-react";
import { ActivityItem, FieldDefinition } from "@workspace/api-client-react";
import {
  arabicFieldLabels,
  localizeActivityDescription,
  localizeActivityTitle,
  localizeStatus,
  normalizeLabel,
  type Lang,
} from "../translations";

import { useLang } from "../hooks/use-language";

export function IconButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      className={`icon-btn ${danger ? "danger" : ""}`}
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      <Icon size={15} />
    </button>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  testId,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

export function StatusPill({ value }: { value: unknown }) {
  const { lang } = useLang();
  const status = String(value ?? "—");
  const normalized = status.toLowerCase();
  const kind = /active|in.use|assigned|متاح|قيد الاستخدام/i.test(normalized)
    ? "good"
    : /maintenance|صيانة|stored|مخزن/i.test(normalized)
      ? "warn"
      : /damaged|broken|تالف/i.test(normalized)
        ? "bad"
        : "neutral";
  return (
    <span className={`status-pill ${kind}`} data-testid={`status-${status}`}>
      <i />
      {localizeStatus(status, lang)}
    </span>
  );
}

export function QueryState({
  loading,
  error,
  retry,
  message,
}: {
  loading: boolean;
  error: boolean;
  retry: () => void;
  message?: string;
}) {
  const { t } = useLang();
  if (loading)
    return (
      <div className="state-panel">
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
        <span>{t.loading}</span>
      </div>
    );
  if (error)
    return (
      <div className="state-panel error-state">
        <CircleAlert size={25} />
        <b>{t.error}</b>
        <p>{message || t.noConnection}</p>
        <Button variant="outline" onClick={retry}>
          <RefreshCw size={14} />
          {t.retry}
        </Button>
      </div>
    );
  return null;
}

export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-mark">
        <Database size={22} />
      </div>
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  foot,
}: {
  label: string;
  value: number | string;
  icon: typeof Monitor;
  tone: string;
  foot?: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className={`stat-icon ${tone}`}>
          <Icon size={18} />
        </span>
      </div>
      <strong>{value ?? "—"}</strong>
      <small>{foot || " "}</small>
    </div>
  );
}

export function ActivityList({
  items,
  isLoading,
  error,
  retry,
}: {
  items?: ActivityItem[];
  isLoading: boolean;
  error: boolean;
  retry: () => void;
}) {
  const { t, lang } = useLang();
  if (isLoading || error)
    return <QueryState loading={isLoading} error={error} retry={retry} />;
  if (!items?.length)
    return <EmptyState title={t.noActivity} detail={t.emptyHint} />;
  return (
    <div className="activity-list">
      {items.map((item) => (
        <div
          className="activity-row"
          key={item.id}
          data-testid={`activity-${item.id}`}
        >
          <span className="activity-icon">
            <Activity size={15} />
          </span>
          <div className="activity-copy">
            <b>{localizeActivityTitle(item.title, lang)}</b>
            <p>
              {localizeActivityDescription(item.description, lang) ||
                item.actor ||
                ""}
            </p>
          </div>
          <time>
            {item.occurredAt
              ? new Date(item.occurredAt).toLocaleString(
                  lang === "ar" ? "ar" : "en",
                  { dateStyle: "medium", timeStyle: "short" },
                )
              : "—"}
          </time>
        </div>
      ))}
    </div>
  );
}

export function displayVal(value: unknown) {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "✓" : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function localizedField(field: FieldDefinition, lang: Lang) {
  const label =
    arabicFieldLabels[normalizeLabel(field.key).replaceAll(" ", "")] ||
    arabicFieldLabels[field.key] ||
    field.label;
  if (lang === "ar") return label;
  return field.label.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
}
