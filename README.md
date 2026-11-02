# Inventory System

Inventory System is a bilingual web application designed to manage inventory and IT assets efficiently. It provides a centralized platform for tracking assets, managing employees and devices, monitoring inventory activities, and organizing IT resources.

The application supports both Arabic (RTL) and English (LTR), offering a responsive interface for desktop and mobile browsers.

---

## Key Features

- **Dashboard:** View inventory statistics, connection status, and recent activities.
- **Employee Device Management:** Manage and track devices assigned to employees.
- **Network Asset Management:** Organize and monitor network-related assets.
- **Employee Management:** Maintain employee information and related records.
- **IT Stock Management:** Manage IT inventory and stock records.
- **Asset Records:** Create, view, and manage asset information.
- **Asset Movements:** Track asset transfers and movement history.
- **Reports:** Access inventory reports and relevant information.
- **Printable Asset Tags:** Generate printable tags for asset identification.
- **Organization Settings:** Manage organizational settings and shared lookup values.
- **Bilingual Interface:** Switch between Arabic and English with RTL/LTR layout support.
- **Responsive Design:** Access the application across desktop and mobile devices.

---

## Technologies Used

### Frontend

- React
- TypeScript
- Vite
- React Query
- CSS

### Backend

- ASP.NET Core
- .NET 8

### Database

- Microsoft SQL Server

---

## Project Architecture

The project is organized into several main components:

- `artifacts/asset-pro-web/` – Contains the main React and Vite frontend application.
- `artifacts/mockup-sandbox/` – Contains an isolated component preview workspace.
- `lib/api-client-react/` – Contains the generated React Query API client.

The frontend communicates with an ASP.NET Core Web API hosted in a separate `InventoryApi` project. Both the website and mobile application use the same API host and SQL Server database (`InventoryDB`).

**Note:** The backend API and mobile application are not included in this repository.

---

## Requirements

- Node.js
- pnpm
- .NET 8 SDK
- SQL Server Express
- Configured `InventoryDB` database

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/abuizzaldeenalbanna21/Inventory-System.git
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run type checking

```bash
pnpm --filter @workspace/asset-pro-web typecheck
```

### 4. Build the frontend

```bash
pnpm --filter @workspace/asset-pro-web build
```

The optimized frontend output is generated in the parent project's `wwwroot/asset-pro` directory.

### Running the Application

To run the integrated application, start the separate ASP.NET Core project from its `InventoryApi` directory:

```bash
dotnet run --project InventoryApi.csproj --no-launch-profile
```

### Access the application

```text
http://localhost:8080/asset-pro
```

The API database connection is configured through `ConnectionStrings:InventoryDb` in the parent project's `appsettings.json`.

### Frontend Development Mode

```powershell
$env:PORT = "5173"
pnpm --filter @workspace/asset-pro-web dev
```

The Vite development server proxies `/api` requests to:

```text
http://127.0.0.1:8080
```

You can configure a different API host using the `API_ORIGIN` environment variable.

## Source Code Structure

* `src/pages/` – Route-level application pages.

* `src/components/` – Shared application components and reusable UI elements.

* `src/hooks/` – Shared React hooks.

* `src/translations.ts` – Arabic and English translations.

* `src/index.css` – Shared styles, responsive layouts, and RTL/LTR support.

## Security and Configuration

* Keep environment variables and credentials in local configuration files.

* Never commit passwords, API keys, database connection strings, or private certificates.

* Use `.env.example` with placeholder values to document required environment variables.

* Keep local database files and development-specific configuration files excluded from version control.

## Credits

Developed by Ali and Anas.
