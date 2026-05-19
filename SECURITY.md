# Security Documentation
## TradeMatrix Information System (TMIS)

**Course:** IT 16/L – Information Security 1  
**Prepared by:** [Your Name]  
**Submitted to:** Cyril Loyd Tomas  
**Date:** May 19, 2026

---

## Table of Contents

1. [System Description](#1-system-description)
2. [Platform and Technologies Used](#2-platform-and-technologies-used)
3. [Security Policies](#3-security-policies)
4. [Incident Response Plan](#4-incident-response-plan)
5. [Code Auditing and Security Review](#5-code-auditing-and-security-review)
6. [Access Control (RBAC)](#6-access-control-rbac)
7. [Security Findings and Remediation Tracker](#7-security-findings-and-remediation-tracker)

---

## 1. System Description

TradeMatrix Information System (TMIS) is a full-stack enterprise resource planning (ERP) web application designed to manage and monitor the core business operations of a trading company. It enables authorized users to perform operations across multiple modules — point-of-sale transactions, inventory management, procurement, human resources, customer relationship management (CRM), finance, and reporting — while enforcing data security through role-based access control, audit logging, and authentication policies.

The system is built as a Single Page Application (SPA) with a RESTful API backend. All data access is gated behind JWT authentication and role-based authorization enforced at the API layer.

---

## 2. Platform and Technologies Used

| Category              | Technology                                      |
|-----------------------|-------------------------------------------------|
| Programming Language  | C# (.NET 8), TypeScript                         |
| Backend Framework     | ASP.NET Core 8 Web API                          |
| Frontend Framework    | React 18 (Vite + TypeScript)                    |
| Database              | Microsoft SQL Server (via Entity Framework Core)|
| ORM                   | Entity Framework Core 8                         |
| Authentication        | JWT Bearer Tokens (HMAC-SHA256)                 |
| Password Hashing      | PBKDF2 with SHA-256, 100,000 iterations         |
| File Storage          | AWS S3                                          |
| Platform              | Web (SPA + REST API)                            |
| Deployment            | Docker / GitHub Actions CI/CD                   |

---

## 3. Security Policies

### 3.1 Password Policy

**Status: ✅ Implemented**

| Rule                              | Implementation                                                                                     |
|-----------------------------------|----------------------------------------------------------------------------------------------------|
| Minimum length                    | 8 characters enforced in `ChangePasswordDto` (`[MinLength(8)]`) and `AuthService.ChangePasswordAsync` |
| Input length cap                  | 255-character max on `LoginDto` to prevent DoS via oversized payloads                             |
| Hashing algorithm                 | PBKDF2-SHA256 with 100,000 iterations and a 128-bit random salt (`PasswordHashingService.cs`)     |
| Timing-safe comparison            | `CryptographicOperations.FixedTimeEquals` used to prevent timing attacks during verification      |
| Legacy hash support               | SHA-1 / 10,000-iteration hashes verified for backward compatibility; new hashes always use SHA-256 |
| Forced password change            | `MustChangePassword` flag forces users to change their password on first login                    |
| Admin-initiated reset             | SuperAdmin can reset any user's password via `POST /api/users/{id}/reset-password`                |

**⚠️ Known Gap — To Be Fixed:**
- `CreateUserDto.Password` and `ResetPasswordDto.NewPassword` have **no `[Required]` or `[MinLength]` data annotations**. Password complexity rules (uppercase, lowercase, digit, symbol) are not enforced server-side beyond minimum length.

```
// TODO: Add to CreateUserDto and ResetPasswordDto
[Required]
[MinLength(8)]
[RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$",
    ErrorMessage = "Password must contain uppercase, lowercase, digit, and symbol.")]
public string Password { get; set; } = string.Empty;
```

---

### 3.2 Login Attempt / Account Lockout Policy

**Status: ✅ Implemented**

| Rule                              | Implementation                                                                                     |
|-----------------------------------|----------------------------------------------------------------------------------------------------|
| Max failed attempts               | 5 consecutive failures (`MaxFailedAttempts = 5` in `AuthService.cs`)                              |
| Lockout duration                  | 15 minutes (`LockoutDuration = TimeSpan.FromMinutes(15)`)                                         |
| Lockout storage                   | `LockoutUntil` (DateTime) and `FailedLoginAttempts` (int) persisted in the `Users` table          |
| Counter reset on success          | `FailedLoginAttempts` and `LockoutUntil` cleared on successful login                              |
| User enumeration prevention       | Generic `"Invalid email or password"` message returned for all failure cases (wrong password, locked account, non-existent user) |
| Rate limiting on auth endpoints   | `[EnableRateLimiting("AuthEndpoints")]` — 10 requests per 5-minute sliding window per IP          |
| Global rate limiting              | 100 requests per minute per IP (sliding window) applied to all endpoints                          |
| Admin unlock                      | SuperAdmin can manually unlock accounts via `POST /api/users/{id}/unlock`                         |

**⚠️ Known Gap — To Be Fixed:**
- Lockout is bypassed if the correct password is entered while the account is locked. This is an intentional design choice (to prevent attackers from locking out legitimate users), but it should be documented as a deliberate decision.
- No CAPTCHA or progressive delay after repeated failures.

---

### 3.3 Data Handling Policy

**Status: ✅ Mostly Implemented**

| Rule                              | Implementation                                                                                     |
|-----------------------------------|----------------------------------------------------------------------------------------------------|
| Password storage                  | Passwords are never stored in plaintext; PBKDF2-SHA256 hashes stored in `PasswordHash` column     |
| Sensitive data in responses       | `PasswordHash` is never included in any DTO or API response                                       |
| Error message sanitization        | `GlobalExceptionHandlingMiddleware` returns generic error messages; stack traces never sent to client |
| Database parameterization         | Entity Framework Core uses parameterized queries by default — SQL injection is prevented           |
| HTTPS enforcement                 | `UseHttpsRedirection()` enabled in production; HSTS header set (`max-age=31536000; includeSubDomains`) |
| Sensitive file storage            | User-uploaded files stored in AWS S3, not on the local filesystem                                 |

**⚠️ Known Gap — To Be Fixed:**
- JWT tokens are stored in `localStorage`, which is accessible to JavaScript and vulnerable to XSS attacks. Tokens should be migrated to `HttpOnly` cookies.
- `PasswordResetToken` field (if present in the User model) is stored in plaintext. It should be hashed before storage.
- No token revocation mechanism — deactivated or archived users retain valid JWTs until natural expiry.

---

### 3.4 Access Control Policy

**Status: ✅ Implemented**

| Rule                              | Implementation                                                                                     |
|-----------------------------------|----------------------------------------------------------------------------------------------------|
| Authentication required           | All controllers use `[Authorize]` attribute; unauthenticated requests return 401                  |
| Role-based authorization          | `[Authorize(Roles = "SuperAdmin")]` enforced on all admin endpoints (Users, Roles, Database, Security) |
| Frontend route guards             | `ProtectedRoute` component checks `isLoggedIn` and `allowedRoles` before rendering any page       |
| Token validation                  | JWT validated for issuer, audience, lifetime, and signing key on every request                    |
| Clock skew                        | Reduced to 1 minute (`ClockSkew = TimeSpan.FromMinutes(1)`) to limit token replay window          |
| Forced password change gate       | Users with `MustChangePassword = true` are redirected to `/change-password` before accessing any feature |
| Archived/inactive user block      | Login is rejected for archived or inactive accounts even with correct credentials                 |

**⚠️ Known Gap — To Be Fixed:**
- No token revocation list (blacklist). A deactivated user's existing JWT remains valid until it expires (up to 60 minutes by default).
- Frontend role checks are UI-only guards — they are correctly backed by server-side `[Authorize]` attributes, but this should be verified for every new endpoint added.

---

### 3.5 Logging and Monitoring Policy

**Status: ✅ Implemented (with gaps)**

| Rule                              | Implementation                                                                                     |
|-----------------------------------|----------------------------------------------------------------------------------------------------|
| Audit log filter                  | `AuditLogAttribute` (global `IAsyncActionFilter`) logs all non-GET mutations to the database      |
| Logged fields                     | Actor name, actor email, IP address, controller/action, HTTP method, resource path, status, severity, timestamp |
| Severity classification           | Low (success), Medium (4xx), High (401/403), Critical (unhandled exception)                       |
| Structured logging                | `ILogger<T>` used throughout; logs include user ID, email, and action context                     |
| Login failure logging             | Failed login attempts logged via `ILogger.LogWarning` with email                                  |
| Sensitive GET logging             | Audit and database backup endpoints are logged even on GET                                        |

**⚠️ Known Gap — To Be Fixed:**
- Login and logout events are only written to `ILogger` (console/debug output), **not** to the persistent audit database. These are among the most security-critical events and should be stored in the `AuditLogs` table.
- No alerting or automated monitoring on repeated failures or high-severity audit events.
- Log retention policy is not defined.

---

## 4. Incident Response Plan

### 4.1 Detection
Security incidents are identified through:
- Audit log entries with `Severity = "High"` or `"Critical"` in the `AuditLogs` database table
- `ILogger` output (console/application logs) showing repeated failed login attempts or unauthorized access attempts
- HTTP 429 (rate limit exceeded) responses indicating brute-force activity
- Monitoring of the `LockoutUntil` and `FailedLoginAttempts` fields in the `Users` table

### 4.2 Reporting
- Incidents are reported immediately to the system administrator (SuperAdmin role) or the responsible authority
- The SuperAdmin can review audit logs via the `/api/audit` endpoint and the Security admin panel
- Critical incidents (data breach, unauthorized admin access) are escalated to the project owner

### 4.3 Response
Immediate containment actions available in the system:

| Action                        | How                                                                 |
|-------------------------------|---------------------------------------------------------------------|
| Lock a user account           | `PUT /api/users/{id}/archive` or deactivate via User Management UI |
| Unlock a user account         | `POST /api/users/{id}/unlock`                                       |
| Reset a compromised password  | `POST /api/users/{id}/reset-password`                               |
| Review all recent activity    | Audit log viewer in the Security admin panel                        |
| Database backup               | `POST /api/database/backup` (SuperAdmin only)                       |

### 4.4 Recovery
- Restore system functionality from the most recent automated midnight backup (`MidnightBackupService`)
- Verify data integrity by comparing backup checksums
- Re-enable affected user accounts after confirming the threat is contained
- Force password change for all affected accounts (`MustChangePassword = true`)

### 4.5 Review
- Conduct post-incident analysis using the audit log trail
- Identify the root cause (e.g., weak password, missing validation, misconfiguration)
- Update security policies and code as needed
- Document findings and corrective actions taken

---

## 5. Code Auditing and Security Review

### 5.1 Tool Used
- **Visual Studio Code** built-in diagnostics and TypeScript compiler
- **Roslyn Analyzers** (built into .NET SDK) for C# static analysis
- Manual code review against OWASP Top 10 (2021)

### 5.2 Usage
The codebase was reviewed file-by-file against the OWASP Top 10 categories. Each controller, service, middleware, and DTO was inspected for common vulnerability patterns including injection, broken authentication, insecure design, security misconfiguration, and logging failures.

### 5.3 Findings and Fixes

| # | Severity | Category (OWASP)              | Finding                                                                 | Status        |
|---|----------|-------------------------------|-------------------------------------------------------------------------|---------------|
| 1 | High     | A02 – Cryptographic Failures  | JWT stored in `localStorage` — accessible to XSS                       | ⬜ To Fix      |
| 2 | High     | A07 – Auth Failures           | No token revocation — deactivated users keep valid tokens               | ⬜ To Fix      |
| 3 | Medium   | A09 – Logging Failures        | Login/logout events not written to persistent audit DB                  | ⬜ To Fix      |
| 4 | Medium   | A07 – Auth Failures           | `CreateUserDto` and `ResetPasswordDto` lack password complexity rules   | ⬜ To Fix      |
| 5 | Medium   | A02 – Cryptographic Failures  | `PasswordResetToken` stored in plaintext (if used)                      | ⬜ To Fix      |
| 6 | Low      | A05 – Security Misconfiguration | `AllowedHosts: "*"` in `appsettings.json` — should be restricted in production | ⬜ To Fix |
| 7 | Low      | A04 – Insecure Design         | No CAPTCHA or progressive delay after repeated login failures           | ⬜ To Fix      |
| 8 | ✅ Fixed  | A03 – Injection               | EF Core parameterized queries prevent SQL injection                     | ✅ Implemented |
| 9 | ✅ Fixed  | A02 – Cryptographic Failures  | PBKDF2-SHA256 with 100k iterations and timing-safe comparison           | ✅ Implemented |
| 10| ✅ Fixed  | A07 – Auth Failures           | Account lockout after 5 failed attempts, 15-minute duration             | ✅ Implemented |
| 11| ✅ Fixed  | A07 – Auth Failures           | Generic error messages prevent user enumeration                         | ✅ Implemented |
| 12| ✅ Fixed  | A01 – Broken Access Control   | All admin endpoints require `[Authorize(Roles = "SuperAdmin")]`         | ✅ Implemented |
| 13| ✅ Fixed  | A05 – Security Misconfiguration | Security headers: CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy | ✅ Implemented |
| 14| ✅ Fixed  | A05 – Security Misconfiguration | Rate limiting: 10 req/5min on auth, 100 req/min global                 | ✅ Implemented |
| 15| ✅ Fixed  | A09 – Logging Failures        | Global audit filter logs all mutations with actor, IP, severity         | ✅ Implemented |

### 5.4 Proof
> 📸 **[Add screenshots here]**
> - Screenshot of audit log entries in the database / Security admin panel
> - Screenshot of rate limiter returning HTTP 429
> - Screenshot of account lockout behavior
> - Screenshot of security headers in browser DevTools (Network tab → Response Headers)
> - Screenshot of Roslyn analyzer output (no critical warnings)

---

## 6. Access Control (RBAC)

### 6.1 Intended Users

| Role              | Description                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| **SuperAdmin**    | Full system access — manages users, roles, database, audit logs, and system configuration |
| **Manager**       | Operational access — manages sales, HR, finance, procurement, CRM, reports  |
| **Cashier**       | Transaction access — POS, inventory view, CRM                               |
| **Inventory Clerk** | Stock access — inventory and procurement management                       |

### 6.2 Role Enforcement Architecture

Access control is enforced at **two layers**:

1. **Backend (authoritative):** `[Authorize]` and `[Authorize(Roles = "...")]` attributes on every controller and action. The JWT claim `ClaimTypes.Role` is validated on every request.
2. **Frontend (UX layer):** `ProtectedRoute` component checks `isLoggedIn` and `allowedRoles` before rendering. Unauthorized access redirects to `/unauthorized`.

### 6.3 Access Control Matrix

| Feature / Resource          | Unauthenticated | Cashier | Inventory Clerk | Manager | SuperAdmin |
|-----------------------------|:-----------:|:-------:|:---------------:|:-------:|:----------:|
| Login Page                  | ✅ Allow    | ✅      | ✅              | ✅      | ✅         |
| Dashboard                   | ❌ Deny     | ✅      | ✅              | ✅      | ✅         |
| Point of Sale (POS)         | ❌ Deny     | ✅      | ❌              | ✅      | ❌         |
| Sales History               | ❌ Deny     | ❌      | ❌              | ✅      | ❌         |
| Inventory                   | ❌ Deny     | ✅      | ✅              | ✅      | ❌         |
| Procurement                 | ❌ Deny     | ❌      | ✅              | ✅      | ❌         |
| Human Resources (HR)        | ❌ Deny     | ❌      | ❌              | ✅      | ❌         |
| CRM                         | ❌ Deny     | ✅      | ❌              | ✅      | ❌         |
| Finance                     | ❌ Deny     | ❌      | ❌              | ✅      | ❌         |
| Reports                     | ❌ Deny     | ❌      | ❌              | ✅      | ❌         |
| User Management             | ❌ Deny     | ❌      | ❌              | ❌      | ✅         |
| Role Management             | ❌ Deny     | ❌      | ❌              | ❌      | ✅         |
| Database Admin              | ❌ Deny     | ❌      | ❌              | ❌      | ✅         |
| Security / Audit Logs       | ❌ Deny     | ❌      | ❌              | ❌      | ✅         |
| Archive Management          | ❌ Deny     | ❌      | ❌              | ❌      | ✅         |
| Change Own Password         | ❌ Deny     | ✅      | ✅              | ✅      | ✅         |
| View Own Profile            | ❌ Deny     | ✅      | ✅              | ✅      | ✅         |

### 6.4 API Endpoint Authorization Summary

| Endpoint Group              | Required Role  | Notes                                          |
|-----------------------------|----------------|------------------------------------------------|
| `POST /api/auth/login`      | None           | Public; rate-limited to 10 req/5min per IP     |
| `GET /api/auth/profile`     | Any auth user  | Returns own profile only                       |
| `POST /api/auth/change-password` | Any auth user | Requires current password verification    |
| `GET /api/users/list`       | SuperAdmin     | Paginated user list                            |
| `POST /api/users/create`    | SuperAdmin     | Creates user with `MustChangePassword = true`  |
| `PUT /api/users/{id}`       | SuperAdmin     | Update user details                            |
| `DELETE /api/users/{id}`    | SuperAdmin     | Hard delete user                               |
| `POST /api/users/{id}/unlock` | SuperAdmin   | Clears lockout                                 |
| `POST /api/users/{id}/reset-password` | SuperAdmin | Forces password change on next login   |
| `GET /api/roles`            | SuperAdmin     | List all roles                                 |
| `POST /api/roles`           | SuperAdmin     | Create new role                                |
| `PUT /api/roles/{id}`       | SuperAdmin     | Update role                                    |
| `DELETE /api/roles/{id}`    | SuperAdmin     | Delete role                                    |
| `GET /api/audit`            | SuperAdmin     | View audit logs (also triggers audit entry)    |
| `POST /api/database/backup` | SuperAdmin     | Trigger manual backup                          |

---

## 7. Security Findings and Remediation Tracker

This section tracks all identified security issues. Update the **Status** column as fixes are applied.

| ID  | Severity | Finding                                                                 | File(s)                                      | Status        | Fix Applied |
|-----|----------|-------------------------------------------------------------------------|----------------------------------------------|---------------|-------------|
| S-01 | 🔴 High  | JWT stored in `localStorage` — XSS can steal tokens                    | `frontend/src/lib/axios.ts`, `App.tsx`       | ⬜ Open       | —           |
| S-02 | 🔴 High  | No token revocation — deactivated users retain valid JWTs               | `AuthService.cs`, `UsersController.cs`       | ⬜ Open       | —           |
| S-03 | 🟡 Medium | Login/logout not written to persistent audit DB                        | `AuthService.cs`, `AuditLogAttribute.cs`     | ⬜ Open       | —           |
| S-04 | 🟡 Medium | `CreateUserDto` / `ResetPasswordDto` lack password complexity validation | `UserDtos.cs`, `UserService.cs`             | ⬜ Open       | —           |
| S-05 | 🟡 Medium | `PasswordResetToken` stored in plaintext (if used)                     | `User.cs` model                              | ⬜ Open       | —           |
| S-06 | 🟢 Low   | `AllowedHosts: "*"` in `appsettings.json`                              | `appsettings.json`                           | ⬜ Open       | —           |
| S-07 | 🟢 Low   | No CAPTCHA or progressive delay after repeated login failures           | `AuthController.cs`, `AuthService.cs`        | ⬜ Open       | —           |
| S-08 | ✅ Fixed  | SQL injection — EF Core parameterized queries                          | All services using `ApplicationDbContext`    | ✅ Closed     | EF Core ORM |
| S-09 | ✅ Fixed  | Weak password hashing — PBKDF2-SHA256 100k iterations                  | `PasswordHashingService.cs`                  | ✅ Closed     | PBKDF2-SHA256 |
| S-10 | ✅ Fixed  | No account lockout — 5 attempts, 15-min lockout                        | `AuthService.cs`                             | ✅ Closed     | Lockout logic |
| S-11 | ✅ Fixed  | User enumeration via login error messages                               | `AuthService.cs`                             | ✅ Closed     | Generic messages |
| S-12 | ✅ Fixed  | Missing security headers (CSP, HSTS, X-Frame-Options, etc.)            | `Program.cs`                                 | ✅ Closed     | Security headers middleware |
| S-13 | ✅ Fixed  | No rate limiting on auth endpoints                                      | `Program.cs`, `AuthController.cs`            | ✅ Closed     | ASP.NET Rate Limiter |
| S-14 | ✅ Fixed  | Missing global audit trail for mutations                                | `AuditLogAttribute.cs`                       | ✅ Closed     | Global action filter |
| S-15 | ✅ Fixed  | Stack traces / exception details leaked to client                       | `GlobalExceptionHandlingMiddleware.cs`       | ✅ Closed     | Generic error responses |

---

*Last updated: May 19, 2026*  
*This document should be updated each time a security finding is resolved or a new feature is added.*
