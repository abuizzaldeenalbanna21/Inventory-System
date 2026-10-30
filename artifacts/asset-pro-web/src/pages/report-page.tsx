import { useParams } from "wouter";
import { useLang } from "../hooks/use-language";

import { RecordsView } from "../components/records-view";

export function ReportPage() {
  const { reportKey = "stored" } = useParams<{ reportKey: string }>();
  const { t } = useLang();
  return <RecordsView moduleKey="employee-devices" reportKey={reportKey} />;
}
