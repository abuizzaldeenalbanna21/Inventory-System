import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getGetCurrentUserQueryKey,
  useGetCurrentUser,
} from "@workspace/api-client-react";
import {
  Redirect,
  Route,
  Router as WouterRouter,
  Switch,
  useLocation,
} from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardPage } from "./pages/dashboard";
import { HomeRoute } from "./pages/home";
import { ModulePage } from "./pages/module-page";
import { RecordPageView } from "./pages/record-page";
import { ReportPage } from "./pages/report-page";
import { MovementsPage } from "./pages/movements";
import { NotFoundRoute } from "./pages/not-found";
import { SettingsPage } from "./pages/settings";
import { SignInPage } from "./pages/sign-in";
import { TagsPage } from "./pages/asset-tags";
import { useLang } from "./hooks/use-language";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 20_000, refetchOnWindowFocus: true },
  },
});
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ErrorBoundaryRouter({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function AuthRoutes() {
  return (
    <ErrorBoundaryRouter>
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/dashboard" component={ProtectedDashboard} />
        <Route path="/movements" component={ProtectedMovements} />
        <Route path="/modules/:moduleKey" component={ProtectedModule} />
        <Route
          path="/modules/:moduleKey/:recordId"
          component={ProtectedRecord}
        />
        <Route path="/reports/:reportKey" component={ProtectedReport} />
        <Route path="/asset-tags" component={ProtectedTags} />
        <Route path="/settings" component={ProtectedSettings} />
        <Route component={NotFoundRoute} />
      </Switch>
    </ErrorBoundaryRouter>
  );
}

function Protected({ children }: { children: ReactNode }) {
  const user = useGetCurrentUser({
    query: { queryKey: getGetCurrentUserQueryKey(), retry: false },
  });
  const { t } = useLang();
  if (user.isLoading) return <div className="state-panel">{t.loading}</div>;
  return user.data ? <>{children}</> : <Redirect to="/sign-in" />;
}

function ProtectedDashboard() {
  return (
    <Protected>
      <DashboardPage />
    </Protected>
  );
}

function ProtectedMovements() {
  return (
    <Protected>
      <MovementsPage />
    </Protected>
  );
}

function ProtectedModule() {
  return (
    <Protected>
      <ModulePage />
    </Protected>
  );
}

function ProtectedRecord() {
  return (
    <Protected>
      <RecordPageView />
    </Protected>
  );
}

function ProtectedReport() {
  return (
    <Protected>
      <ReportPage />
    </Protected>
  );
}

function ProtectedTags() {
  return (
    <Protected>
      <TagsPage />
    </Protected>
  );
}

function ProtectedSettings() {
  return (
    <Protected>
      <SettingsPage />
    </Protected>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <AuthRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
