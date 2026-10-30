import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  CircleAlert,
  Package,
  Settings2,
  X,
  LockKeyhole,
  ClipboardList,
} from "lucide-react";
import {
  getGetDashboardActivityQueryKey,
  getGetDashboardSummaryQueryKey,
  getListModuleRecordsQueryKey,
  getListModulesQueryKey,
  useCreateMovement,
  useListModules,
} from "@workspace/api-client-react";
import { MovementInput } from "@workspace/api-client-react";
import { moduleMeta } from "../translations";

import { Button } from "../components/shared-ui";
import { Shell } from "../components/shell";
import { useLang } from "../hooks/use-language";

export function MovementsPage() {
  const { t, lang } = useLang();
  const queryClient = useQueryClient();
  const modulesQuery = useListModules({
    query: { queryKey: getListModulesQueryKey() },
  });
  const [moduleKey, setModuleKey] = useState("employee-devices");
  const [recordId, setRecordId] = useState("");
  const [action, setAction] = useState<MovementInput["action"]>("assign");
  const [branch, setBranch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const movement = useCreateMovement();
  const [saved, setSaved] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    movement.mutate(
      {
        data: {
          moduleKey,
          recordId: recordId || null,
          action,
          branch: branch || null,
          quantity: quantity ? Number(quantity) : null,
          reason: reason || null,
          details: details || null,
        },
      },
      {
        onSuccess: () => {
          setSaved(true);
          setRecordId("");
          setReason("");
          setDetails("");
          queryClient.invalidateQueries({
            queryKey: getGetDashboardSummaryQueryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: getGetDashboardActivityQueryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: getListModuleRecordsQueryKey(),
          });
        },
      },
    );
  };
  const actions: MovementInput["action"][] = [
    "assign",
    "store",
    "maintenance",
    "damaged",
    "restore",
    "consume",
    "transfer",
  ];
  const actionNames: Record<string, string> = {
    assign: t.assign,
    store: t.store,
    maintenance: t.maintenance,
    damaged: t.damagedCount,
    restore: t.restore,
    consume: t.consume,
    transfer: t.transfer,
  };
  return (
    <Shell
      title={t.movements}
      description={t.movementDescription}
      active="movements"
    >
      <div className="movement-layout">
        <section className="movement-form-card">
          <div className="form-card-head">
            <span className="movement-icon">
              <ArrowLeftRight size={19} />
            </span>
            <div>
              <h2>{t.saveMovement}</h2>
              <p>{t.operationDescription}</p>
            </div>
          </div>
          {saved && (
            <div className="success-notice">
              <Check size={16} />
              {t.movementSaved}
              <button onClick={() => setSaved(false)}>
                <X size={14} />
              </button>
            </div>
          )}
          {movement.isError && (
            <div className="inline-notice danger-notice">
              <CircleAlert size={16} />
              <span>
                {t.movementError} {t.movementErrorDetails}
              </span>
              <button aria-label={t.close} onClick={() => movement.reset()}>
                <X size={14} />
              </button>
            </div>
          )}
          <form onSubmit={submit}>
            <div className="field">
              <span>{t.action} *</span>
              <div className="action-choice">
                {actions.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={action === item ? "chosen" : ""}
                    onClick={() => setAction(item)}
                  >
                    {item === "assign" ? (
                      <ArrowUpRight size={15} />
                    ) : item === "store" ? (
                      <Package size={15} />
                    ) : item === "transfer" ? (
                      <ArrowLeftRight size={15} />
                    ) : item === "consume" ? (
                      <ArrowDownLeft size={15} />
                    ) : (
                      <Settings2 size={15} />
                    )}
                    {actionNames[item]}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>{t.modules}</span>
                <select
                  value={moduleKey}
                  onChange={(e) => setModuleKey(e.target.value)}
                >
                  {(
                    modulesQuery.data?.filter(
                      (item) => item.kind === "records",
                    ) ||
                    Object.entries(moduleMeta).map(([key, value]) => ({
                      key,
                      title: lang === "ar" ? value.ar : value.en,
                    }))
                  ).map((item) => (
                    <option key={item.key} value={item.key}>
                      {(lang === "ar"
                        ? moduleMeta[item.key]?.ar
                        : moduleMeta[item.key]?.en) ||
                        item.title ||
                        item.key}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>{t.record}</span>
                <input
                  value={recordId}
                  onChange={(e) => setRecordId(e.target.value)}
                  placeholder={t.recordIdOptional}
                />
              </label>
              <label className="field">
                <span>{t.branch}</span>
                <input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder={t.optional}
                />
              </label>
              {action === "consume" && (
                <label className="field">
                  <span>{t.quantity}</span>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </label>
              )}
              <label className="field span-2">
                <span>{t.reason}</span>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t.optional}
                />
              </label>
              <label className="field span-2">
                <span>{t.details}</span>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={t.optional}
                />
              </label>
            </div>
            <div className="form-submit">
              <span>
                <LockKeyhole size={14} />
                {t.auditTrailNote}
              </span>
              <Button type="submit" disabled={movement.isPending}>
                <Check size={15} />
                {movement.isPending ? t.loading : t.saveMovement}
              </Button>
            </div>
          </form>
        </section>
        <aside className="movement-aside">
          <div className="aside-head">
            <span className="aside-icon">
              <ClipboardList size={17} />
            </span>
            <b>{t.operationFlow}</b>
          </div>
          <div className="flow-step">
            <span>01</span>
            <div>
              <b>{t.chooseActionStep}</b>
              <small>{t.chooseActionHint}</small>
            </div>
          </div>
          <div className="flow-step">
            <span>02</span>
            <div>
              <b>{t.linkRecord}</b>
              <small>{t.linkRecordHint}</small>
            </div>
          </div>
          <div className="flow-step">
            <span>03</span>
            <div>
              <b>{t.confirmOperation}</b>
              <small>{t.confirmOperationHint}</small>
            </div>
          </div>
          <div className="aside-note">
            <CircleAlert size={16} />
            {t.reviewMovement}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
