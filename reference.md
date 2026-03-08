# TradeMatrix MIS — System Reference Document

> **Generated:** March 8, 2026  
> **Purpose:** Comprehensive system reference covering architecture, codebase inventory, data model, module workflows, known issues, and future risk analysis.  
> **Scope:** Full-stack audit — backend (ASP.NET Core 8), frontend (React 19 + TypeScript), database (SQL Server), object storage (AWS S3), deployment (MonsterASP.NET / IIS).

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Deployment Architecture](#3-deployment-architecture)
4. [Database Schema](#4-database-schema)
5. [Backend — Controllers](#5-backend--controllers)
6. [Backend — Services](#6-backend--services)
7. [Backend — Infrastructure](#7-backend--infrastructure)
8. [Frontend — Routing & Auth](#8-frontend--routing--auth)
9. [Frontend — Modules](#9-frontend--modules)
10. [Frontend — Shared Components](#10-frontend--shared-components)
11. [Security Model](#11-security-model)
12. [Data Flows](#12-data-flows)
13. [Known Issues & Inconsistencies](#13-known-issues--inconsistencies)
14. [Future Risks & Technical Debt](#14-future-risks--technical-debt)
15. [File Index](#15-file-index)

---

## 1. SYSTEM OVERVIEW

**TradeMatrix MIS** is a full-stack Management Information System designed for small-to-medium Philippine retail businesses. It is a monolithic SPA that combines POS, Inventory, Procurement, HR, Payroll, Finance, CRM, and Admin capabilities into a single deployable artifact.

### Core Purpose

| Module | Purpose |
|--------|---------|
| POS | Process sales transactions, accept cash/card/e-wallet, print receipts |
| Inventory | Manage product catalog, track stock levels, log movements |
| Procurement | Manage suppliers, create and receive purchase orders |
| HR | Manage employees, log attendance, run payroll |
| Finance | Track expenses, view monthly summaries |
| CRM | Manage customers, track loyalty points |
| Dashboard | Role-adaptive analytics and operational overview |
| Admin | User management, role/permission management, audit logs, DB admin |

### Philippine Business Context

- All pricing is **VAT-inclusive at 12%** (Philippine standard)
- Currency denomination: **₱ (Philippine Peso)**
- VAT computation: `vatableSales = subtotal / 1.12`, `taxAmount = subtotal − vatableSales`
- Default password for new users: **`TradeMatrix2024!`**

---

## 2. TECHNOLOGY STACK

### Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | .NET | 8.0 |
| Framework | ASP.NET Core | 8.0 |
| ORM | Entity Framework Core | 8.0.0 |
| Database | SQL Server | — |
| Authentication | JWT Bearer (HMAC-SHA256) | 8.0.0 |
| Object Storage | AWS SDK S3 | 3.7.405.2 |
| Password Hashing | PBKDF2-SHA1, 10,000 iterations, 128-bit salt | Built-in |
| Hosting (Production) | IIS In-Process via ANCM v2 | — |

### Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| UI Library | React | 19.x |
| Language | TypeScript | 5.8.x |
| Build Tool | Vite | 6.x |
| CSS | Tailwind CSS | 3.4.x |
| UI Primitives | Radix UI (dialog, dropdown, select, tabs, label) | — |
| HTTP Client | Axios | 1.13.x |
| Router | React Router DOM | 7.x |
| Charts | Recharts | 3.x |
| Data Tables | TanStack Table | 8.x |
| Icons | Lucide React | 0.574.x |
| QR Codes | qrcode.react | 4.2.0 |
| Testing | Vitest + Testing Library | — |

---

## 3. DEPLOYMENT ARCHITECTURE

```
Browser (SPA)
└── React 19 + TypeScript + Tailwind

        │ /api/* (JWT Bearer in Authorization header)
        ▼

ASP.NET Core 8 (IIS In-Process — MonsterASP.NET)
├── Kestrel/IIS → Controllers → Services → EF Core → SQL Server
├── Static Files: wwwroot/  ← Vite build output
└── Object Storage: AWS S3 (tradematrix-uploads, us-east-1)

        │
  ┌─────┴─────┐
  ▼           ▼
SQL Server  AWS S3
(db32949.public.databaseasp.net)  (tradematrix-uploads.s3.us-east-1.amazonaws.com)
```

### Key Config Values

| Setting | Development | Production |
|---------|-------------|-----------|
| Backend URL | `http://localhost:5009` | `https://tradematrix.tryasp.net` |
| Frontend Dev URL | `http://localhost:4000` | Same as backend (static files) |
| JWT Expiry | 1440 min (24h) | 60 min |
| DB Connection | `PAMMY\SQLEXPRESS` (local) | `db32949.public.databaseasp.net` |
| S3 Bucket | tradematrix-uploads | tradematrix-uploads |
| S3 Region | us-east-1 | us-east-1 |

### Deployment Process

```bash
# 1. Build frontend into wwwroot
cd frontend && npm run build         # emptyOutDir: true — WIPES wwwroot

# 2. Publish backend
cd backend/TradeMatrix.Server
dotnet publish -c Release -o publish

# 3. Upload publish/ contents to MonsterASP.NET control panel
# 4. Verify: GET /api/health-check
# 5. Apply pending migrations: POST /api/Database/migrate (SuperAdmin only)
```

### Critical Deployment Constraints

- `wwwroot/` is **wiped on every** `npm run build` — never store files there
- No auto-migration on startup — must be triggered manually via `/api/Database/migrate`
- `appsettings.Production.json` contains real credentials — bundled into `publish/`, never commit to git
- Max upload: 100MB (`web.config` requestFiltering)
- Connection pool: Min=5, Max=100, Lifetime=300s (production)

---

## 4. DATABASE SCHEMA

### Entity Relationship Summary

```
Roles (1) ──── (N) Users (1) ──── (N) Transactions
                                        │
                                        └── (N) TransactionItems ──── (N:1) Products

Products (N) ──── (1) Suppliers (1) ──── (N) PurchaseOrders
                                                │
                                                └── (N) PurchaseOrderItems ──── (N:1) Products

Products (1) ──── (N) StockMovements

Employees (1) ──── (N) Attendances
Employees (1) ──── (N) PayrollRecords

Customers     (standalone)
Expenses      (standalone)
SystemSettings (key-value store)
AuditLogs     (append-only event log)
```

### All Tables (15 entities)

#### Users
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK, identity |
| Name | nvarchar(100) | Required |
| Email | nvarchar(max) | Required, Unique index |
| PasswordHash | nvarchar(max) | Required |
| RoleId | int | FK → Roles |
| IsActive | bit | Default true |
| IsArchived | bit | Default false |
| CreatedAt | datetime2 | Default UtcNow |
| UpdatedAt | datetime2? | Nullable |
| CreatedBy | nvarchar? | Nullable |
| UpdatedBy | nvarchar? | Nullable |
| LastLogin | datetime2? | Nullable |
| FailedLoginAttempts | int | Default 0 |
| LockoutUntil | datetime2? | Nullable |
| PasswordResetToken | nvarchar? | Nullable |
| PasswordResetExpiry | datetime2? | Nullable |

#### Roles
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| Name | nvarchar(50) | Required, Unique index |
| Description | nvarchar(200) | — |
| Permissions | nvarchar(max) | JSON/CSV string |
| IsSystemRole | bit | Default false |
| IsArchived | bit | Default false |
| CreatedAt | datetime2 | Default UtcNow |

#### Products
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| Name | nvarchar(100) | Required |
| SKU | nvarchar(50) | Required, Unique index |
| Category | nvarchar(50) | Required, Index |
| CostPrice | decimal(18,2) | — |
| SellingPrice | decimal(18,2) | — |
| Stock | int | — |
| ReorderLevel | int | Default 10 |
| UnitOfMeasure | nvarchar | Default "pcs" |
| SupplierId | int? | FK → Suppliers (nullable) |
| CreatedAt | datetime2 | Default UtcNow |
| IsActive | bit | Default true, Index |
| ImageUrl | nvarchar(500)? | S3 URL, nullable |
| Barcode | nvarchar(50)? | Nullable |

#### Suppliers
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| CompanyName | nvarchar(100) | Required, Index |
| ContactPerson | nvarchar(100) | Required |
| ContactNumber | nvarchar(20) | Required |
| Email | nvarchar(100) | Required |
| Address | nvarchar(max) | Default "" |
| CreatedAt | datetime2 | Default UtcNow |
| IsActive | bit | Default true |

#### PurchaseOrders
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| PONumber | nvarchar(20) | Required, Unique |
| SupplierId | int | FK → Suppliers (Restrict delete) |
| OrderDate | datetime2 | Default UtcNow |
| ExpectedDeliveryDate | datetime2? | Nullable |
| TotalAmount | decimal(18,2) | — |
| Status | nvarchar(20) | Default "Pending" |
| Items | (nav) | → PurchaseOrderItems |
| CreatedAt | datetime2 | Default UtcNow |
| ReceivedDate | datetime2? | Nullable |
| ReceivedBy | nvarchar(100)? | Nullable |

#### PurchaseOrderItems
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| PurchaseOrderId | int | FK → PurchaseOrders |
| ProductId | int | FK → Products |
| Quantity | int | — |
| UnitCost | decimal(18,2) | — |

#### Transactions
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| TransactionNumber | nvarchar(30) | Required, Unique |
| CashierId | int? | FK → Users (nullable) |
| PaymentMethod | nvarchar(30) | Default "Cash" |
| Subtotal | decimal(18,2) | — |
| TaxAmount | decimal(18,2) | — |
| TotalAmount | decimal(18,2) | — |
| AmountTendered | decimal(18,2) | — |
| Change | decimal(18,2) | — |
| Status | nvarchar(20) | Default "Completed" |
| TransactionDate | datetime2 | Default UtcNow, Index |
| Items | (nav) | → TransactionItems |

#### TransactionItems
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| TransactionId | int | FK → Transactions |
| ProductId | int | FK → Products |
| ProductName | nvarchar(100) | **Snapshot** at time of sale |
| UnitPrice | decimal(18,2) | Snapshot |
| Quantity | int | — |
| LineTotal | decimal(18,2) | — |

#### Employees
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| FirstName | nvarchar(50) | Required |
| LastName | nvarchar(50) | Required |
| Email | nvarchar(100) | Required, Unique |
| ContactNumber | nvarchar(20)? | Nullable |
| Department | nvarchar(50) | Required, Index |
| Position | nvarchar(50) | Required |
| EmploymentStatus | nvarchar(20) | Default "Full-time" |
| BasicSalary | decimal(18,2) | — |
| HireDate | datetime2 | Default UtcNow |
| IsActive | bit | Default true |
| CreatedAt | datetime2 | Default UtcNow |

#### Attendances
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| EmployeeId | int | FK → Employees |
| Date | datetime2 | Default UtcNow.Date |
| TimeIn | TimeSpan? | Nullable |
| TimeOut | TimeSpan? | Nullable |
| Status | nvarchar(20) | Default "Present" |
| Remarks | nvarchar? | Nullable |
| — | — | **Composite index on {EmployeeId, Date}** |

#### PayrollRecords
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| EmployeeId | int | FK → Employees |
| PayPeriodStart | datetime2 | — |
| PayPeriodEnd | datetime2 | — |
| BasicSalary | decimal(18,2) | — |
| GrossPay | decimal(18,2) | — |
| TotalDeductions | decimal(18,2) | — |
| NetPay | decimal(18,2) | — |
| Status | nvarchar(20) | Default "Pending" |
| PaymentDate | datetime2? | Nullable |
| Remarks | nvarchar? | Nullable |
| CreatedAt | datetime2 | Default UtcNow |

#### Customers
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| CustomerName | nvarchar(100) | Required |
| CustomerType | nvarchar(20) | Default "Retail" |
| ContactNumber | nvarchar(20)? | Nullable |
| Email | nvarchar(100)? | Nullable |
| Address | nvarchar(200)? | Nullable |
| LoyaltyPoints | int | Default 0 |
| IsActive | bit | Default true |
| CreatedAt | datetime2 | Default UtcNow |

#### Expenses
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| ExpenseCategory | nvarchar(50) | Required, Index |
| Description | nvarchar(200) | Required |
| Amount | decimal(18,2) | — |
| ExpenseDate | datetime2 | Default UtcNow, Index |
| Status | nvarchar(20) | Default "Paid" |
| ReferenceNumber | nvarchar(50)? | Nullable |
| CreatedAt | datetime2 | Default UtcNow |

#### SystemSettings
| Column | Type | Constraints |
|--------|------|-------------|
| Key | nvarchar(100) | **PK** (string key) |
| Value | nvarchar(max) | — |
| Description | nvarchar(200) | — |
| Group | nvarchar | Default "General" |
| UpdatedAt | datetime2 | Default UtcNow |

#### AuditLogs
| Column | Type | Constraints |
|--------|------|-------------|
| Id | nvarchar(50) | PK string (evt_{GUID}) |
| Timestamp | datetime2 | Index |
| ActorName | nvarchar(100) | — |
| ActorEmail | nvarchar(150) | Index |
| IpAddress | nvarchar(50) | — |
| Event | nvarchar(100) | Index (e.g., auth.login.success) |
| Resource | nvarchar(200) | — |
| Status | nvarchar(20) | (Success, Failure, Warning) |
| Severity | nvarchar(20) | Index (Low, Medium, High, Critical) |
| Metadata | nvarchar(max) | JSON |

#### StockMovements
| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | PK |
| ProductId | int | FK → Products |
| MovementType | nvarchar(20) | Required (STOCK_IN, SALE, WASTE, ADJUSTMENT, VOID_RESTORE) |
| Quantity | int | — |
| Reference | nvarchar(100)? | PO number, TRX number, or reason |
| Notes | nvarchar(500)? | Nullable |
| CostPrice | decimal(18,2)? | Cost at time of movement |
| RecordedBy | nvarchar(100) | Required |
| CreatedAt | datetime2 | Default UtcNow |

### Migration History (10 migrations)

| # | Migration | Date | Changes |
|---|-----------|------|---------|
| 1 | InitialCreate | 2026-02-10 | Users, Roles, SystemSettings, core tables |
| 2 | AddUserSecurityAndAuditColumns | 2026-02-11 | FailedLoginAttempts, LockoutUntil, PasswordResetToken |
| 3 | DynamicRoles | 2026-02-18 | Dynamic role permissions |
| 4 | AddAuditLogs | 2026-02-20 | AuditLogs table |
| 5 | AddIsArchivedToUserAndRole | 2026-02-20 | IsArchived on Users and Roles |
| 6 | AddInventoryAndProcurement | 2026-02-21 | Products, Suppliers, PurchaseOrders, PurchaseOrderItems |
| 7 | AddManagerModules | 2026-02-21 | Employees, Attendances, PayrollRecords, Customers, Expenses |
| 8 | AddTransactions | 2026-02-22 | Transactions, TransactionItems |
| 9 | OptimizeDatabaseIndexes | 2026-03-03 | Performance indexes |
| 10 | AddProductImageUrl | 2026-03-07 | Product.ImageUrl for S3 |

---

## 5. BACKEND — CONTROLLERS

All controllers reside in `backend/TradeMatrix.Server/Controllers/`.

### Route & Auth Summary

| Controller | Route Base | Class Auth | Notes |
|-----------|-----------|-----------|-------|
| AuthController | `/api/Auth` | None (public) | Login, profile, verify-password |
| AuditController | `/api/Audit` | SuperAdmin | Audit log reads |
| CustomerController | `/api/Customer` | SuperAdmin, Manager, Cashier | Customer CRUD |
| DashboardController | `/api/Dashboard` | [Authorize] (any) | Role-adaptive summary |
| DatabaseController | `/api/Database` | SuperAdmin | DB info, health, migrations, export |
| FinanceController | `/api/Finance` | SuperAdmin, Manager | Expense CRUD + monthly summary |
| HRController | `/api/HR` | SuperAdmin, Manager | Employee, attendance |
| InventoryController | `/api/Inventory` | [Authorize] (any, write restricted) | Products, stock movements, images |
| PayrollController | `/api/Payroll` | SuperAdmin, Manager | Run payroll, list records |
| ProcurementController | `/api/Procurement` | [Authorize] (any, write restricted) | Suppliers, POs |
| RolesController | `/api/Roles` | SuperAdmin | Role CRUD + archive/restore |
| SystemController | `/api/System` | SuperAdmin | Key-value system settings |
| TransactionController | `/api/Transaction` | [Authorize] (any, role-scoped) | POS transactions |
| UsersController | `/api/Users` | [Authorize] (mostly SuperAdmin) | User CRUD + account management |

### Endpoint Inventory (100+ total)

#### AuthController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/Auth/login` | Anonymous | Login, return JWT token |
| GET | `/api/Auth/profile` | Any auth | Get current user profile |
| POST | `/api/Auth/verify-password` | Any auth | Re-authenticate for sensitive actions |

#### CustomerController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/Customer` | SA/Mgr/Cashier | List all customers |
| POST | `/api/Customer` | SA/Mgr/Cashier | Create customer |
| PUT | `/api/Customer/{id}` | SA/Mgr/Cashier | Update customer |

#### DashboardController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/Dashboard/summary` | Any auth | Role-adaptive dashboard data |

#### DatabaseController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/Database/info` | SA | DB server info + migration count |
| GET | `/api/Database/statistics` | SA | User stats, role distribution |
| GET | `/api/Database/health` | SA | Connection health check |
| GET | `/api/Database/connection-info` | SA | Pool/SSL config |
| POST | `/api/Database/migrate` | SA | Run pending EF migrations |
| GET | `/api/Database/statistics` | SA | Table row counts etc. |
| POST | `/api/Database/backup/export-users` | SA | Export users as JSON |
| POST | `/api/Database/backup/request` | SA | Returns hardcoded hosting backup policy |

#### FinanceController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/Finance/expenses` | SA/Mgr | List all expenses |
| POST | `/api/Finance/expenses` | SA/Mgr | Create expense |
| PUT | `/api/Finance/expenses/{id}` | SA/Mgr | Update expense |
| GET | `/api/Finance/summary` | SA/Mgr | Monthly expense total (query: month, year) |

#### HRController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/HR/employees` | SA/Mgr | List active employees |
| POST | `/api/HR/employees` | SA/Mgr | Create employee |
| PUT | `/api/HR/employees/{id}` | SA/Mgr | Update employee |
| GET | `/api/HR/attendance` | SA/Mgr | Get attendance (query: date?) |
| POST | `/api/HR/attendance` | SA/Mgr | Log attendance record |

#### InventoryController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/Inventory/products` | Any auth | List all active products |
| GET | `/api/Inventory/products/{id}` | Any auth | Get product detail |
| GET | `/api/Inventory/products/lookup/{code}` | Any auth | Lookup by SKU or barcode |
| POST | `/api/Inventory/products` | SA/Mgr/InvClerk | Create product (auto-SKU if blank) |
| PUT | `/api/Inventory/products/{id}` | SA/Mgr/InvClerk | Update product |
| DELETE | `/api/Inventory/products/{id}` | SA/Mgr/InvClerk | Soft-delete product |
| POST | `/api/Inventory/products/{id}/upload-image` | SA/Mgr/InvClerk | Upload S3 image |
| DELETE | `/api/Inventory/products/{id}/image` | SA/Mgr/InvClerk | Remove S3 image |
| POST | `/api/Inventory/products/{id}/stock-movements` | SA/Mgr/InvClerk | Record movement |
| GET | `/api/Inventory/products/{id}/stock-movements` | SA/Mgr/InvClerk | View history (paginated) |
| GET | `/api/Inventory/products/{id}/stock-summary` | SA/Mgr/InvClerk | Movement summary |
| GET | `/api/Inventory/stock-movements` | SA/Mgr/InvClerk | All movements (paginated, filterable) |

#### PayrollController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/Payroll` | SA/Mgr | List payroll records |
| POST | `/api/Payroll/run` | SA/Mgr | Run payroll for a date range |

#### ProcurementController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/Procurement/suppliers` | Any auth | List suppliers |
| POST | `/api/Procurement/suppliers` | SA/Mgr/InvClerk | Create supplier |
| PUT | `/api/Procurement/suppliers/{id}` | SA/Mgr/InvClerk | Update supplier |
| GET | `/api/Procurement/purchase-orders` | Any auth | List POs |
| POST | `/api/Procurement/purchase-orders` | SA/Mgr/InvClerk | Create PO |
| POST | `/api/Procurement/purchase-orders/{id}/receive` | SA/Mgr/InvClerk | Receive PO (increments stock) |

#### RolesController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/Roles` | SA | List roles (query: isArchived?) |
| GET | `/api/Roles/{id}` | SA | Get role by ID |
| POST | `/api/Roles` | SA | Create role |
| PUT | `/api/Roles/{id}` | SA | Update role |
| DELETE | `/api/Roles/{id}` | SA | Hard delete role |
| PUT | `/api/Roles/{id}/archive` | SA | Archive role |
| PUT | `/api/Roles/{id}/restore` | SA | Restore archived role |

#### SystemController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/System/settings` | SA | List all system settings (key-value) |
| PUT | `/api/System/settings/{key}` | SA | Update a setting by key |

#### TransactionController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/Transaction` | Mgr/Cashier | Create sale transaction (ACID) |
| GET | `/api/Transaction` | Manager | List transactions (paginated, date range) |
| GET | `/api/Transaction/my-today` | Mgr/Cashier | Today's transactions for current user |
| GET | `/api/Transaction/{id}` | Mgr/Cashier | Get transaction (Cashier sees own only) |
| PATCH | `/api/Transaction/{id}/void` | Manager | Void transaction (restores stock) |

#### UsersController
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| GET | `/api/Users/list` | SA | Paginated user list (search, role, isArchived filters) |
| GET | `/api/Users/{id}` | SA | Get user detail |
| POST | `/api/Users/create` | SA | Create user |
| PUT | `/api/Users/{id}` | SA | Update user |
| DELETE | `/api/Users/{id}` | SA | Delete user |
| POST | `/api/Users/{id}/unlock` | SA | Unlock locked account |
| POST | `/api/Users/{id}/reset-password` | SA | Reset any user's password |
| PUT | `/api/Users/{id}/archive` | SA | Archive user (soft-delete) |
| PUT | `/api/Users/{id}/restore` | SA | Restore archived user |

---

## 6. BACKEND — SERVICES

All services live in `backend/TradeMatrix.Server/Services/` with `I{Name}Service` interfaces.

### AuditService
- **LogEventAsync**: Appends AuditLog with `evt_{GUID}` ID, JSON metadata; silently fails — never crashes main request
- **GetLogsAsync**: Returns last 500 logs DESC by timestamp; deserializes metadata JSON

### AuthService
- **LoginAsync**: Validates credentials via `IPasswordHashingService.VerifyPassword`; checks `IsActive`; resets lockout on success; generates JWT (HMAC-SHA256) with claims `sub, jti, nameid, id, Role, Email, Name`
- **GetProfileAsync**: Returns user profile with LastLogin
- **VerifyPasswordAsync**: Constant-time password check for sensitive actions

### CustomerService
- Standard CRUD; `GetCustomersAsync` filters `IsActive = true`

### DashboardService
- **Heavy multi-query aggregation**:
  - User stats, employee count, product count, low-stock count
  - Monthly expenses, pending POs
  - Security events (failed logins last 24h)
  - Recent 5 audit log entries (with relative time)
  - Weekly expenses (last 7 days, grouped by day of week)
  - Expense category breakdown (current month)
  - Top 5 low-stock items with status classification
  - Top 5 pending POs with ETA
  - Cashier view: today's revenue, count, items sold, recent 5 transactions

### DatabaseService
- **GetDatabaseInfoAsync**: Parses connection string; counts applied/pending migrations
- **RunMigrationsAsync**: Calls `context.Database.MigrateAsync()`
- **CheckHealthAsync**: Returns "Healthy/Warning/Unhealthy" based on connectivity + pending migration count
- **ExportUsersAsync**: Serializes all users to JSON

### FinanceService
- Standard CRUD on Expenses; `GetTotalExpensesForMonthAsync` filters by month+year, returns sum

### HRService
- Employee CRUD (`IsActive` filter on get); attendance log; payroll runner
- **RunPayrollAsync**: For each active employee, creates PayrollRecord with `NetPay = BasicSalary` (no deductions logic yet), Status = "Pending"

### InventoryService
- **CreateProductAsync**: Auto-generates SKU using category prefix + zero-padded sequence (e.g., `ELEC-0001`); if `InitialStock > 0`, records `STOCK_IN` movement for traceability
- **GetProductByBarcodeOrSkuAsync**: Dual-field lookup (SKU OR Barcode)
- **DeleteProductAsync**: Soft-delete via `IsActive = false`

### PasswordHashingService
- PBKDF2-SHA1, 10,000 iterations, 16-byte random salt per password
- `VerifyPassword` uses `CryptographicOperations.FixedTimeEquals` for constant-time comparison

### ProcurementService
- **CreatePurchaseOrderAsync**: Auto-generates `PO-YYYYMMDD-{GUID[0..3]}`; calculates `TotalAmount = Σ(Qty × Cost)`
- **ReceivePurchaseOrderAsync**: Calls `IStockMovementService.RecordMovementAsync(STOCK_IN, ...)` for each item; sets Status = "Received"

### RoleService
- **CreateRoleAsync**: Returns conflict if name exists; `IsSystemRole = false` always for new roles
- **DeleteRoleAsync**: Blocks deletion of system roles and roles with assigned users
- **UpdateRoleAsync**: Blocks renaming of system roles
- **ArchiveRoleAsync**: Blocks archiving system roles

### S3StorageService
- **UploadFileAsync**: Key = `{folder}/{GUID}_{sanitized-filename}`; `CannedACL.PublicRead`; returns full URL
- **DeleteFileAsync**: Extracts key from URL; graceful failure on key not found

### StockMovementService
- **RecordMovementAsync**: Updates `Product.Stock` atomically in same `SaveChanges` call
  - STOCK_IN, VOID_RESTORE → `+quantity`
  - SALE, WASTE → `-quantity`
  - ADJUSTMENT → `±quantity` (caller controls sign)
- **GetProductMovementSummaryAsync**: Calculates `CalculatedStock = StockIn − Sales − Waste + Adjustments + VoidRestored`; compares to `Product.Stock` to detect discrepancies

### SystemService
- Get/update key-value configuration entries; immutable keys, mutable values

### TransactionService (POS Core)
- **CreateTransactionAsync** (ACID via `BeginTransactionAsync`):
  1. Validates all product IDs exist and stock ≥ quantity
  2. Generates `TRX-YYYYMMDD-{daily count:D4}` transaction number
  3. For each item: calls `RecordMovementAsync(SALE, ...)`, creates `TransactionItem` with name/price snapshot
  4. Computes VAT-inclusive totals (12% Philippine VAT)
  5. Calculates change = `AmountTendered − TotalAmount`
  6. Commits DB transaction
- **VoidTransactionAsync** (ACID): Calls `RecordMovementAsync(VOID_RESTORE, ...)` for each item; sets Status = "Voided"
- **GetTransactionByIdAsync**: Role-gated — Cashiers see own transactions only

### UserService
- **CreateUserAsync**: Validates unique email; SuperAdmin restriction (only SA can create SA); default password `TradeMatrix2024!`
- **UpdateUserAsync**: Validates email uniqueness; prevents non-SA assigning SA role
- **DeleteUserAsync**: Prevents self-deletion
- **UnlockUserAsync**: Resets `FailedLoginAttempts = 0`, clears `LockoutUntil`
- **ArchiveUserAsync**: Prevents self-archival; sets `IsActive = false, IsArchived = true`

---

## 7. BACKEND — INFRASTRUCTURE

### Program.cs — DI Registration (all Scoped unless noted)
```
IPasswordHashingService, IUserService, IRoleService, ISystemService
IDatabaseService, IAuditService, IInventoryService, IStockMovementService
ITransactionService, IProcurementService, IHRService, ICustomerService
IFinanceService, IDashboardService, IAuthService
IAmazonS3 (Singleton)
IS3StorageService (Scoped)
```

### Middleware Pipeline (order is critical)
```
1. Health check endpoint        GET /api/health-check (anonymous)
2. GlobalExceptionHandlingMiddleware
3. HTTPS redirection            (production only)
4. Security headers             CSP, X-Content-Type-Options, X-Frame-Options
5. Static files (wwwroot/)      dev: no-cache; prod: default with content-hash
6. Routing
7. CORS
8. Authentication
9. Authorization
10. Controller endpoints
11. SPA fallback                MapFallbackToFile("index.html")
```

### GlobalExceptionHandlingMiddleware
- Catches all unhandled exceptions
- `ArgumentException` → 400, `UnauthorizedAccessException` → 401, all else → 500
- Returns `{ Message, ErrorCode, Timestamp }` JSON

### AuditLogAttribute (Global Action Filter)
- Applied to all controllers via `AddControllers(opts => opts.Filters.Add(...))` in Program.cs
- Logs POST, PUT, PATCH, DELETE; also logs `/api/audit` and `/api/database/backup` GETs
- Skips all other GETs
- Extracts actor from JWT claims, IP from HttpContext.Connection
- Severity: exception → Critical; 401/403 → High; 4xx → Medium; 2xx → Low

### Security Headers (CSP)
```
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: blob:
      https://*.s3.us-east-1.amazonaws.com
      https://*.s3.ap-southeast-1.amazonaws.com
connect-src 'self'
frame-ancestors 'none'
```

### JWT Claims
| Claim Key | Value |
|-----------|-------|
| sub | userId |
| jti | GUID |
| nameid | userId |
| id | userId |
| Role | role name string |
| Email | user email |
| Name | user display name |

---

## 8. FRONTEND — ROUTING & AUTH

### Route Table (App.tsx)

| Path | Component | Allowed Roles |
|------|-----------|---------------|
| `/login` | LoginPage | — (public) |
| `/dashboard` | Dashboard | All authenticated |
| `/pos` | POS | Manager, Cashier |
| `/sales` | SalesHistory | Manager |
| `/inventory` | Inventory | Manager, Cashier, InventoryClerk |
| `/procurement` | Procurement | Manager, InventoryClerk |
| `/hr` | HR | Manager |
| `/finance` | Finance | Manager |
| `/crm` | CRM | Manager, Cashier |
| `/admin/users` | UserManagement | SuperAdmin |
| `/admin/roles` | RoleManagement | SuperAdmin |
| `/admin/roles/edit/:roleName` | RolePermissionsEditor | SuperAdmin |
| `/admin/database` | DatabaseAdmin | SuperAdmin |
| `/admin/security` | Security | SuperAdmin |
| `/admin/archive` | Archive | SuperAdmin |
| `/unauthorized` | Unauthorized | — |

### Auth Flow

```
App mount → GET /auth/profile (using localStorage token)
  ├── Success: set isLoggedIn=true, currentRole from localStorage
  └── Fail (401): clear storage → show LoginPage

LoginPage → POST /auth/login { email, password }
  └── Success: store { token, user } in localStorage → role-based redirect:
        SuperAdmin → /admin/users
        Manager   → /dashboard
        Cashier   → /pos
        InvClerk  → /inventory

Logout → clear localStorage → reset theme → redirect /login

401 on any API call → axios interceptor clears auth → redirect /login
  (except /auth/verify-password and /auth/login which legitimately return 401)
```

### Role Enum (types.ts)
```typescript
enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  MANAGER     = 'Manager',
  CASHIER     = 'Cashier',
  INV_CLERK   = 'InventoryClerk'
}
```

### Axios Instance (lib/axios.ts)
- Base URL: `/api`
- Request interceptor: attaches `Authorization: Bearer {token}`
- Response interceptor: 401 → clear auth and navigate to `/login`
- **NEVER set `Content-Type: multipart/form-data` manually** — breaks FormData boundary

---

## 9. FRONTEND — MODULES

### Auth Module (`features/auth/`)
- `LoginPage.tsx`: Split-screen layout (branding left, form right)
- `LoginForm.tsx`: Controlled form; role-based post-login navigation

### Dashboard Module (`features/dashboard/`)
- `Dashboard.tsx`: Single component with 4 role-conditional views:
  - **SuperAdmin**: System status card, infrastructure area chart, recent critical events
  - **Manager**: Monthly expenses, weekly bar chart, expense category pie chart
  - **Cashier**: Today's revenue, items sold, recent 5 transactions, quick-action buttons
  - **InventoryClerk**: Low-stock alerts, pending deliveries, incoming PO table with ETA
- `dashboardService.ts`: Single `getDashboardSummary()` call

### POS Module (`features/pos/`)
**`POS.tsx`** (~900 lines):
- Left panel: product search + barcode scanner + category tabs + grid/list toggle + product cards
- Right panel: cart, VAT breakdown, payment method, amount tendered, quick amount buttons, process button
- Keyboard shortcuts: F2 → focus search, Esc → clear search
- Barcode scanning: On Enter, tries local product match first, falls back to `/inventory/products/lookup/{code}`
- Void item and Clear Cart both require `AuthConfirmationModal` re-authentication
- Receipt modal shown after successful transaction
- VAT: 12% VAT-inclusive (`vatableSales = total / 1.12`)
- Non-cash payments treated as exact (no change calculation)

**`SalesHistory.tsx`**:
- Date-range filtered transaction list (default: last 30 days)
- View receipt modal, void transaction (Manager only)
- Metrics computed from filtered results: total sales, count, items sold, avg order

**`posService.ts`**: Maps ProductDto → Product, wraps all transaction API calls

### Inventory Module (`features/inventory/`)
**`Inventory.tsx`** (~900 lines):
- Filters: text search, category dropdown, stock status
- DataTable with Radix DropdownMenu actions per row:
  - All roles: View Details, Movement History
  - canEdit (non-Cashier): Edit, Stock Movement, Delete
- Modals: Add Product, Edit Product, View Detail, Delete Confirm, Stock Movement, Movement History
- Stock movement types: STOCK_IN, WASTE, ADJUSTMENT
- Image upload via `<input type="file">` → FormData → POST (no explicit Content-Type)
- QR code label: 60mm × 40mm print with SKU, name, price, QR code (encoded SKU)
- CSV export: SKU, Name, Category, Cost, Price, Stock, ReorderLevel, Unit, Supplier
- Inline supplier creation from within the Add Product modal
- `numVal` helper: converts 0 → "" so numeric inputs show placeholder not "0"
- `selectOnFocus` helper: auto-selects input text on click for easy overwrite

**`inventoryService.ts`**: Covers all 12 inventory endpoints including image upload/delete

### Procurement Module (`features/procurement/`)
**`Procurement.tsx`**:
- Supplier CRUD (Manager only sees Add/Edit buttons)
- PO creation with supplier + expected delivery date
- Receive PO button (triggers stock increment via backend)
- PO status flow: Pending → Received
- Note: PO items not editable from UI (items array sent as empty from frontend; backend creates PO with no items unless passed)

**`procurementService.ts`**: All supplier and PO API calls

### HR Module (`features/hr/`)
**`HR.tsx`** (tab-based):
- **Employees tab**: CRUD with avatar display; fields: firstName, lastName, email, contact, department, position, employmentStatus, basicSalary, hireDate
- **Attendance tab**: Log daily attendance; date filter; fields: employeeId, timeIn, timeOut, status (Present/Absent/Late/On Leave), remarks
- **Payroll tab**: Run payroll (Manager); list records; fields show basic, gross, deductions, net, status

**`hrService.ts`**: Employee, attendance, and payroll API calls

### Finance Module (`features/finance/`)
**`Finance.tsx`**:
- Monthly expense total card
- Expense CRUD: category, description, amount, date, status (Paid/Pending)
- Categories: Utilities, Rent, Payroll, Inventory, Office Supplies, Maintenance, Marketing, Other
- View receipt modal; edit dialog

**`financeService.ts`**: All 4 finance endpoints

### CRM Module (`features/crm/`)
**`CRM.tsx`**:
- Customer CRUD (Manager + Cashier can edit)
- Customer types: Retail, Wholesale, Corporate
- Loyalty Points displayed; incremented manually through edit

**`customerService.ts`**: getCustomers, createCustomer, updateCustomer

### Admin Module (`features/admin/`)

**`UserManagement.tsx`**:
- Paginated user list with search + role + archive filters
- Actions: Edit, Archive/Restore (requires auth modal), Unlock, Reset Password
- Default password on create: `TradeMatrix2024!`
- Cannot edit/archive own account; protected SuperAdmin users show "Protected" badge

**`RoleManagement.tsx`**:
- Grid/List view toggle
- Create custom role (requires auth), edit permissions (navigate to editor), archive/restore, delete
- System roles: cannot be renamed, archived, or deleted

**`RolePermissionsEditor.tsx`**:
- Loaded via `/admin/roles/edit/:roleName`
- Visual permission checkboxes from `ALL_PERMISSIONS` array

**`DatabaseAdmin.tsx`**:
- DB status, health, migration count, user statistics
- Actions (all require password auth): Run Migrations, Export Users, Request Backup

**`Security.tsx`** (Audit Logs):
- Searchable, filterable audit log table
- View metadata details; CSV export

**`Archive.tsx`**:
- Shows archived users and roles; restore buttons

---

## 10. FRONTEND — SHARED COMPONENTS

### UI Primitives (`components/ui/`)

| Component | Source | Variants / Notes |
|-----------|--------|------------------|
| Button | cva | default, destructive, outline, secondary, ghost, link |
| Badge | cva | default, secondary, destructive, outline, success, warning, neutral |
| Card | — | Card, CardHeader, CardTitle, CardContent, CardFooter |
| Dialog | Radix | DialogContent, DialogHeader, DialogTitle, DialogDescription |
| Input | — | Standard HTML input wrapper |
| Label | Radix | — |
| Select | Radix | Select, SelectTrigger, SelectContent, SelectItem |
| Table | — | Table, TableHeader, TableBody, TableRow, TableCell, TableHead |
| DataTable | TanStack | Sorting, pagination, column visibility |
| Tabs | Radix | Tabs, TabsList, TabsTrigger, TabsContent |
| Pagination | — | Page navigation |
| Skeleton | — | Loading placeholder |
| StatusDot | — | Colored dot with optional label |
| Field | — | Label + Input wrapper |
| Avatar | Radix | — |
| DropdownMenu | Radix | DropdownMenu, Trigger, Content, Item, Separator |
| Separator | Radix | — |

### Common Components (`components/common/`)

| Component | Purpose |
|-----------|---------|
| AuthConfirmationModal | Password re-auth for sensitive POS/admin actions |
| ProtectedRoute | Role-based route guard (redirects unauthorized users) |
| ErrorBoundary | React class component; catches render errors, shows reload UI |
| LoadingScreen | Full-screen overlay with animated spinner + theme-aware logo |
| LogoutConfirmation | Confirm dialog before logging out |
| PageTitle | Updates `document.title` on route change |
| Unauthorized | 403 page shown for role-mismatched routes |

### Hooks (`hooks/`)

| Hook | Purpose |
|------|---------|
| useSort | Memoized sort state (key, asc/desc/null) with cyclic toggle |

### Utilities (`lib/`)

| File | Purpose |
|------|---------|
| axios.ts | Configured Axios instance with auth interceptors |
| utils.ts | `cn()` = clsx + tailwind-merge for conditional classes |

---

## 11. SECURITY MODEL

### RBAC (Role-Based Access Control)

| Role | Access |
|------|--------|
| SuperAdmin | All admin functions; user/role management; audit logs; DB admin; can see all data |
| Manager | Dashboard + POS + Sales + Inventory + Procurement + HR + Finance + CRM |
| Cashier | Dashboard + POS + CRM + Inventory (read only) |
| InventoryClerk | Dashboard + Inventory (full) + Procurement |

**Enforcement is dual-layer:**
1. Backend: `[Authorize(Roles = "...")]` on controllers and endpoints
2. Frontend: `ProtectedRoute` with `allowedRoles` prop; `canEdit` flags per module
3. Service-level: `GetTransactionByIdAsync` enforces cashier-own-only visibility

### Account Security
- **Lockout**: `FailedLoginAttempts` tracked; `LockoutUntil` disables account after repeated failures
- **Unlock**: SuperAdmin manually unlocks via `/api/Users/{id}/unlock`
- **Password reset**: SuperAdmin resets without knowing current password
- **Token expiry**: 60 min production, 24h dev
- **Re-authentication**: Sensitive POS actions (void, clear cart) and all admin destructive actions require password re-entry via `AuthConfirmationModal`

### Password Security
- PBKDF2-SHA1, 10,000 iterations, 128-bit random salt per password
- Constant-time comparison prevents timing attacks
- Default password for new accounts: `TradeMatrix2024!` (must be changed on first use)

### Data Protection
- `TransactionItem.ProductName` and `TransactionItem.UnitPrice` are **snapshots** — immutable at time of sale
- `Transactions` and `AuditLogs` are **append-only** — never deleted
- Soft-delete on Users, Roles, Products via `IsArchived`/`IsActive`

---

## 12. DATA FLOWS

### POS Sale Transaction
```
User selects products → Cart in React state
  → POST /api/Transaction { paymentMethod, amountTendered, items: [{productId, qty}] }
    → TransactionController extracts cashierId, cashierName from JWT
      → TransactionService.CreateTransactionAsync (DB transaction)
        → Validates all products exist + stock sufficient
        → Generates TRX-YYYYMMDD-XXXX number
        → For each item:
            StockMovementService.RecordMovementAsync(SALE) → decrements Product.Stock
            Creates TransactionItem (name + price snapshot)
        → Computes VAT-inclusive totals
        → Commits DB transaction
      → Returns TransactionDto
    → Frontend shows receipt modal
    → Cart cleared, products reloaded
```

### Void Transaction
```
Manager clicks Void → PATCH /api/Transaction/{id}/void
  → TransactionService.VoidTransactionAsync (DB transaction)
    → For each TransactionItem:
        StockMovementService.RecordMovementAsync(VOID_RESTORE) → restores Product.Stock
    → Transaction.Status = "Voided"
    → Commits
  → Frontend updates list
```

### Receive Purchase Order
```
Manager clicks Receive PO → POST /api/Procurement/purchase-orders/{id}/receive
  → ProcurementService.ReceivePurchaseOrderAsync
    → For each PO item:
        StockMovementService.RecordMovementAsync(STOCK_IN, ref=PONumber, cost=UnitCost)
    → PO.Status = "Received", ReceivedDate, ReceivedBy set
  → Frontend reloads POs
```

### Product Image Upload
```
User selects image → FormData (no explicit Content-Type)
  → POST /api/Inventory/products/{id}/upload-image
    → Controller validates: type (JPEG/PNG/WebP/GIF), size (≤5MB)
    → If old ImageUrl exists: S3StorageService.DeleteFileAsync(oldUrl)
    → S3StorageService.UploadFileAsync → key = products/{GUID}_{filename}
    → InventoryService.UpdateProductImageAsync(id, fullS3Url)
  → Product.ImageUrl = full S3 URL
  → Frontend displays image
```

### Stock Movement (Manual)
```
Manager/InvClerk opens Stock Movement dialog
  → POST /api/Inventory/products/{id}/stock-movements
    → StockMovementService.RecordMovementAsync
      → Atomically updates Product.Stock in same SaveChanges
      → Creates StockMovement record with type, notes, reference, costPrice
```

### Payroll Run
```
Manager clicks Run Payroll with date range
  → POST /api/Payroll/run { payPeriodStart, payPeriodEnd }
    → HRService.RunPayrollAsync
      → For each active employee:
          Creates PayrollRecord { BasicSalary, GrossPay=BasicSalary, Deductions=0, NetPay=BasicSalary }
          Status = "Pending"
  → Frontend reloads payroll records
```

---

## 13. KNOWN ISSUES & INCONSISTENCIES

These are confirmed code-level issues found during the audit. They do not necessarily crash the system but represent gaps, inconsistencies, or technical debt.

### Backend Issues

**B-001 — ProcurementController returns entity instead of DTO on PO creation**
- **Location**: `ProcurementController.cs` → `POST /procurement/purchase-orders`
- **Issue**: Method returns `ApiResponse<PurchaseOrder>` (entity) instead of `ApiResponse<PurchaseOrderDto>` — violates the DTO abstraction layer; exposes internal navigation properties and potential null reference issues
- **Impact**: Medium — frontend may receive unexpected shape; potential serialization issues with circular references if navigation properties are loaded
- **Fix**: Change `CreatePurchaseOrderAsync` return type in service and controller to `PurchaseOrderDto`

**B-002 — UsersController.GetUser returns unwrapped DTO**
- **Location**: `UsersController.cs` → `GET /api/Users/{id}`
- **Issue**: Returns `UserDetailDto` directly, not wrapped in `ApiResponse<UserDetailDto>` — all other endpoints use ApiResponse wrapper
- **Impact**: Low — frontend must handle this endpoint differently
- **Fix**: Wrap response in `ApiResponse<UserDetailDto>.SuccessResponse(result)`

**B-003 — Payroll deductions not implemented**
- **Location**: `HRService.cs` → `RunPayrollAsync`
- **Issue**: `TotalDeductions = 0`, `NetPay = BasicSalary`, `GrossPay = BasicSalary` — no SSS, PhilHealth, Pag-IBIG, or income tax deductions computed
- **Impact**: High (business logic) — payroll records are inaccurate for any real-world use
- **Fix**: Implement Philippine mandatory deductions (SSS, PhilHealth, Pag-IBIG) based on salary brackets

**B-004 — Attendance duplicate prevention not enforced at service layer**
- **Location**: `HRService.cs` → `LogAttendanceAsync`
- **Issue**: The composite index on `{EmployeeId, Date}` exists in the DB schema but there is no service-level check before inserting — a duplicate will throw a DB exception caught by middleware, returning a generic 500 rather than a meaningful 400
- **Impact**: Medium — poor UX; error message is opaque
- **Fix**: Check `context.Attendances.AnyAsync(a => a.EmployeeId == dto.EmployeeId && a.Date == dto.Date)` before inserting; throw `ArgumentException` with meaningful message

**B-005 — SystemController.GetSettings has no try-catch**
- **Location**: `SystemController.cs` → `GET /api/System/settings`
- **Issue**: Only endpoint across all controllers without a try-catch; exception falls through to GlobalExceptionMiddleware (functional, but inconsistent)
- **Impact**: Low — middleware handles it, but inconsistent pattern
- **Fix**: Wrap in try-catch like all other controller endpoints

**B-006 — DatabaseController.backup/request returns hardcoded response**
- **Location**: `DatabaseController.cs` → `POST /api/Database/backup/request`
- **Issue**: Returns a static object describing MonsterASP.NET's built-in backup policy — no actual backup is triggered; the endpoint name is misleading
- **Impact**: Low — UI clearly shows "backup policy info"; but the endpoint is confusing if API is consumed externally

**B-007 — AuditController only returns 500 records**
- **Location**: `AuditService.cs` → `GetLogsAsync`
- **Issue**: Hard-coded `.Take(500)` on audit log retrieval — no pagination, no date range filtering
- **Impact**: Medium — in production with heavy usage, logs older than 500 records are inaccessible
- **Fix**: Add pagination + date range parameters to the audit log endpoint

**B-008 — No account lockout logic in AuthService**
- **Location**: `AuthService.cs` → `LoginAsync`
- **Issue**: `FailedLoginAttempts` field exists in the model and is reset on successful login, but it is **never incremented** on failed login, and `LockoutUntil` is never set — the lockout system is inactive
- **Impact**: High (security) — brute-force login is currently unprotected
- **Fix**: Increment `FailedLoginAttempts` on failed login; set `LockoutUntil = UtcNow.AddMinutes(15)` after N failures (e.g., 5); check lockout before validating password

**B-009 — PO items not sent from frontend**
- **Location**: `Procurement.tsx` → `handleCreatePO`
- **Issue**: Creates PO with `items: []` — the PO has a total of ₱0.00 and no items; the backend service accepts and persists this empty PO
- **Impact**: Medium — POs are functionally useless without line items; the Receive PO flow processes zero stock increments
- **Fix (frontend)**: Add PO line item input form allowing selection of products and quantities before save

**B-010 — JWT claim extraction repeated verbatim across 4 controllers**
- **Location**: AuthController, InventoryController, TransactionController, ProcurementController
- **Issue**: Each controller has its own inline multi-fallback claim extraction code for user ID and name — duplicated logic
- **Impact**: Low (maintainability) — any change to claim structure requires updates in 4 places
- **Fix**: Extract to a shared `ClaimsPrincipalExtensions` helper or base controller class

### Frontend Issues

**F-001 — window.alert() used for all error messages**
- **Location**: System-wide (all feature pages)
- **Issue**: `window.alert()` is used for error and success feedback — blocks UI thread, looks unprofessional, not dismissible automatically
- **Impact**: Low-Medium (UX)
- **Fix**: Replace with a toast notification system (e.g., Sonner/react-hot-toast)

**F-002 — Silent error handling in supplier save**
- **Location**: `Procurement.tsx` → `handleSaveSupplier` catch block
- **Issue**: Errors on supplier creation only `console.error` — user sees nothing, modal stays open
- **Impact**: Medium — user has no feedback on failure (400 from missing required fields, 409 duplicate, 500 from DB, etc.)
- **Fix**: Display error message inside the modal or use a toast notification

**F-003 — Procurement page Add Supplier button hidden from InventoryClerk**
- **Location**: `Procurement.tsx`
- **Issue**: The "Add New Supplier" button is only shown for `currentRole === UserRole.MANAGER`, but the backend endpoint `POST /procurement/suppliers` allows `SuperAdmin, Manager, InventoryClerk`
- **Impact**: Low — InventoryClerk cannot add suppliers from the UI despite having API-level permission
- **Fix**: Update button visibility condition to `currentRole !== UserRole.CASHIER` or include InventoryClerk explicitly


**F-005 — No loading state feedback in Procurement PO creation**
- **Location**: `Procurement.tsx`
- **Issue**: `isSaving` state exists but the "Create PO" button does not display a loading spinner or disable state while waiting
- **Impact**: Low — users may click multiple times, creating duplicate POs

**F-006 — DashboardLayout passes onRoleChange but it is never used meaningfully**
- **Location**: `DashboardLayout.tsx`, `App.tsx`
- **Issue**: `onRoleChange` prop is wired but roles are derived from JWT on login and don't change dynamically during a session
- **Impact**: None — dead interface plumbing

**F-007 — LoyaltyPoints in CRM cannot be incremented directly**
- **Location**: `CRM.tsx`, `CustomerController.cs`
- **Issue**: LoyaltyPoints field in the edit form requires manual numeric input — no integration with POS transactions; points are not automatically awarded on sale
- **Impact**: Medium (feature gap) — loyalty program is manual-only
- **Fix (future)**: Wire customer to POS transaction; auto-increment points on sale completion

**F-008 — No validation on HR attendance for duplicate entries (frontend)**
- **Location**: `HR.tsx` → Attendance tab
- **Issue**: No client-side check for duplicate employee+date before submitting; duplicate will cause a DB-level error returned as 500
- **Impact**: Low — poor UX (see also B-004)

---

## 14. FUTURE RISKS & TECHNICAL DEBT

### Security Risks

| Risk | Severity | Details |
|------|---------|---------|
| Brute-force login (B-008) | **High** | Account lockout fields exist but are never set on failed login — accounts can be brute-forced indefinitely |
| JWT in localStorage | Medium | XSS could steal tokens; httpOnly cookie storage would be more secure |
| No rate limiting | Medium | Login and public endpoints have no rate limiting — DoS or brute-force possible |
| Default password not force-changed | Medium | `TradeMatrix2024!` is the default for all new users; no enforced first-login password change exists |
| CSP `unsafe-inline` for scripts | Medium | `script-src 'unsafe-inline'` allows inline script injection if XSS occurs; ideally replaced with nonces |
| `appsettings.Production.json` in publish output | Low | If the deploy folder is accidentally exposed (misconfigured IIS), credentials could leak — no secret manager used |

### Data Integrity Risks

| Risk | Severity | Details |
|------|---------|---------|
| Payroll deductions = 0 (B-003) | **High** | All payroll records store NetPay = BasicSalary; any reporting or export will show fabricated figures |
| PO created with no items (B-009) | Medium | Empty POs exist in the DB; Receive PO has no effect; history is polluted |
| Attendance duplicates (B-004) | Medium | DB constraint exists but service doesn't pre-check — silent 500 on conflict |
| No stock floor check on manual ADJUSTMENT movements | Medium | ADJUSTMENT type allows negative quantities that could drive `Product.Stock` below 0 |
| TransactionItem references ProductId but Product can be soft-deleted | Low | If a product is deactivated, TransactionItem still holds a FK; historical reporting works only because ProductName is a snapshot |
| No orphan cleanup on S3 on product delete | Low | `DeleteProductAsync` soft-deletes only — `Product.ImageUrl` is set to retain, but if a product is hard-deleted via DB tools, the S3 file becomes an orphan |

### Scalability Risks

| Risk | Severity | Details |
|------|---------|---------|
| Dashboard runs 10+ DB queries synchronously per page load | Medium | `DashboardService.GetSummaryAsync` issues 10+ individual queries sequentially; slow under load |
| Audit log `.Take(500)` with no pagination (B-007) | Medium | High-volume use will make older audit records inaccessible |
| `transactions?pageSize=500` in SalesHistory | Medium | Frontend requests up to 500 transactions in one API call with no server-side pagination enforcement |
| No caching anywhere | Low | All queries hit SQL Server on every request; no Redis/in-memory cache for static data (products, roles, settings) |
| Single database, no read replicas | Low | All reads and writes go to the same SQL Server instance — heavy reporting queries can block POS transactions |
| IIS only, no horizontal scaling | Low | Current hosting is single-node IIS; no load balancer or stateless session design issues (JWT is stateless, so this is manageable) |

### Maintainability / Technical Debt

| Item | Priority | Details |
|------|---------|---------|
| Duplicate JWT claim extraction code (B-010) | Medium | 4 controllers extract user ID independently — DRY violation |
| `window.alert()` for all user feedback (F-001) | Medium | Should migrate to toast notifications |
| No unit tests on services | Medium | No test coverage for business logic (PayrollService, TransactionService, StockMovementService) |
| PO line item flow incomplete (B-009) | Medium | POs store ₱0 and no items — core procurement workflow is non-functional end-to-end |
| Loyalty points not integrated with POS (F-007) | Low | CRM loyalty is a manual field, not an automated reward |
| No email service (password reset token exists but no sender) | Low | `PasswordResetToken` and `PasswordResetExpiry` fields exist on User but no email delivery is implemented — the self-service reset flow is blocked |
| No API versioning | Low | All endpoints at `/api/{controller}` — any breaking change requires coordinated frontend + backend deploy |
| `'unsafe-inline'` in CSP | Low | Ideally migrate to nonce-based CSP as security hardening |
| Recharts + TanStack + Radix = large bundle | Low | Current `index.js` bundle is 1.14MB minified (320KB gzip) — may impact initial load on mobile; code splitting could help |

---

## 15. FILE INDEX

### Backend

```
backend/TradeMatrix.Server/
├── Program.cs                          DI, middleware pipeline, JWT, S3 config, CORS, CSP
├── web.config                          IIS config (inprocess, 100MB upload limit)
├── appsettings.json                    Base config structure
├── appsettings.Development.json        Local dev secrets (local DB, dev JWT key)
├── appsettings.Production.json         Production secrets (remote DB, prod JWT key, AWS keys)
│
├── Controllers/
│   ├── AuthController.cs               Login, profile, verify-password
│   ├── AuditController.cs              Audit log reads (SuperAdmin)
│   ├── CustomerController.cs           Customer CRUD
│   ├── DashboardController.cs          Role-adaptive summary
│   ├── DatabaseController.cs           DB info, health, migrations, export (SuperAdmin)
│   ├── FinanceController.cs            Expense CRUD + monthly summary
│   ├── HRController.cs                 Employee + attendance CRUD
│   ├── InventoryController.cs          Product CRUD + stock movements + S3 images
│   ├── PayrollController.cs            Payroll records + run payroll
│   ├── ProcurementController.cs        Supplier CRUD + PO create/receive
│   ├── RolesController.cs              Role CRUD + archive/restore (SuperAdmin)
│   ├── SystemController.cs             System settings key-value (SuperAdmin)
│   ├── TransactionController.cs        POS transaction create/list/void
│   └── UsersController.cs              User CRUD + account management (SuperAdmin)
│
├── Services/
│   ├── IAuditService.cs / AuditService.cs
│   ├── IAuthService.cs / AuthService.cs
│   ├── ICustomerService.cs / CustomerService.cs
│   ├── IDashboardService.cs / DashboardService.cs
│   ├── IDatabaseService.cs / DatabaseService.cs
│   ├── IFinanceService.cs / FinanceService.cs
│   ├── IHRService.cs / HRService.cs
│   ├── IInventoryService.cs / InventoryService.cs
│   ├── IPasswordHashingService.cs / PasswordHashingService.cs
│   ├── IProcurementService.cs / ProcurementService.cs
│   ├── IRoleService.cs / RoleService.cs
│   ├── IS3StorageService.cs (inline) / S3StorageService.cs
│   ├── IStockMovementService.cs / StockMovementService.cs
│   ├── ISystemService.cs / SystemService.cs
│   ├── ITransactionService.cs / TransactionService.cs
│   └── IUserService.cs / UserService.cs
│
├── Models/
│   ├── User.cs, Role.cs, SystemSetting.cs, AuditLog.cs
│   ├── Product.cs, Supplier.cs, PurchaseOrder.cs, PurchaseOrderItem.cs
│   ├── Transaction.cs, TransactionItem.cs
│   ├── Employee.cs, Attendance.cs, PayrollRecord.cs
│   ├── Customer.cs, Expense.cs, StockMovement.cs
│
├── DTOs/
│   ├── ApiResponse.cs                  Generic ApiResponse<T> + PaginatedResponse<T>
│   ├── LoginDto.cs                     AuthResultDto, UserProfileDto, VerifyPasswordDto
│   ├── UserDtos.cs                     UserDto, UserDetailDto, CreateUserDto, UpdateUserDto, ResetPasswordDto
│   ├── RoleDtos.cs                     RoleDto, CreateRoleDto, UpdateRoleDto
│   ├── InventoryDtos.cs                ProductDto, CreateProductDto
│   ├── StockMovementDtos.cs            StockMovementDto, CreateStockMovementDto, StockMovementSummaryDto
│   ├── ProcurementDtos.cs              SupplierDto, CreateSupplierDto, PurchaseOrderDto, CreatePODto
│   ├── TransactionDtos.cs              TransactionDto, TransactionItemDto, CreateTransactionDto, CreateTransactionItemDto
│   ├── HRDtos.cs                       EmployeeDto, CreateEmployeeDto, AttendanceDto, LogAttendanceDto, PayrollRecordDto, RunPayrollDto
│   ├── FinanceDtos.cs                  ExpenseDto, CreateExpenseDto
│   ├── CRMDtos.cs                      CustomerDto, CreateCustomerDto
│   ├── DashboardDtos.cs                DashboardSummaryDto and all sub-DTOs
│   ├── DatabaseDtos.cs                 DatabaseInfoDto, DatabaseStatisticsDto, DatabaseHealthDto, ConnectionInfoDto
│   ├── SystemDtos.cs                   UpdateSettingDto
│   └── AuditLogDto.cs                  AuditLogDto (with Metadata as Dictionary)
│
├── Data/
│   └── ApplicationDbContext.cs         EF Core context: DbSets, OnModelCreating (relationships, indexes, decimal precision)
│
├── Filters/
│   └── AuditLogAttribute.cs            Global action filter: logs all mutations to AuditLogs
│
├── Middleware/
│   └── GlobalExceptionHandlingMiddleware.cs    Catches unhandled exceptions → standardized error JSON
│
├── Migrations/
│   └── [10 migration files + Designer + Snapshot]
│
└── wwwroot/                            Frontend build output (managed by Vite — do not edit)
```

### Frontend

```
frontend/src/
├── App.tsx                             Root component: routing, auth state, role management
├── types.ts                            UserRole enum, shared interfaces (User, Product, CartItem, etc.)
├── globals.css                         Tailwind base + custom CSS
├── index.tsx                           React DOM root
├── vite-env.d.ts                       Vite type declarations
│
├── lib/
│   ├── axios.ts                        Configured Axios instance with auth + 401 interceptors
│   └── utils.ts                        cn() utility (clsx + tailwind-merge)
│
├── hooks/
│   └── useSort.ts                      Memoized sort state hook (key + asc/desc cycling)
│
├── components/
│   ├── ui/                             Reusable UI primitives (shadcn/ui pattern)
│   │   ├── Button.tsx, Badge.tsx, Card.tsx, Dialog.tsx
│   │   ├── Input.tsx, Label.tsx, Select.tsx, Tabs.tsx
│   │   ├── Table.tsx, data-table.tsx, Pagination.tsx
│   │   ├── Skeleton.tsx, StatusDot.tsx, Field.tsx
│   │   ├── Avatar.tsx, DropdownMenu.tsx, Separator.tsx
│   ├── common/
│   │   ├── AuthConfirmationModal.tsx   Password re-auth modal
│   │   ├── ProtectedRoute.tsx          Role-based route guard
│   │   ├── ErrorBoundary.tsx           React error boundary
│   │   ├── LoadingScreen.tsx           Full-screen spinner overlay
│   │   ├── LogoutConfirmation.tsx      Logout confirm dialog
│   │   ├── PageTitle.tsx               document.title updater
│   │   └── Unauthorized.tsx            403 forbidden page
│   ├── layouts/
│   │   └── DashboardLayout.tsx         Sidebar + header + outlet layout
│   ├── providers/
│   │   └── ThemeProvider.tsx           Dark/light mode context
│   └── Sidebar.tsx                     Role-adaptive navigation sidebar
│
├── features/
│   ├── auth/pages/LoginPage.tsx        Login page + LoginForm
│   ├── dashboard/
│   │   ├── pages/Dashboard.tsx         Role-adaptive dashboard
│   │   └── services/dashboardService.ts
│   ├── pos/
│   │   ├── pages/POS.tsx               Main POS terminal (~900 lines)
│   │   ├── pages/SalesHistory.tsx      Sales history + void
│   │   └── services/posService.ts
│   ├── inventory/
│   │   ├── pages/Inventory.tsx         Product management (~900 lines)
│   │   └── services/inventoryService.ts
│   ├── procurement/
│   │   ├── pages/Procurement.tsx       Supplier + PO management
│   │   └── services/procurementService.ts
│   ├── hr/
│   │   ├── pages/HR.tsx                Employees + attendance + payroll (tabs)
│   │   └── services/hrService.ts
│   ├── finance/
│   │   ├── pages/Finance.tsx           Expense tracking
│   │   └── services/financeService.ts
│   ├── crm/
│   │   ├── pages/CRM.tsx               Customer management
│   │   └── services/customerService.ts
│   └── admin/
│       ├── pages/UserManagement.tsx
│       ├── pages/RoleManagement.tsx
│       ├── pages/RolePermissionsEditor.tsx
│       ├── pages/DatabaseAdmin.tsx
│       ├── pages/Security.tsx
│       ├── pages/Archive.tsx
│       └── services/adminService.ts
│
└── [config files]
    ├── vite.config.ts                  Output → ../backend/wwwroot; dev proxy → :5009; port 4000
    ├── tailwind.config.js              Content paths, dark mode: class
    ├── tsconfig.json                   Strict mode off; path aliases @, @features, @components, @lib
    ├── package.json                    Dependencies + scripts
    └── vitest.setup.ts                 Test setup
```

---

*End of TradeMatrix MIS Reference Document — March 8, 2026*
