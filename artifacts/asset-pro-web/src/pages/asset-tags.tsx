import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, CircleAlert, Search, Tag, X } from "lucide-react";
import {
  getListAssetTagsQueryKey,
  useGenerateAllAssetTags,
  useListAssetTags,
} from "@workspace/api-client-react";
import { DynamicRecord } from "@workspace/api-client-react";

import {
  Button,
  EmptyState,
  QueryState,
  displayVal,
} from "../components/shared-ui";
import { Shell } from "../components/shell";
import { useLang } from "../hooks/use-language";

export function TagsPage() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const params = useMemo(
    () => ({ search: search || undefined, page: 1, pageSize: 30 }),
    [search],
  );
  const tags = useListAssetTags(params, {
    query: { queryKey: getListAssetTagsQueryKey(params) },
  });
  const generate = useGenerateAllAssetTags();
  const [message, setMessage] = useState("");
  const items = Array.isArray(tags.data)
    ? tags.data
    : (tags.data as unknown as { data?: DynamicRecord[]; total?: number })
        ?.data || [];
  const total =
    (tags.data as unknown as { total?: number })?.total ?? items.length;
  return (
    <Shell
      title={t.tagsTitle}
      description={t.tagDescription}
      active="asset-tags"
      actions={
        <Button
          onClick={() =>
            generate.mutate(undefined, {
              onSuccess: (result) => {
                setMessage(`${t.generated}: ${result.generated}`);
                qc.invalidateQueries({ queryKey: getListAssetTagsQueryKey() });
              },
            })
          }
          disabled={generate.isPending}
          testId="button-generate-tags"
        >
          <Tag size={16} />
          {generate.isPending ? t.loading : t.generateTags}
        </Button>
      }
    >
      {message && (
        <div className="success-notice">
          <Check size={16} />
          {message}
          <button onClick={() => setMessage("")}>
            <X size={14} />
          </button>
        </div>
      )}
      {generate.isError && (
        <div className="inline-notice danger-notice">
          <CircleAlert size={16} />
          {t.error}
        </div>
      )}
      <div className="toolbar">
        <div className="record-count">
          <b>{tags.isError ? "—" : total}</b>
          <span>{t.tagsTitle}</span>
        </div>
        <label className="record-search">
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchRecords}
            aria-label={t.searchRecordsLabel}
          />
        </label>
        <span className="tag-total">
          <Tag size={15} />
          {t.databaseSync}
        </span>
      </div>
      <div className="tag-grid">
        {tags.isLoading ? (
          <QueryState loading error={false} retry={() => tags.refetch()} />
        ) : tags.isError ? (
          <QueryState loading={false} error retry={() => tags.refetch()} />
        ) : !items.length ? (
          <div className="grid-span">
            <EmptyState title={t.noRecords} detail={t.emptyHint} />
          </div>
        ) : (
          items.map((item, i) => {
            const obj = item as DynamicRecord;
            return (
              <div className="asset-tag-card" key={String(obj.id || i)}>
                <div className="tag-card-top">
                  <span className="tag-label">
                    <Tag size={13} />
                    {t.tagNumber}
                  </span>
                  <span className="tag-kind">
                    {displayVal(obj.module || obj.moduleKey || obj.type)}
                  </span>
                </div>
                <b className="tag-code">
                  {displayVal(
                    obj.assetTag ||
                      obj.asset_tag ||
                      obj.tag ||
                      obj.tagNumber ||
                      obj.id,
                  )}
                </b>
                <span className="tag-record">
                  {displayVal(
                    obj.name || obj.item || obj.recordName || obj.serial,
                  )}
                </span>
                <div className="tag-card-foot">
                  <span>{displayVal(obj.branch)}</span>
                  <span>{displayVal(obj.status)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Shell>
  );
}
