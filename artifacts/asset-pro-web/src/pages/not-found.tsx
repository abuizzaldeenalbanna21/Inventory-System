import { Link } from "wouter";

import { Shell } from "../components/shell";
import { useLang } from "../hooks/use-language";

export function NotFoundRoute() {
  const { t } = useLang();
  return (
    <Shell title={t.noModule}>
      <div className="not-found">
        <div>404</div>
        <h2>{t.noModule}</h2>
        <Link href="/dashboard" className="btn btn-primary">
          {t.dashboard}
        </Link>
      </div>
    </Shell>
  );
}
