# AI Agent Prompt: React + ASP.NET Core wwwroot SPA Setup

You are setting up a system where the **ASP.NET Core backend serves the React frontend as static files** via the `wwwroot` folder. Follow every step exactly as written.

---

## WHAT YOU ARE BUILDING

- The React (Vite + TypeScript) frontend is compiled and output directly into the ASP.NET backend's `wwwroot/` folder.
- The backend serves both the REST API (`/api/*`) AND the React SPA (everything else).
- In Development: static files are served with no-cache headers so rebuilds always show fresh content.
- In Production: Vite hashes all filenames so long-term browser caching is safe.

---

## STEP 1 — Configure Vite to output into wwwroot

In the frontend project, open `vite.config.ts`.

Find the `build` section (or add it if missing) and set `outDir` to the relative path pointing to the backend's `wwwroot` folder. Also set `emptyOutDir: true` so stale files are wiped on every build.

```ts
build: {
  outDir: '../backend/YourProject.Server/wwwroot', // adjust path to match your folder structure
  emptyOutDir: true,
},
```

**Important:** The path is relative from the frontend project root. Adjust `YourProject.Server` to match your actual backend project folder name.

---

## STEP 2 — Configure Program.cs to serve static files and the SPA

Open `backend/YourProject.Server/Program.cs`.

Add the following block **after** all middleware (UseRouting, UseCors, UseAuthentication, UseAuthorization, MapControllers) but **before** `app.Run()`:

### 4. Static Files (with dev no-cache)

Replace or add the static files section:

```csharp
// 4. Static Files & Routing
// In Development: disable browser caching so rebuilt frontend is always served fresh.
// In Production: Vite content-hashes all JS/CSS, so long-term caching is safe.
if (app.Environment.IsDevelopment())
{
    app.UseStaticFiles(new StaticFileOptions
    {
        OnPrepareResponse = ctx =>
        {
            ctx.Context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
            ctx.Context.Response.Headers["Pragma"] = "no-cache";
            ctx.Context.Response.Headers["Expires"] = "0";
        }
    });
}
else
{
    app.UseStaticFiles();
}
```

### 6. SPA Fallback

After `app.MapControllers()`, add:

```csharp
// 6. SPA Fallback — sends index.html for any route not matching /api/*
// React Router (client-side routing) handles the rest.
app.MapFallbackToFile("index.html");
```

**The correct order in Program.cs must be:**
1. `app.UseMiddleware<...>()` (custom middleware)
2. `app.UseStaticFiles(...)` ← static files BEFORE routing
3. `app.UseRouting()`
4. `app.UseCors(...)`
5. `app.UseAuthentication()`
6. `app.UseAuthorization()`
7. `app.MapControllers()`
8. `app.MapFallbackToFile("index.html")` ← always last

---

## STEP 3 — Build the frontend into wwwroot

Run this from the frontend project directory:

```bash
npm run build
```

This will:
1. Compile all React/TypeScript/CSS
2. Clear the old `wwwroot/` contents (`emptyOutDir: true`)
3. Output `index.html` + `assets/index-[hash].js` + `assets/index-[hash].css` into `wwwroot/`

After building, the `wwwroot/` folder in the backend should contain:
```
wwwroot/
  index.html
  assets/
    index-[hash].js
    index-[hash].css
```

---

## STEP 4 — Docker: bake the wwwroot into the backend image

If this system uses Docker, after running `npm run build` you must also rebuild the backend container so the new `wwwroot/` files are baked into the image:

```bash
docker compose up -d --build backend
```

This triggers `dotnet publish` inside the Docker build, which includes the `wwwroot/` folder in the published output.

**Full rebuild (both services):**
```bash
docker compose up --build -d
```

**After rebuilding, hard refresh the browser:**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

## STEP 5 — Verify it works

1. Open the app URL (e.g. `http://localhost:5009` for local, `http://localhost:3000` for Docker with Nginx frontend).
2. Navigate to any React route (e.g. `/dashboard`) and refresh — it should NOT return a 404. If it does, `app.MapFallbackToFile("index.html")` is missing or ordered incorrectly.
3. Check `/api/health-check` returns `{ status: "Healthy" }` — confirms the API is working alongside the SPA.

---

## COMMON MISTAKES TO AVOID

| Mistake | Fix |
|---|---|
| `MapFallbackToFile` placed before `MapControllers` | Always put it LAST — after `MapControllers` |
| `UseStaticFiles` placed after `UseRouting` | Put it BEFORE `UseRouting` |
| Old JS still loading after rebuild | Either `emptyOutDir: true` is missing in vite.config, or Docker container wasn't rebuilt |
| 404 on page refresh in React Router | `MapFallbackToFile("index.html")` is missing |
| Changes not showing in Docker | Must run `docker compose up -d --build backend` after `npm run build` |

---

## REFERENCE: Minimal working Program.cs pipeline order

```csharp
var app = builder.Build();

app.UseMiddleware<GlobalExceptionHandlingMiddleware>(); // custom middleware

// Static files BEFORE routing
if (app.Environment.IsDevelopment())
{
    app.UseStaticFiles(new StaticFileOptions
    {
        OnPrepareResponse = ctx =>
        {
            ctx.Context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
            ctx.Context.Response.Headers["Pragma"] = "no-cache";
            ctx.Context.Response.Headers["Expires"] = "0";
        }
    });
}
else
{
    app.UseStaticFiles();
}

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// SPA fallback ALWAYS last
app.MapFallbackToFile("index.html");

app.Run();
```
