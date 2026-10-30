import { useParams } from "wouter";

import { RecordsView } from "../components/records-view";

export function ModulePage() {
  const params = useParams<{ moduleKey: string }>();
  return <RecordsView moduleKey={params.moduleKey} />;
}
