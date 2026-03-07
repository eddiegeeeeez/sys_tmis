# TradeMatrix MIS — GitHub Copilot Rules & Development Instructions

> **Generated:** March 7, 2026 — Full System Audit
> **Purpose:** Prevent Copilot from generating code that breaks production deployment, data integrity, or established architectural patterns.

---

## TABLE OF CONTENTS

1. [System Architecture Summary](#1-system-architecture-summary)
2. [Technology Stack](#2-technology-stack)
3. [Deployment Environment](#3-deployment-environment)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Schema & Rules](#5-database-schema--rules)
6. [Object Storage (AWS S3)](#6-object-storage-aws-s3)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Authentication & Security](#8-authentication--security)
9. [System Modules & Workflows](#9-system-modules--workflows)
10. [Data Flow Reference](#10-data-flow-reference)
11. [Coding Standards](#11-coding-standards)
12. [Forbidden Actions](#12-forbidden-actions)
13. [Safe Development Checklist](#13-safe-development-checklist)

---

## 1. SYSTEM ARCHITECTURE SUMMARY

TradeMatrix MIS is a full-stack Management Information System with POS, Inventory, HR, Payroll, Finance, Procurement, and CRM modules. It follows a monolithic SPA architecture with clear separation between a REST API backend and a React SPA frontend.

```
┌─────────────────────────────────────────────────┐
│                   Browser (SPA)                 │
│        React 19 + TypeScript + Tailwind         │
└──────────────────────┬──────────────────────────┘
                       │ /api/* (JWT Bearer)
┌──────────────────────▼──────────────────────────┐
│           ASP.NET Core 8 (Kestrel/IIS)          │
│  Controllers → Services → EF Core → SQL Server  │
│  Static Files: wwwroot/ (Vite build output)     │
│  Object Storage: AWS S3 (product images)        │
└──────────────────────┬──────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
   SQL Server                    AWS S3
  (databaseasp.net)       (tradematrix-uploads)
```

**Key architectural decisions:**
- Frontend builds directly into `backend/TradeMatrix.Server/wwwroot/` — the backend serves the SPA as static files
- No separate frontend deployment — single deployable artifact
- SPA fallback: all non-API routes fall back to `index.html`
- Philippine locale: 12% VAT-inclusive pricing, ₱ currency

---

## 2. TECHNOLOGY STACK

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | .NET | 8.0 |
| Framework | ASP.NET Core | 8.0 |
| ORM | Entity Framework Core | 8.0.0 |
| Database | SQL Server | via EF Core SqlServer provider |
| Auth | JWT Bearer | Microsoft.AspNetCore.Authentication.JwtBearer 8.0.0 |
| Object Storage | AWS S3 | AWSSDK.S3 3.7.405.2 |
| Hosting Model | IIS In-Process (production) / Kestrel (development) | — |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| UI Library | React | 19.x |
| Language | TypeScript | 5.8.x |
| Build Tool | Vite | 6.x |
| CSS | Tailwind CSS | 3.4.x |
| UI Components | Radix UI primitives (shadcn/ui pattern) | — |
| HTTP Client | Axios | 1.13.x |
| Router | React Router DOM | 7.x |
| Charts | Recharts | 3.x |
| Data Tables | TanStack Table | 8.x |
| Icons | Lucide React | 0.574.x |
| Testing | Vitest + Testing Library | — |

---

## 3. DEPLOYMENT ENVIRONMENT

### Production Host: MonsterASP.NET
- **URL:** `https://tradematrix.tryasp.net`
- **Runtime:** IIS with ASP.NET Core Module V2
- **Hosting Model:** `inprocess` (web.config)
- **Environment Variable:** `ASPNETCORE_ENVIRONMENT=Production`
- **Max Upload:** 100MB (`web.config` requestFiltering)
- **Database:** Remote SQL Server at `db32949.public.databaseasp.net`
- **Deployment Method:** Manual publish → upload `publish/` folder contents

### Deployment Build Process
```
1. cd frontend && npm run build          # Outputs to backend/wwwroot/
2. cd backend/TradeMatrix.Server
3. dotnet publish -c Release -o publish  # Creates deployable in publish/
4. Upload publish/ folder to MonsterASP.NET
```

### CRITICAL Deployment Constraints
- **NO Docker in production** — Docker is dev/CI only; production is IIS
- **NO auto-migration** — EF migrations must be applied manually or via the SuperAdmin `/api/Database/migrate` endpoint
- **NO environment variables on host** — All config goes in `appsettings.Production.json` which gets bundled into `publish/`
- **Vite builds to wwwroot** — `frontend/vite.config.ts` sets `build.outDir: '../backend/TradeMatrix.Server/wwwroot'` with `emptyOutDir: true`. Every `npm run build` wipes and replaces wwwroot
- **Content-hashed assets** — Vite generates `index-{hash}.js` and `index-{hash}.css`. The `index.html` references them by hash, so browser caching is safe in production
- **Static file caching** — Development: `no-cache` headers. Production: default caching (safe because of content hashing)
- **Publish folder accumulates stale files** — Old hashed files remain. Clean publish with fresh `dotnet publish` before deploying to avoid bloat
- **Connection pooling** — Production uses `Min Pool Size=5; Max Pool Size=100; Connection Lifetime=300`

### Development Environment
- **Backend:** `dotnet run` → `http://localhost:5009` (launchSettings.json)
- **Frontend (HMR):** `npm run dev` → `http://localhost:4000` (proxies `/api` to 5009)
- **Frontend (static):** `npm run build` then `dotnet run` serves everything on 5009
- **Database:** Local SQL Server Express at `PAMMY\SQLEXPRESS`

---

## 4. BACKEND ARCHITECTURE

### Project Structure
```
backend/TradeMatrix.Server/
├── Controllers/         # API endpoints (14 controllers)
│   ├── AuthController.cs
│   ├── AuditController.cs
│   ├── CustomerController.cs
│   ├── DashboardController.cs
│   ├── DatabaseController.cs
│   ├── FinanceController.cs
│   ├── HRController.cs
│   ├── InventoryController.cs
│   ├── PayrollController.cs
│   ├── ProcurementController.cs
│   ├── RolesController.cs
│   ├── SystemController.cs
│   ├── TransactionController.cs
│   └── UsersController.cs
├── Services/            # Business logic (interfaces + implementations)
│   ├── IUserService / UserService
│   ├── IRoleService / RoleService
│   ├── IInventoryService / InventoryService
│   ├── IHRService / HRService
│   ├── IFinanceService / FinanceService
│   ├── IProcurementService / ProcurementService
│   ├── ICustomerService / CustomerService
│   ├── IAuditService / AuditService
│   ├── IDatabaseService / DatabaseService
│   ├── ISystemService / SystemService
│   ├── IS3StorageService / S3StorageService
│   └── IPasswordHashingService / PasswordHashingService
├── Models/              # EF Core entity models (13 entities)
├── DTOs/                # Data transfer objects (request/response)
├── Data/                # ApplicationDbContext
├── Migrations/          # EF Core migration files
├── Middleware/           # GlobalExceptionHandlingMiddleware
├── Filters/             # AuditLogAttribute (action filter)
├── wwwroot/             # Frontend build output (DO NOT EDIT MANUALLY)
├── Program.cs           # Application entry point & DI configuration
├── web.config           # IIS configuration
└── appsettings.*.json   # Environment-specific configuration
```

### Service Layer Pattern
All business logic MUST go through service interfaces. Controllers are thin — they validate input, call a service method, and return the result.

```
Controller → Service Interface → Service Implementation → DbContext → SQL Server
```

**Rules:**
- Controllers MUST NOT access `ApplicationDbContext` directly
- Controllers MUST NOT contain business logic beyond input validation
- All service interfaces are registered as `Scoped` in `Program.cs`
- New services MUST follow the `I{Name}Service` / `{Name}Service` naming convention
- New services MUST be registered in `Program.cs` under the DI section

### DI Registration (Program.cs)
```csharp
builder.Services.AddScoped<IPasswordHashingService, PasswordHashingService>();
builder.Services.AddScoped<IUserService, UserService>();
// ... all services registered as Scoped
builder.Services.AddSingleton<IAmazonS3>(...);       // AWS S3 client — Singleton
builder.Services.AddScoped<IS3StorageService, S3StorageService>();
```

### Middleware Pipeline Order (CRITICAL — do not reorder)
```
1. Health check endpoint (/api/health-check)
2. GlobalExceptionHandlingMiddleware
3. HTTPS redirection (production only)
4. Security headers (CSP, X-Content-Type-Options, X-Frame-Options)
5. Static files (with cache control)
6. Routing
7. CORS
8. Authentication
9. Authorization
10. Controller endpoints
11. SPA fallback (MapFallbackToFile "index.html")
```

### Global Action Filter: AuditLogAttribute
- Applied globally to ALL controller actions
- Automatically logs all POST/PUT/PATCH/DELETE requests to AuditLogs
- Skips GET requests (except audit and database backup endpoints)
- Extracts actor info from JWT claims, IP from connection
- **DO NOT** add separate audit logging in controllers — it's already handled globally

### Error Handling
- `GlobalExceptionHandlingMiddleware` catches all unhandled exceptions
- Returns standardized `ErrorResponse { Message, ErrorCode, Timestamp }` as JSON
- Maps: `ArgumentException` → 400, `UnauthorizedAccessException` → 401, everything else → 500
- **DO NOT** add try-catch blocks in controllers for generic error handling — the middleware handles it

---

## 5. DATABASE SCHEMA & RULES

### Entity Relationship Diagram (Conceptual)

```
Roles (1) ──────── (N) Users (1) ──── (N) Transactions
                                              │
                                              ├── (N) TransactionItems ──── (N:1) Products
                                              │
Products (N) ──── (1) Suppliers               │
    │                    │                    │
    │              PurchaseOrders (N) ── PurchaseOrderItems
    │
    └── ImageUrl → AWS S3

Employees (1) ──── (N) Attendances
    │
    └────────── (N) PayrollRecords

Customers (standalone)
Expenses (standalone)
SystemSettings (standalone, key-value)
AuditLogs (standalone, append-only)
```

### All Database Tables (15 entities)

| Table | Purpose | Critical Fields |
|-------|---------|----------------|
| `Users` | System user accounts | Email (unique), PasswordHash, RoleId (FK), IsActive, IsArchived, FailedLoginAttempts, LockoutUntil |
| `Roles` | RBAC role definitions | Name (unique), Permissions (JSON/CSV), IsSystemRole, IsArchived |
| `Products` | Product catalog | SKU (unique), Name, CostPrice, SellingPrice, Stock, ReorderLevel, SupplierId (FK), ImageUrl (S3) |
| `Suppliers` | Vendor/supplier info | CompanyName, ContactPerson, Email |
| `PurchaseOrders` | Purchase order headers | PONumber (unique), SupplierId (FK, Restrict delete), Status, TotalAmount |
| `PurchaseOrderItems` | PO line items | PurchaseOrderId (FK), ProductId (FK), Quantity, UnitCost |
| `Transactions` | Sales transaction headers | TransactionNumber (unique, TRX-YYYYMMDD-XXXX), CashierId (FK), PaymentMethod, Subtotal, TaxAmount, TotalAmount, AmountTendered, Change, Status |
| `TransactionItems` | Sale line items | TransactionId (FK), ProductId (FK), ProductName (snapshot), UnitPrice, Quantity, LineTotal |
| `Employees` | HR employee records | Email (unique), BasicSalary, Department, Position, EmploymentStatus |
| `Attendances` | Employee attendance | EmployeeId (FK), Date, TimeIn/TimeOut, Status. Composite index on {EmployeeId, Date} |
| `PayrollRecords` | Payroll processing | EmployeeId (FK), PayPeriodStart/End, BasicSalary, GrossPay, TotalDeductions, NetPay, Status |
| `Customers` | CRM customer records | CustomerName, CustomerType, LoyaltyPoints |
| `Expenses` | Financial expenses | ExpenseCategory, Amount, ExpenseDate, Status |
| `SystemSettings` | Key-value config | Key (PK, MaxLength 100), Value, Group |
| `AuditLogs` | Security audit trail | Id (string PK, evt_*), Timestamp, ActorName, ActorEmail, Event, Severity, Metadata (JSON) |

### Database Indexes
- **Unique:** Users.Email, Roles.Name, Products.SKU, PurchaseOrders.PONumber, Employees.Email, Transactions.TransactionNumber
- **Composite:** Attendances.{EmployeeId, Date}
- **Single-column:** Products.Category, Products.IsActive, Suppliers.CompanyName, Employees.Department, Expenses.ExpenseDate, Expenses.ExpenseCategory, Transactions.TransactionDate, Transactions.Status, AuditLogs.Timestamp, AuditLogs.ActorEmail, AuditLogs.Event, AuditLogs.Severity

### Decimal Precision
ALL monetary columns use `decimal(18,2)`:
- Product: CostPrice, SellingPrice
- Transaction: Subtotal, TaxAmount, TotalAmount, AmountTendered, Change
- TransactionItem: UnitPrice, LineTotal
- PurchaseOrderItem: UnitCost
- PurchaseOrder: TotalAmount
- Employee: BasicSalary
- PayrollRecord: BasicSalary, GrossPay, TotalDeductions, NetPay
- Expense: Amount

### Migration History (9 migrations)
1. `20260210022653_InitialCreate` — Users, Roles, SystemSettings, core tables
2. `20260211000000_AddUserSecurityAndAuditColumns` — FailedLoginAttempts, LockoutUntil, PasswordResetToken
3. `20260218014523_DynamicRoles` — Dynamic role permissions
4. `20260220110308_AddAuditLogs` — AuditLogs table
5. `20260220124609_AddIsArchivedToUserAndRole` — Soft-delete for Users and Roles
6. `20260221155031_AddInventoryAndProcurement` — Products, Suppliers, PurchaseOrders, PurchaseOrderItems
7. `20260221155826_AddManagerModules` — Employees, Attendances, PayrollRecords, Customers, Expenses
8. `20260222024605_AddTransactions` — Transactions, TransactionItems
9. `20260303034747_OptimizeDatabaseIndexes` — Performance indexes
10. `20260307035903_AddProductImageUrl` — Product.ImageUrl column for S3

### CRITICAL Database Rules

1. **NEVER modify existing migration files** — Always create a new migration
2. **NEVER drop columns or tables** without confirming impact on all modules
3. **NEVER change decimal precision** on monetary columns — `decimal(18,2)` is the standard
4. **NEVER remove unique constraints** on SKU, Email, TransactionNumber, PONumber
5. **ALWAYS create a migration** for any model change: `dotnet ef migrations add <Name> --project backend/TradeMatrix.Server`
6. **ALWAYS test migrations** on dev DB before deploying to production
7. **Transactions table is append-only** — Status changes only (Completed → Voided), never delete rows
8. **AuditLogs table is append-only** — Never update or delete audit records
9. **Product.Stock** modifications MUST go through the transaction flow or `AdjustStock` endpoint — never set directly
10. **Foreign keys use Restrict delete** on PurchaseOrders → Suppliers — deleting a supplier with POs will fail
11. **TransactionItem.ProductName is a snapshot** — It captures the product name at time of sale (in case product is renamed later)
12. **SystemSettings uses Key as primary key** — Keys must be unique, max 100 chars

---

## 6. OBJECT STORAGE (AWS S3)

### Configuration
| Setting | Value |
|---------|-------|
| Bucket | `tradematrix-uploads` |
| Region | `us-east-1` |
| ACL | `PublicRead` (objects are publicly accessible by URL) |
| Base URL | `https://tradematrix-uploads.s3.us-east-1.amazonaws.com` |

### Current Usage
- **Product images** — Uploaded via `POST /api/Inventory/products/{id}/upload-image`
- Stored at key: `products/{GUID}_{sanitized-filename}`
- Referenced in: `Product.ImageUrl` column (nullable, MaxLength 500)
- Allowed formats: JPEG, PNG, WebP, GIF
- Max file size: 5MB (enforced in controller)
- Old images auto-deleted when replaced

### S3 Rules
1. **ALWAYS use `IS3StorageService`** for S3 operations — never call `IAmazonS3` directly from controllers
2. **ALWAYS store the full S3 URL** in the database (not just the key)
3. **ALWAYS delete old files** from S3 when replacing or removing (prevent orphans)
4. **ALWAYS validate file type and size** in the controller before calling the service
5. **NEVER hardcode bucket names or region** — read from `IConfiguration`
6. **NEVER store files locally in wwwroot** — wwwroot is wiped on every frontend build
7. **USE folder prefixes** to organize: `products/`, `documents/`, etc.
8. **DO NOT upload via multipart with explicit Content-Type header** in Axios — let Axios auto-detect the boundary from FormData. Explicit `Content-Type: multipart/form-data` strips the boundary parameter and breaks uploads.

### CSP Header
The Content-Security-Policy `img-src` directive allows S3 images:
```
img-src 'self' data: blob: https://*.s3.us-east-1.amazonaws.com https://*.s3.ap-southeast-1.amazonaws.com
```
If adding new S3 regions, update the CSP in `Program.cs`.

---

## 7. FRONTEND ARCHITECTURE

### Project Structure
```
frontend/src/
├── App.tsx              # Main router and auth state
├── index.tsx            # Entry point
├── globals.css          # Tailwind base + custom CSS
├── types.ts             # Shared TypeScript interfaces
├── vite-env.d.ts        # Vite type declarations
├── components/
│   ├── ui/              # Reusable UI primitives (shadcn/ui pattern)
│   │   ├── Button.tsx   # cva variants: default, destructive, outline, secondary, ghost, link
│   │   ├── Badge.tsx    # Variants: default, secondary, destructive, outline, success, warning, neutral
│   │   ├── Card.tsx     # Card, CardHeader, CardTitle, CardContent, CardFooter
│   │   ├── Dialog.tsx   # Radix Dialog with overlay
│   │   ├── Input.tsx    # Standard HTML input wrapper
│   │   ├── Label.tsx    # Radix Label
│   │   ├── Select.tsx   # Radix Select components
│   │   ├── Table.tsx    # HTML table wrapper components
│   │   ├── data-table.tsx # TanStack Table integration
│   │   ├── Tabs.tsx     # Radix Tabs
│   │   ├── Pagination.tsx
│   │   ├── Skeleton.tsx
│   │   ├── StatusDot.tsx
│   │   ├── Field.tsx
│   │   ├── Avatar.tsx
│   │   ├── DropdownMenu.tsx
│   │   └── Separator.tsx
│   ├── common/          # Shared application components
│   │   ├── AuthConfirmationModal.tsx  # Password verification for sensitive actions
│   │   ├── ProtectedRoute.tsx         # Role-based route guard
│   │   ├── ErrorBoundary.tsx          # React error boundary
│   │   ├── LogoutConfirmation.tsx
│   │   ├── PageTitle.tsx
│   │   └── Unauthorized.tsx
│   ├── layouts/
│   │   └── DashboardLayout.tsx  # Main layout with sidebar
│   ├── providers/
│   │   └── ThemeProvider.tsx    # Dark/light mode
│   └── Sidebar.tsx              # Navigation sidebar
├── features/                    # Feature-based modules
│   ├── admin/pages/             # UserManagement, RoleManagement, DatabaseAdmin, Security, Archive
│   ├── auth/pages/              # LoginPage
│   ├── crm/pages/               # CRM
│   ├── dashboard/pages/         # Dashboard
│   ├── finance/pages/           # Finance
│   ├── hr/pages/                # HR
│   ├── inventory/               # Inventory (pages/ + services/)
│   ├── pos/                     # POS (pages/ + services/)
│   └── procurement/pages/       # Procurement
├── hooks/                       # Custom React hooks
└── lib/
    ├── axios.ts                 # Configured Axios instance with interceptors
    └── utils.ts                 # cn() utility (clsx + tailwind-merge)
```

### Feature Module Pattern
Each feature should follow:
```
features/{module}/
├── pages/           # Full page components (routed)
├── services/        # API service functions (axios calls)
└── components/      # Module-specific components (if needed)
```

### Frontend Rules
1. **ALWAYS use the shared `api` instance** from `lib/axios.ts` — never create new axios instances
2. **ALWAYS use the `cn()` utility** from `lib/utils.ts` for conditional classNames — never concatenate strings
3. **ALWAYS use Tailwind CSS classes** — no inline styles except for truly dynamic values
4. **ALWAYS use the existing UI components** from `components/ui/` — don't create parallel component systems
5. **ALWAYS define TypeScript interfaces** in `types.ts` for shared types, or co-locate module-specific types
6. **ALWAYS use React Router** for navigation — never `window.location` except for full-page auth redirects
7. **Route guards** are in `ProtectedRoute.tsx` — check `allowedRoles` before rendering
8. **Dark mode** is handled by ThemeProvider — use `dark:` Tailwind variants
9. **POS page hides the sidebar and header** — `DashboardLayout` detects `isPOS` from the route
10. **Vite build output goes to `../backend/TradeMatrix.Server/wwwroot/`** with `emptyOutDir: true`

### Axios Interceptors
- **Request:** Attaches `Authorization: Bearer {token}` from `localStorage.getItem('token')`
- **Response:** On 401, clears auth and redirects to `/login` — EXCEPT for `/auth/verify-password` and `/auth/login` (which legitimately return 401 for wrong passwords)
- **NEVER override Content-Type** when sending FormData — Axios auto-sets it with the correct boundary

---

## 8. AUTHENTICATION & SECURITY

### JWT Authentication
- Algorithm: HMAC-SHA256
- Claims: `sub` (userId), `jti` (GUID), `nameid`, `id` (userId), `Role`, `Email`, `Name`
- Development token expiry: 1440 minutes (24 hours)
- Production token expiry: 60 minutes
- Stored in: `localStorage.getItem('token')`

### Role-Based Access Control
| Role | Access |
|------|--------|
| `SuperAdmin` | Everything — users, roles, system settings, database admin, security, archive |
| `Manager` | Dashboard, POS, Sales, Inventory, Procurement, HR, CRM, Finance |
| `Cashier` | Dashboard, POS, Inventory (read), CRM |
| `InventoryClerk` | Dashboard, Inventory (full), Procurement |

### Security Hardening
- **CSP headers** set in middleware (script-src, style-src, img-src, connect-src, frame-ancestors)
- **X-Content-Type-Options: nosniff**
- **X-Frame-Options: SAMEORIGIN**
- **Account lockout** after failed login attempts (FailedLoginAttempts, LockoutUntil)
- **Password hashing** via `IPasswordHashingService` (never store plaintext)
- **Sensitive POS actions** (void item, clear cart) require re-authentication via `AuthConfirmationModal`
- **Audit logging** on all state-changing API calls (via AuditLogAttribute)

### Security Rules
1. **NEVER expose secrets** in frontend code or environment defines
2. **NEVER bypass `[Authorize]`** on state-changing endpoints
3. **NEVER store passwords** in plaintext — always use `IPasswordHashingService`
4. **NEVER trust client-side role checks alone** — always enforce on the backend with `[Authorize(Roles = "...")]`
5. **NEVER disable HTTPS redirection** in production
6. **ALWAYS validate file uploads** (type, size) before processing
7. **ALWAYS use parameterized queries** (EF Core handles this) — never concatenate SQL

---

## 9. SYSTEM MODULES & WORKFLOWS

### Module: POS (Point of Sale)
- **Route:** `/pos` | **Roles:** Manager, Cashier
- **Flow:** Browse products → Add to cart → Select payment method → Process transaction
- **Transaction creation** uses a database transaction: validates stock, computes VAT, decrements stock, generates TRX number
- **VAT:** 12% Philippine VAT-inclusive (price already includes VAT; `vatableSales = total / 1.12`)
- **Payment methods:** Cash, Card, GCash, PayMaya
- **Void requires auth:** Removing items or clearing cart triggers `AuthConfirmationModal`

### Module: Inventory
- **Route:** `/inventory` | **Roles:** Manager, InventoryClerk, Cashier
- **Features:** Product CRUD, stock adjustment, product image upload (S3), SKU search
- **Stock is auto-decremented** when a POS transaction is completed
- **Stock is auto-restored** when a transaction is voided
- **Product images** are uploaded to S3 and URL stored in `Product.ImageUrl`

### Module: Procurement
- **Route:** `/procurement` | **Roles:** Manager, InventoryClerk
- **Features:** Supplier management, Purchase Order creation
- **PO numbers** are auto-generated
- **POs reference Products and Suppliers** via foreign keys
- **Supplier deletion is restricted** if POs exist (DeleteBehavior.Restrict)

### Module: HR
- **Route:** `/hr` | **Roles:** Manager
- **Features:** Employee CRUD, attendance logging, view attendance history
- **Attendance** has a composite index on {EmployeeId, Date} to prevent duplicate entries

### Module: Payroll
- **Route:** Via HR | **Roles:** Manager
- **Features:** Run payroll for a date range, calculates GrossPay/Deductions/NetPay
- **PayrollRecords** are linked to Employees

### Module: Finance
- **Route:** `/finance` | **Roles:** Manager
- **Features:** Expense tracking, monthly summaries
- **Financial reporting** pulls from both Expenses and Transactions

### Module: Sales History
- **Route:** `/sales` | **Roles:** SuperAdmin, Manager
- **Features:** View all transactions, filter by date, void transactions
- **Voiding** a transaction restores product stock

### Module: CRM
- **Route:** `/crm` | **Roles:** Manager, Cashier
- **Features:** Customer CRUD, loyalty points tracking

### Module: Dashboard
- **Route:** `/dashboard` | **Roles:** All authenticated
- **Role-adaptive:** Shows different widgets per role (SuperAdmin sees security alerts, Cashier sees today's stats, Manager sees charts)

### Module: Admin
- **Routes:** `/admin/*` | **Roles:** SuperAdmin only
- **SubModules:** User Management, Role Management, Database Admin, Security (audit logs), Archive
- **Database Admin** can run migrations, view DB stats, export users

---

## 10. DATA FLOW REFERENCE

### POS Sale Transaction
```
Customer → Cashier selects products → Cart (frontend state)
  → POST /api/Transaction (CreateTransactionDto)
    → TransactionController validates
      → Service opens DB transaction
        → For each item: verify stock, decrement Product.Stock
        → Create Transaction + TransactionItems
        → Compute: Subtotal, TaxAmount (12% VAT), TotalAmount
        → Generate TransactionNumber: TRX-YYYYMMDD-XXXX
      → Commit DB transaction
    → Return TransactionDto
  → Frontend shows receipt → Cart cleared → Products reloaded
```

### Product Image Upload
```
Admin uploads file → Frontend sends FormData (NO explicit Content-Type header)
  → POST /api/Inventory/products/{id}/upload-image
    → Controller validates: file type (JPEG/PNG/WebP/GIF), size (≤5MB)
    → If old image exists → S3StorageService.DeleteFileAsync(oldUrl)
    → S3StorageService.UploadFileAsync(stream, name, contentType, "products")
      → S3 PutObject with PublicRead ACL
      → Returns full URL: https://tradematrix-uploads.s3.us-east-1.amazonaws.com/products/{guid}_{name}
    → Update Product.ImageUrl in database
  → Frontend displays image from S3 URL
```

### Payroll Processing
```
Manager selects pay period → POST /api/Payroll/run (RunPayrollDto)
  → For each active Employee:
    → Create PayrollRecord with BasicSalary, compute GrossPay, Deductions, NetPay
    → Status = "Pending"
  → Return payroll records
```

### Transaction Void
```
Manager voids transaction → PATCH /api/Transaction/{id}/void
  → Verify transaction exists and Status = "Completed"
  → For each TransactionItem: restore Product.Stock += Quantity
  → Set Transaction.Status = "Voided"
```

---

## 11. CODING STANDARDS

### Backend (C#)
- **Naming:** PascalCase for classes, methods, properties. camelCase for local variables
- **Async:** All service methods returning data MUST be async (Task<T>)
- **DTOs:** Always use DTOs for API input/output — never expose entity models directly
- **Null handling:** Use nullable reference types (`string?`, `int?`). Configure `<Nullable>enable</Nullable>`
- **Response format:** Use `ApiResponse<T>` wrapper for complex operations, or return DTOs directly for simple reads
- **Decimal precision:** Always `[Column(TypeName = "decimal(18,2)")]` for monetary values
- **Status enums as strings:** Use string constants (e.g., "Completed", "Voided", "Pending") — not C# enums

### Frontend (TypeScript/React)
- **Components:** Functional components with React.FC typing
- **State:** useState + useMemo + useCallback. No Redux or external state management
- **Styling:** Tailwind CSS utility classes. Use `cn()` for conditional classes
- **Forms:** Controlled components with useState (no form libraries)
- **API calls:** Always via service functions that call the shared `api` instance
- **Error display:** Toast-style alerts via window.alert (to be upgraded) or inline error states
- **Currency display:** `₱{value.toFixed(2)}` — always 2 decimal places

### File Naming
- Backend: PascalCase (e.g., `InventoryController.cs`, `ProductDto.cs`)
- Frontend components: PascalCase (e.g., `POS.tsx`, `DashboardLayout.tsx`)
- Frontend services: camelCase (e.g., `posService.ts`, `inventoryService.ts`)
- Frontend utils: camelCase (e.g., `axios.ts`, `utils.ts`)

---

## 12. FORBIDDEN ACTIONS

### NEVER DO
| ❌ Action | Why |
|-----------|-----|
| Modify `wwwroot/` files directly | Wiped on every `npm run build` |
| Access `ApplicationDbContext` from controllers | Breaks service layer pattern |
| Create new axios instances | Must use shared `api` from `lib/axios.ts` |
| Add `Content-Type: multipart/form-data` header explicitly | Strips FormData boundary |
| Modify existing EF migration files | Creates schema mismatches |
| Delete database rows from Transactions or AuditLogs | These are append-only tables |
| Set Product.Stock directly via raw SQL or DbContext | Must use TransactionController or AdjustStock |
| Store files in wwwroot or local filesystem | Use S3 via IS3StorageService |
| Hardcode connection strings, JWT keys, or AWS credentials | Use appsettings.*.json |
| Remove `[Authorize]` from state-changing endpoints | Security violation |
| Change decimal precision on monetary columns | Breaks financial calculations |
| Push `appsettings.Development.json` credentials to production | Different configs per environment |
| Reorder middleware pipeline in Program.cs | Breaks auth, CORS, and static file serving |
| Use `window.location.href` for in-app navigation | Use React Router's `useNavigate()` |
| Add global CSS that conflicts with Tailwind | Use Tailwind utilities or cn() |
| Bypass AuthConfirmationModal for POS void/clear actions | Security requirement |
| Remove IsSystemRole check on Role deletion | Protects SuperAdmin and built-in roles |

---

## 13. SAFE DEVELOPMENT CHECKLIST

### Adding a New Feature
- [ ] Create the EF model in `Models/`
- [ ] Create DTOs in `DTOs/`
- [ ] Create a migration: `dotnet ef migrations add <Name> --project backend/TradeMatrix.Server`
- [ ] Create the service interface (`I{Name}Service`) and implementation in `Services/`
- [ ] Register the service in `Program.cs` as `AddScoped`
- [ ] Create the controller in `Controllers/` with appropriate `[Authorize]` attributes
- [ ] Create the frontend service in `features/{module}/services/`
- [ ] Create the page component in `features/{module}/pages/`
- [ ] Add the route in `App.tsx` with `ProtectedRoute` and correct `allowedRoles`
- [ ] Add sidebar link in `Sidebar.tsx` if needed
- [ ] Run `npm run build` to update wwwroot
- [ ] Run `dotnet build` to verify backend compiles
- [ ] Test on localhost:5009

### Modifying Database Schema
- [ ] Make changes to the model in `Models/`
- [ ] Update related DTOs
- [ ] Update service mappings
- [ ] Create migration: `dotnet ef migrations add <Name>`
- [ ] Review the generated migration file
- [ ] Apply to dev DB: `dotnet ef database update`
- [ ] Test thoroughly
- [ ] Apply to production via SuperAdmin `/api/Database/migrate` or manual migration

### Deploying to Production
- [ ] Ensure `appsettings.Production.json` is up to date
- [ ] Run `cd frontend && npm run build`
- [ ] Run `cd backend/TradeMatrix.Server && dotnet publish -c Release -o publish`
- [ ] Verify `publish/wwwroot/index.html` references the latest asset hashes
- [ ] Upload `publish/` contents to MonsterASP.NET
- [ ] Verify health check: `GET /api/health-check`
- [ ] Apply any pending migrations

### Adding S3 Storage for a New Entity
- [ ] Add a nullable `ImageUrl` (or similar) column to the model: `[MaxLength(500)] public string? ImageUrl`
- [ ] Create a migration for the new column
- [ ] Add upload/delete endpoints in the controller (validate file type and size)
- [ ] Use `IS3StorageService.UploadFileAsync()` with a new folder prefix (e.g., "employees")
- [ ] Update the CSP `img-src` in `Program.cs` if using a new S3 region
- [ ] Frontend: Send `FormData` without explicit Content-Type header
- [ ] Frontend: Display image with `<img src={item.imageUrl}>` with fallback icon

---

## SYSTEM LIMITATIONS

### Known Constraints
1. **No WebSocket/SignalR** — All communication is request/response (polling for real-time)
2. **No background job system** — No Hangfire/Quartz. Payroll processing is synchronous
3. **Single database** — No read replicas, no sharding
4. **No CDN** — S3 serves images directly (consider CloudFront for high traffic)
5. **No email service** — Password reset tokens exist in the model but email sending is not implemented
6. **IIS deployment only** — No Linux/Nginx in production
7. **100MB upload limit** — Set in web.config requestFiltering
8. **Connection pool max 100** — Configured in production connection string
9. **No API versioning** — All endpoints are `/api/{controller}`
10. **No rate limiting** — Consider adding for login and public endpoints
11. **Frontend alert() for errors** — Should be replaced with toast system
