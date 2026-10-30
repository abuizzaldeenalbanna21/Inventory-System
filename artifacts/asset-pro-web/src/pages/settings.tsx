import {
  ArrowLeftRight,
  Building2,
  CircleAlert,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  getGetOrganizationSettingsQueryKey,
  getGetSettingsLookupsQueryKey,
  useGetOrganizationSettings,
  useGetSettingsLookups,
} from "@workspace/api-client-react";
import { localizeLookup } from "../translations";

import { EmptyState, StatusPill } from "../components/shared-ui";
import { Shell } from "../components/shell";
import { useLang } from "../hooks/use-language";

export function SettingsPage() {
  const { t, lang } = useLang();
  const org = useGetOrganizationSettings({
    query: { queryKey: getGetOrganizationSettingsQueryKey() },
  });
  const lookups = useGetSettingsLookups({
    query: { queryKey: getGetSettingsLookupsQueryKey() },
  });
  const branches = org.data?.branches || [];
  const departments = org.data?.departments || [];
  return (
    <Shell
      title={t.settings}
      description={t.settingsDescription}
      active="settings"
    >
      <div className="settings-tabs">
        <span className="selected">
          <Building2 size={15} />
          {t.organization}
        </span>
        <span>
          <Settings2 size={15} />
          {t.lookupCatalogs}
        </span>
        <span>
          <ShieldCheck size={15} />
          {t.permissions}
        </span>
      </div>
      {(org.isError || lookups.isError) && (
        <div className="inline-notice">
          <CircleAlert size={17} />
          {t.noConnection}
          <button
            onClick={() => {
              org.refetch();
              lookups.refetch();
            }}
          >
            {t.retry}
          </button>
        </div>
      )}
      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-head">
            <div>
              <h2>{t.branches}</h2>
              <p>{t.branchesDescription}</p>
            </div>
            <span className="settings-count">{branches.length}</span>
          </div>
          {org.isLoading ? (
            <div className="skeleton-line" />
          ) : branches.length ? (
            branches.map((item) => (
              <div className="setting-row" key={item.id}>
                <span className="setting-symbol">
                  <Building2 size={15} />
                </span>
                <b>{item.name}</b>
                <StatusPill value={item.enabled ? t.enabled : t.disabled} />
              </div>
            ))
          ) : (
            <EmptyState title={t.noSettings} detail={t.noConnection} />
          )}
        </section>
        <section className="settings-card">
          <div className="settings-card-head">
            <div>
              <h2>{t.departments}</h2>
              <p>{t.departmentsDescription}</p>
            </div>
            <span className="settings-count">{departments.length}</span>
          </div>
          {org.isLoading ? (
            <div className="skeleton-line" />
          ) : departments.length ? (
            departments.map((item) => (
              <div className="setting-row" key={item.id}>
                <span className="setting-symbol department">
                  <Users size={15} />
                </span>
                <b>{item.name}</b>
                <StatusPill value={item.enabled ? t.enabled : t.disabled} />
              </div>
            ))
          ) : (
            <EmptyState title={t.noSettings} detail={t.noConnection} />
          )}
        </section>
        <section className="settings-card mapping-card">
          <div className="settings-card-head">
            <div>
              <h2>{t.mappings}</h2>
              <p>{t.mappingsDescription}</p>
            </div>
            <span className="settings-count">
              {org.data?.mappings?.length || 0}
            </span>
          </div>
          {org.isLoading ? (
            <div className="skeleton-line" />
          ) : org.data?.mappings?.length ? (
            org.data.mappings.map((mapping, i) => (
              <div
                className="mapping-row"
                key={`${mapping.branchId}-${mapping.departmentId}-${i}`}
              >
                <span>
                  {branches.find((b) => b.id === mapping.branchId)?.name ||
                    mapping.branchId}
                </span>
                <ArrowLeftRight size={14} />
                <b>
                  {departments.find((d) => d.id === mapping.departmentId)
                    ?.name || mapping.departmentId}
                </b>
              </div>
            ))
          ) : (
            <EmptyState title={t.noSettings} detail={t.noConnection} />
          )}
        </section>
        <section className="settings-card">
          <div className="settings-card-head">
            <div>
              <h2>{t.lookupCatalogs}</h2>
              <p>{t.lookupsDescription}</p>
            </div>
            <span className="settings-count">{lookups.data?.length || 0}</span>
          </div>
          {lookups.isLoading ? (
            <div className="skeleton-line" />
          ) : lookups.data?.length ? (
            lookups.data.map((group) => (
              <div className="lookup-group" key={group.category}>
                <b>{localizeLookup(group.category, lang)}</b>
                <div>
                  {group.values.map((v) => (
                    <span className="lookup-chip" key={v}>
                      {localizeLookup(v, lang)}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState title={t.noSettings} detail={t.noConnection} />
          )}
        </section>
      </div>
    </Shell>
  );
}
