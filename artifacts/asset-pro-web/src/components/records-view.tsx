import { useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Plus,
  Search,
  X,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import {
  getGetDashboardActivityQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetModuleRecordQueryKey,
  getGetModuleSchemaQueryKey,
  getGetRecordHistoryQueryKey,
  getGetReportQueryKey,
  getListModuleRecordsQueryKey,
  useChangeRecordStatus,
  useCreateModuleRecord,
  useDeleteModuleRecord,
  useGetModuleRecord,
  useGetModuleSchema,
  useGetRecordHistory,
  useGetReport,
  useListModuleRecords,
  useUpdateModuleRecord,
} from "@workspace/api-client-react";
import { DynamicRecord, FieldDefinition } from "@workspace/api-client-react";
import {
  localizeActivityTitle,
  localizeLookup,
  moduleMeta,
  reportMeta,
  recordStatuses,
  words,
} from "../translations";
import {
  Button,
  EmptyState,
  IconButton,
  QueryState,
  StatusPill,
  displayVal,
  localizedField,
} from "./shared-ui";
import { Shell } from "./shell";
import { useLang } from "../hooks/use-language";

const reportFieldKeys: Record<string, string[]> = {
  stored: [
    "branch",
    "department",
    "assignedTo",
    "deviceType",
    "ipAddress",
    "status",
    "assetTag",
  ],
  maintenance: [
    "branch",
    "department",
    "assignedTo",
    "deviceType",
    "ipAddress",
    "status",
    "assetTag",
  ],
  damaged: [
    "branch",
    "department",
    "assignedTo",
    "deviceType",
    "ipAddress",
    "status",
    "assetTag",
  ],
  consumed: [
    "branchCode",
    "itemName",
    "quantity",
    "consumedAt",
    "notes",
    "toBranch",
  ],
  "maintenance-logs": [
    "targetType",
    "branch",
    "department",
    "assignedTo",
    "deviceType",
    "brandModel",
    "ipAddress",
    "statusType",
    "reason",
    "enteredAt",
    "restoredAt",
    "actionBy",
  ],
};

export function RecordsView({
  moduleKey,
  reportKey,
}: {
  moduleKey: string;
  reportKey?: string;
}) {
  const { t, lang } = useLang();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DynamicRecord | null>(null);
  const [selected, setSelected] = useState<DynamicRecord | null>(null);
  const module = moduleMeta[moduleKey];
  const schemaQuery = useGetModuleSchema(moduleKey, {
    query: {
      queryKey: getGetModuleSchemaQueryKey(moduleKey),
      enabled: !!module && !reportKey,
    },
  });
  const listParams = useMemo(
    () => ({
      moduleKey,
      search: search || undefined,
      status: status || undefined,
      page,
      pageSize: 20,
    }),
    [moduleKey, search, status, page],
  );
  const listQuery = useListModuleRecords(listParams, {
    query: {
      queryKey: getListModuleRecordsQueryKey(listParams),
      enabled: !!module && !reportKey,
    },
  });
  const reportParams = useMemo(
    () => ({
      reportKey: (reportKey || "stored") as
        "stored" | "maintenance" | "damaged" | "consumed" | "maintenance-logs",
      search: search || undefined,
      page,
      pageSize: 20,
    }),
    [reportKey, search, page],
  );
  const reportQuery = useGetReport(reportParams, {
    query: {
      queryKey: getGetReportQueryKey(reportParams),
      enabled: !!reportKey,
    },
  });
  const create = useCreateModuleRecord();
  const update = useUpdateModuleRecord();
  const remove = useDeleteModuleRecord();
  const changeStatus = useChangeRecordStatus();
  const recordPage = reportKey ? reportQuery.data : listQuery.data;
  const fields: FieldDefinition[] = reportKey
    ? (reportFieldKeys[reportKey] || []).map((key, order) => ({
        key,
        label: key,
        inputType: "readonly",
        required: false,
        visible: true,
        editable: false,
        options: [],
        order,
      }))
    : schemaQuery.data?.fields?.filter((field) => field.visible) || [];
  const columns = reportKey
    ? fields
    : schemaQuery.data?.columns?.filter((field) => field.visible) ||
      fields.slice(0, 5);
  const title = reportKey
    ? (lang === "ar" ? reportMeta[reportKey]?.ar : reportMeta[reportKey]?.en) ||
      t.report
    : (lang === "ar" ? module?.ar : module?.en) || t.noModule;
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListModuleRecordsQueryKey() });
    queryClient.invalidateQueries({
      queryKey: getGetDashboardSummaryQueryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: getGetDashboardActivityQueryKey(),
    });
  };
  const submitRecord = (values: Record<string, unknown>) => {
    if (editing)
      update.mutate(
        { moduleKey, recordId: editing.id, data: values },
        {
          onSuccess: () => {
            invalidate();
            setFormOpen(false);
            setEditing(null);
          },
        },
      );
    else
      create.mutate(
        { data: { moduleKey, ...values } },
        {
          onSuccess: () => {
            invalidate();
            setFormOpen(false);
          },
        },
      );
  };
  const retry = () => {
    schemaQuery.refetch();
    listQuery.refetch();
    reportQuery.refetch();
  };
  const isPending = reportKey
    ? reportQuery.isLoading
    : listQuery.isLoading || schemaQuery.isLoading;
  const isError = reportKey
    ? reportQuery.isError
    : listQuery.isError || schemaQuery.isError;
  const pageTitle = reportKey ? title : title;
  const openEdit = (record: DynamicRecord) => {
    setEditing(record);
    setFormOpen(true);
  };
  const handleDelete = (record: DynamicRecord) => {
    if (window.confirm(t.confirmDelete))
      remove.mutate(
        { moduleKey, recordId: record.id },
        { onSuccess: invalidate },
      );
  };
  const handleStatus = (record: DynamicRecord) => {
    const next = window.prompt(t.enterNewStatus, String(record.status || ""));
    if (next?.trim())
      changeStatus.mutate(
        { moduleKey, recordId: record.id, data: { status: next.trim() } },
        {
          onSuccess: () => {
            invalidate();
            queryClient.invalidateQueries({
              queryKey: getGetModuleRecordQueryKey(moduleKey, record.id),
            });
            queryClient.invalidateQueries({
              queryKey: getGetRecordHistoryQueryKey(moduleKey, record.id),
            });
          },
        },
      );
  };
  const actions =
    !reportKey && schemaQuery.data?.module.supportsCreate !== false ? (
      <Button
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        testId="button-add-record"
      >
        <Plus size={16} />
        {t.addRecord}
      </Button>
    ) : undefined;
  return (
    <Shell
      title={pageTitle}
      description={
        reportKey
          ? t.report
          : lang === "ar"
            ? module?.descriptionAr
            : module?.descriptionEn
      }
      active={reportKey ? `report-${reportKey}` : moduleKey}
      actions={actions}
    >
      <div className="toolbar">
        <div className="record-count">
          <b>{recordPage?.total ?? "—"}</b>
          <span>{t.records}</span>
        </div>
        <label className="record-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder={t.searchRecords}
            aria-label={t.searchRecordsLabel}
            data-testid="input-record-search"
          />
        </label>
        <div className="filter-control">
          <Filter size={15} />
          <select
            aria-label={t.filter}
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">{t.allStatuses}</option>
            {recordStatuses.map((item) => (
              <option value={item.value} key={item.value}>
                {words[lang][item.translation]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="data-card">
        <QueryState loading={isPending} error={isError} retry={retry} />
        {!isPending && !isError && !recordPage?.data?.length && (
          <EmptyState title={t.noRecords} detail={t.emptyHint} />
        )}
        {!isPending && !isError && !!recordPage?.data?.length && (
          <>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key}>{localizedField(col, lang)}</th>
                    ))}
                    {!reportKey && <th>{t.actions}</th>}
                  </tr>
                </thead>
                <tbody>
                  {recordPage.data.map((record) => (
                    <tr key={record.id} data-testid={`row-record-${record.id}`}>
                      {columns.map((col) => (
                        <td key={col.key}>
                          {col.key.toLowerCase().includes("status") ? (
                            <StatusPill value={record[col.key]} />
                          ) : col.inputType === "secret" ||
                            /password/i.test(col.key) ? (
                            <span className="masked">••••••••</span>
                          ) : (
                            <span className="cell-value">
                              {displayVal(record[col.key])}
                            </span>
                          )}
                        </td>
                      ))}
                      {!reportKey && (
                        <td>
                          <div className="row-actions">
                            <IconButton
                              icon={Eye}
                              label={t.view}
                              onClick={() => setSelected(record)}
                            />
                            <IconButton
                              icon={Pencil}
                              label={t.edit}
                              onClick={() => openEdit(record)}
                            />
                            <IconButton
                              icon={BadgeCheck}
                              label={t.status}
                              onClick={() => handleStatus(record)}
                            />
                            <IconButton
                              icon={Trash2}
                              label={t.delete}
                              danger
                              onClick={() => handleDelete(record)}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>
                {t.page} {recordPage.page} {t.of}{" "}
                {Math.max(1, Math.ceil(recordPage.total / recordPage.pageSize))}
              </span>
              <div>
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  <ChevronRight size={14} />
                  {t.previous}
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    page >= Math.ceil(recordPage.total / recordPage.pageSize)
                  }
                  onClick={() => setPage(page + 1)}
                >
                  {t.next}
                  <ChevronLeft size={14} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      {formOpen && (
        <RecordForm
          title={editing ? t.editTitle : t.createTitle}
          fields={fields}
          initial={editing || undefined}
          busy={create.isPending || update.isPending}
          onClose={() => setFormOpen(false)}
          onSubmit={submitRecord}
        />
      )}
      {selected && (
        <RecordDetail
          moduleKey={moduleKey}
          record={selected}
          fields={fields}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setSelected(null);
            openEdit(selected);
          }}
        />
      )}
    </Shell>
  );
}

export function RecordForm({
  title,
  fields,
  initial,
  busy,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: FieldDefinition[];
  initial?: DynamicRecord;
  busy: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const { t, lang } = useLang();
  const editable = fields.filter(
    (f) => f.editable && f.inputType !== "readonly" && !/password/i.test(f.key),
  );
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(editable.map((f) => [f.key, initial?.[f.key] ?? ""])),
  );
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };
  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <span className="modal-kicker">{t.recordLabel}</span>
            <h2>{title}</h2>
          </div>
          <IconButton icon={X} label={t.close} onClick={onClose} />
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            {editable.map((field) => (
              <label
                className={`field ${field.inputType === "textarea" ? "span-2" : ""}`}
                key={field.key}
              >
                <span>
                  {localizedField(field, lang)}
                  {field.required && <i> *</i>}
                </span>
                {field.inputType === "textarea" ? (
                  <textarea
                    required={field.required}
                    value={String(values[field.key] ?? "")}
                    onChange={(e) =>
                      setValues({ ...values, [field.key]: e.target.value })
                    }
                  />
                ) : field.inputType === "select" ? (
                  <select
                    required={field.required}
                    value={String(values[field.key] ?? "")}
                    onChange={(e) =>
                      setValues({ ...values, [field.key]: e.target.value })
                    }
                  >
                    <option value="">{t.select}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {localizeLookup(option, lang)}
                      </option>
                    ))}
                  </select>
                ) : field.inputType === "boolean" ? (
                  <div className="check-field">
                    <input
                      type="checkbox"
                      checked={Boolean(values[field.key])}
                      onChange={(e) =>
                        setValues({ ...values, [field.key]: e.target.checked })
                      }
                    />
                    {t.all}
                  </div>
                ) : (
                  <input
                    required={field.required}
                    type={
                      field.inputType === "number"
                        ? "number"
                        : field.inputType === "date"
                          ? "date"
                          : "text"
                    }
                    value={String(values[field.key] ?? "")}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        [field.key]:
                          field.inputType === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                      })
                    }
                    placeholder={t.enterValue}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="modal-actions">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <RefreshCw size={15} className="spin" />
              ) : (
                <Check size={15} />
              )}
              {t.save}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function RecordDetail({
  moduleKey,
  record,
  fields,
  onClose,
  onEdit,
}: {
  moduleKey: string;
  record: DynamicRecord;
  fields: FieldDefinition[];
  onClose: () => void;
  onEdit: () => void;
}) {
  const { t, lang } = useLang();
  const detail = useGetModuleRecord(moduleKey, record.id, {
    query: { queryKey: getGetModuleRecordQueryKey(moduleKey, record.id) },
  });
  const history = useGetRecordHistory(moduleKey, record.id, {
    query: { queryKey: getGetRecordHistoryQueryKey(moduleKey, record.id) },
  });
  const val = detail.data || record;
  const shown = fields.filter((f) => f.visible && !/password/i.test(f.key));
  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal-card wide" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <span className="modal-kicker">
              {t.recordDetails} / {record.id}
            </span>
            <h2>
              {displayVal(val.name || val.item || val.employee || record.id)}
            </h2>
          </div>
          <div className="modal-head-actions">
            <Button variant="outline" onClick={onEdit}>
              <Pencil size={14} />
              {t.edit}
            </Button>
            <IconButton icon={X} label={t.close} onClick={onClose} />
          </div>
        </div>
        <div className="detail-grid">
          {shown.map((field) => (
            <div className="detail-item" key={field.key}>
              <span>{localizedField(field, lang)}</span>
              <b>
                {field.key.toLowerCase().includes("status") ? (
                  <StatusPill value={val[field.key]} />
                ) : field.inputType === "secret" ? (
                  "••••••••"
                ) : (
                  displayVal(val[field.key])
                )}
              </b>
            </div>
          ))}
        </div>
        <div className="history-box">
          <h3>
            <Clock3 size={16} />
            {t.history}
          </h3>
          {history.isLoading ? (
            <div className="skeleton-line short" />
          ) : history.isError ? (
            <small>{t.error}</small>
          ) : !history.data?.length ? (
            <small>{t.noActivity}</small>
          ) : (
            history.data.map((entry, i) => (
              <div className="history-entry" key={i}>
                <span>
                  {localizeActivityTitle(entry.title, lang)}
                  {entry.description ? ` — ${entry.description}` : ""}
                </span>
                <time>
                  {entry.occurredAt
                    ? new Date(entry.occurredAt).toLocaleDateString(
                        lang === "ar" ? "ar" : "en",
                      )
                    : "—"}
                </time>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
