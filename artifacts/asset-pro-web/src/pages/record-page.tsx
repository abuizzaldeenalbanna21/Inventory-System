import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import {
  getGetModuleRecordQueryKey,
  getGetModuleSchemaQueryKey,
  useGetModuleRecord,
  useGetModuleSchema,
  useUpdateModuleRecord,
} from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { moduleMeta } from "../translations";
import { Button, QueryState } from "../components/shared-ui";
import { Shell } from "../components/shell";
import { useLang } from "../hooks/use-language";

import { RecordDetail, RecordForm } from "../components/records-view";

export function RecordPageView() {
  const { moduleKey, recordId } = useParams<{
    moduleKey: string;
    recordId: string;
  }>();
  const [, setLocation] = useLocation();
  const { t, lang } = useLang();
  const queryClient = useQueryClient();
  const [edit, setEdit] = useState(false);
  const schema = useGetModuleSchema(moduleKey, {
    query: { queryKey: getGetModuleSchemaQueryKey(moduleKey) },
  });
  const record = useGetModuleRecord(moduleKey, recordId, {
    query: { queryKey: getGetModuleRecordQueryKey(moduleKey, recordId) },
  });
  const update = useUpdateModuleRecord();
  const module = moduleMeta[moduleKey];
  const title =
    lang === "ar" ? module?.ar || t.noModule : module?.en || t.noModule;
  return (
    <Shell title={title} active={moduleKey}>
      <div className="back-row">
        <Button
          variant="ghost"
          onClick={() => setLocation(`/modules/${moduleKey}`)}
        >
          <ChevronRight size={15} />
          {t.records}
        </Button>
      </div>
      {record.isLoading ? (
        <QueryState loading error={false} retry={() => record.refetch()} />
      ) : record.isError ? (
        <QueryState loading={false} error retry={() => record.refetch()} />
      ) : record.data ? (
        <RecordDetail
          moduleKey={moduleKey}
          record={record.data}
          fields={schema.data?.fields || []}
          onClose={() => setLocation(`/modules/${moduleKey}`)}
          onEdit={() => setEdit(true)}
        />
      ) : null}
      {edit && record.data && (
        <RecordForm
          title={t.editTitle}
          fields={schema.data?.fields || []}
          initial={record.data}
          busy={update.isPending}
          onClose={() => setEdit(false)}
          onSubmit={(values) =>
            update.mutate(
              { moduleKey, recordId, data: values },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: getGetModuleRecordQueryKey(moduleKey, recordId),
                  });
                  setEdit(false);
                },
              },
            )
          }
        />
      )}
    </Shell>
  );
}
