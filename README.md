# Asset Pro Website

Asset Pro is a bilingual inventory and IT asset management website. Its
interface supports Arabic (right-to-left) and English (left-to-right), and
connects to the ASP.NET Core API and SQL Server database used by the larger
InventoryApi application.

## Features

- Dashboard with inventory totals, connection status, and recent activity.
- Employee-device, network-asset, employee, and IT stock modules.
- Asset records, reports, movements, and printable asset tags.
- Organization settings and shared lookup values.
- Arabic and English translations with persisted language selection.
- Responsive layouts for desktop and mobile browsers.

## Architecture

- `artifacts/asset-pro-web/` contains the production React and Vite website.
- `artifacts/mockup-sandbox/` contains the isolated component preview workspace.
- `lib/api-client-react/` contains the generated React Query API client.
- Web API routes are served by the ASP.NET Core application in the parent
  InventoryApi project. The website and mobile application use the same API
  host and `InventoryDB`; the API and mobile app are not included in this
  website repository.
- Production frontend output is generated at
  `..\wwwroot\asset-pro` relative to this directory.

## Requirements

- Node.js and pnpm.
- .NET 8 SDK to run the integrated application.
- SQL Server Express and the configured `InventoryDB` database for
  API-backed functionality.

## Install and validate

Run these commands from the repository root. In the integrated InventoryApi
workspace, that is the `Website` directory:

```powershell
pnpm install
pnpm --filter @workspace/asset-pro-web typecheck
pnpm --filter @workspace/asset-pro-web build
```

The build command writes the optimized frontend to the parent project's
`wwwroot\asset-pro` folder.

## Run the application

To run the integrated application, start the separate ASP.NET Core project
from its `InventoryApi` directory:

```powershell
dotnet run --project InventoryApi.csproj --no-launch-profile
```

Then open <http://localhost:8080/asset-pro>. The API database connection is
configured by `ConnectionStrings:InventoryDb` in the parent project's
`appsettings.json`. Do not commit credentials or local secrets.

For frontend-only development, run from the repository root:

```powershell
$env:PORT = "5173"
pnpm --filter @workspace/asset-pro-web dev
```

The Vite development server proxies `/api` requests to
`http://127.0.0.1:8080` by default. Set `API_ORIGIN` to use a different local
API host.

In the integrated InventoryApi workspace, see `RUN_WEBSITE.md` in the parent
project for Windows startup and troubleshooting details.

## Source layout

- `artifacts/asset-pro-web/src/pages/` contains route-level page components.
- `artifacts/asset-pro-web/src/components/` contains the shared application
  shell, reusable UI, record views, and UI primitives.
- `artifacts/asset-pro-web/src/hooks/` contains shared React hooks, including
  language selection.
- `artifacts/asset-pro-web/src/translations.ts` contains Arabic and English
  labels and localized lookup values.
- `artifacts/asset-pro-web/src/index.css` contains shared themes, responsive
  layouts, and RTL/LTR styling.

## Credits

Developed by Ali and Anas.
