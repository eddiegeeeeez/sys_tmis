# Database setup (TradeMatrix.Server)

## Connection string

- **Development:** `appsettings.Development.json` → `ConnectionStrings:DefaultConnection`
- Use your SQL Server connection (e.g. DatabaseASP.net, LocalDB, or SQL Express).

Example shape:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=YOUR_DB;User Id=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=True;"
  }
}
```

For production, store the connection string in environment variables or a secret store, not in appsettings.

## First run (user entries)

1. **Migrations:** On startup the app runs `Database.Migrate()`, which creates or updates the database to match the migrations in `Migrations/`.
2. **Seeding:** After migration, `DbSeeder.Seed()` runs. If the `Users` table is empty, it inserts 5 default users (all with password **`Password123!`**):

   | Role           | Email                |
   |----------------|----------------------|
   | Super Admin    | superadmin@tmis.com  |
   | System Admin   | admin@tmis.com       |
   | Manager        | manager@tmis.com     |
   | Cashier        | cashier@tmis.com     |
   | Inventory Clerk| clerk@tmis.com       |

3. **No manual SQL needed** for the initial user setup; run the API project once and the DB will be created and seeded.

## Optional: JWT (login)

To override JWT in development, add to `appsettings.Development.json`:

```json
{
  "Jwt": {
    "Key": "YourDevSecretKeyAtLeast32CharactersLong!",
    "Issuer": "TradeMatrixServer",
    "Audience": "TradeMatrixClient"
  }
}
```
