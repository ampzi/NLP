# SitePulse — Full-Stack Guide

A complete **website uptime monitoring service**: a NestJS + PostgreSQL backend
and a React + Vite frontend, merged into one app. The backend implements the
**User**, **Monitor**, **CheckResult**, **Incident**, and **NotificationSetting**
models from the `sitepulse-database-explorer.html` schema reference plus the
background engine; the frontend is a Persian (RTL) dashboard that talks to it
over a JWT-authenticated REST API.

---

## 1. What it does

1. Users register / log in (JWT).
2. A user creates **Monitors** — websites to watch (URL, interval, timeout).
3. A background **scheduler** checks each monitor on its own interval.
4. Every attempt is recorded as a **CheckResult** (immutable history).
5. Consecutive failures that cross a threshold open an **Incident**; recovery
   resolves it.
6. Users manage **NotificationSettings** (Telegram) and get alerted on
   down / recovery.

---

## 2. Tech stack

| Layer      | Choice |
|------------|--------|
| Runtime    | Node.js (ESM, `"type": "module"`) |
| Framework  | NestJS 12 (NodeNext module resolution) |
| Frontend   | React 19 + Vite 8 + TypeScript (Tailwind CSS, Persian RTL dashboard) |
| ORM        | Prisma 7 + `@prisma/adapter-pg` (PostgreSQL driver adapter) |
| Database   | PostgreSQL |
| Auth       | Passport + JWT (`@nestjs/jwt`), bcrypt password hashing |
| Validation | class-validator / class-transformer (`ValidationPipe`) |
| Scheduling | `@nestjs/schedule` |
| HTTP client| global `fetch` (undici) for probing targets + Telegram |
| Testing    | Vitest |

---

## 3. Project structure

```
src/
├── app.module.ts            # root module: wires everything, global JWT guard
├── app.controller.ts        # GET / and public GET /health
├── main.ts                  # bootstrap, ValidationPipe, CORS, port
├── prisma/
│   ├── prisma.module.ts     # @Global() module exporting PrismaService
│   └── prisma.service.ts    # PrismaClient with the pg adapter
├── user/                    # User model CRUD + lookup helpers
├── auth/                    # register / login / me, JWT strategy + guard
├── monitors/                # Monitor CRUD + check/incident history endpoints
├── monitoring/              # the engine (background work)
│   ├── checker.service.ts   # probes a URL, records CheckResult, updates Monitor
│   ├── incident.service.ts  # open / resolve incident lifecycle
│   ├── notifier.service.ts  # Telegram alerts
│   ├── monitoring.scheduler.ts  # interval that dispatches due checks
│   ├── retention.service.ts     # nightly cleanup of old history
│   └── monitoring.module.ts
├── notification-settings/   # GET/PUT notification preferences
├── incidents/               # global GET /incidents (with monitor name)
└── common/                  # shared decorators, URL-safety (SSRF guard)
prisma/
├── schema.prisma            # the data model
├── migrations/              # applied SQL migrations
└── seed.mjs                 # demo data
frontend/sitepulse/          # React + Vite frontend (the dashboard)
├── src/services/            # HTTP client + API service layer
├── src/pages/               # dashboard, monitors, incidents, settings
├── src/app/router.tsx       # routes + auth guard
└── dist/                    # built SPA (served by the backend in prod)
```

---

## 4. Data model

### Enums

| Enum | Values |
|------|--------|
| `MonitorStatus` | `PENDING`, `UP`, `DOWN` |
| `CheckStatus` | `SUCCESS`, `HTTP_ERROR`, `TIMEOUT`, `CONNECTION_ERROR`, `SSL_ERROR`, `UNKNOWN_ERROR` |
| `IncidentStatus` | `OPEN`, `RESOLVED` |

### `User` (existing auth model)

| Field | Type | Notes |
|-------|------|-------|
| `id` | Int · PK | autoincrement |
| `email` | String | **unique**, login identifier |
| `name` | String | display name |
| `password` | String | **bcrypt hash only** (never plaintext) |
| `createdAt` / `updatedAt` | DateTime | managed timestamps |

Relations: `monitors Monitor[]`, `notificationSetting NotificationSetting?`

### `Monitor` — a website owned by a user

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `id` | Int · PK | | |
| `userId` | Int · FK | | owner → `User.id`, cascade delete |
| `name` | String | | label |
| `url` | String | | http(s) target |
| `checkIntervalSeconds` | Int | `300` | 60 … 86400 |
| `timeoutMs` | Int | `10000` | 1000 … 60000 |
| `isActive` | Boolean | `true` | scheduler only checks active monitors |
| `currentStatus` | MonitorStatus | `PENDING` | cached latest state |
| `lastCheckedAt` | DateTime? | null | latest completed check |
| `lastResponseTimeMs` | Int? | null | cached response time |
| `consecutiveFailures` | Int | `0` | failure counter used by incident logic |
| `createdAt` / `updatedAt` | DateTime | | |

Indexes: `(userId)`, `(isActive)`

### `CheckResult` — immutable check history

| Field | Type | Notes |
|-------|------|-------|
| `id` | Int · PK | |
| `monitorId` | Int · FK | → `Monitor.id`, cascade delete |
| `status` | CheckStatus | outcome of the attempt |
| `httpStatusCode` | Int? | e.g. `200`, `404`, `503` |
| `responseTimeMs` | Int? | elapsed time (stored even on failures) |
| `errorType` | String? | normalized category (`TIMEOUT`, `SSL`, …) |
| `errorMessage` | String? | sanitized diagnostic |
| `checkedAt` | DateTime | default `now()` |

Index: `(monitorId, checkedAt)` — supports fast history queries.

### `Incident` — one outage period

| Field | Type | Notes |
|-------|------|-------|
| `id` | Int · PK | |
| `monitorId` | Int · FK | → `Monitor.id`, cascade delete |
| `startedAt` | DateTime | outage start |
| `resolvedAt` | DateTime? | null while `OPEN` |
| `status` | IncidentStatus | `OPEN` / `RESOLVED` |
| `cause` | String? | e.g. `TIMEOUT`, `HTTP_ERROR` |
| `failureMessage` | String? | short description |
| `createdAt` / `updatedAt` | DateTime | |

Indexes: `(monitorId, status)`, `(monitorId, startedAt)`

### `NotificationSetting` — one row per user

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `id` | Int · PK | | |
| `userId` | Int · FK | | **unique** → one settings row per user |
| `telegramChatId` | String? | null | Telegram chat id |
| `telegramEnabled` | Boolean | `false` | master switch |
| `notifyOnDown` | Boolean | `true` | alert when incident opens |
| `notifyOnRecovery` | Boolean | `true` | alert when incident resolves |
| `createdAt` / `updatedAt` | DateTime | | |

### Relationships

```
User ──1:N──▶ Monitor
User ──1:0..1─▶ NotificationSetting
Monitor ──1:N──▶ CheckResult
Monitor ──1:N──▶ Incident
```

All children use `onDelete: Cascade`, so deleting a monitor (or user) cleans up
its history automatically.

---

## 5. Business rules → where they're enforced

| Rule (from the HTML) | Implementation |
|----------------------|----------------|
| **A. Ownership checks** | `MonitorsService.getOwned()` throws 403 unless `monitor.userId === req.user.id`. Called by every read-single / edit / delete and all history queries. |
| **B. At most one open incident** | `IncidentService.onFailure()` re-checks for an existing `OPEN` incident before creating one. The in-memory `inFlight` set also prevents concurrent checks of the same monitor in one process. For multi-instance, add a partial unique index (see §10). |
| **C. Notification settings unique per user** | `@@unique` on `NotificationSetting.userId` + `upsert({ where: { userId } })`. |
| **D. Keep history growth in mind** | `(monitorId, checkedAt)` index + `RetentionService` nightly cleanup (`CHECK_RESULT_RETENTION_DAYS`, `INCIDENT_RETENTION_DAYS`). |
| **E. Sensible bounds** | DTO validation (interval 60–86400s, timeout 1–60s, URL must be public http(s)), SSRF guard (`assertSafeUrl`), `MAX_MONITORS_PER_USER`. |
| **F. Password hashes only** | `AuthService` hashes with bcrypt (12 rounds); `UserService.publicSelect` never returns `password` — only `findByEmailWithPassword` (login) reads it. |

---

## 6. How a check works (the engine)

```
Scheduler tick (every 60s)
  └─ find active monitors whose lastCheckedAt is older than checkIntervalSeconds
      └─ run with concurrency 5
          └─ CheckerService.checkMonitorById(id)
              ├─ probe(url, timeoutMs)  → fetch + AbortSignal.timeout
              │    └─ classify: SUCCESS | HTTP_ERROR | TIMEOUT | CONNECTION_ERROR | SSL_ERROR | UNKNOWN_ERROR
              ├─ CheckResult.create(...)          // immutable history
              └─ if SUCCESS:
                   Monitor → UP, consecutiveFailures = 0
                   IncidentService.onRecovery()   // resolve OPEN → RESOLVED + resolvedAt
                   Notifier.notifyRecovery()      // if enabled
                 else:
                   Monitor → DOWN, consecutiveFailures += 1
                   IncidentService.onFailure(threshold)  // open incident once threshold met
                   Notifier.notifyDown()          // only on a *newly opened* incident
```

Key decisions:

- **Current status is cached** on `Monitor` for fast dashboard reads.
- **CheckResult rows are never updated** — each attempt is a new row.
- **A failure is not automatically an incident** — only after
  `consecutiveFailures >= INCIDENT_FAILURE_THRESHOLD` (default 3).
- **One outage = one incident** — recovery resolves it; later failures open a
  new one.

---

## 7. API reference

Every route lives under the **`/api`** prefix (so `/auth/login` is really
`/api/auth/login`). Auth is **global** (`APP_GUARD` → `JwtAuthGuard`): every
route is protected unless marked `@Public()` (`/api/auth/*`, `/api/health`).

Send the token as `Authorization: Bearer <access_token>`.

### Auth

| Method | Route | Auth | Body / notes |
|--------|-------|------|--------------|
| POST | `/auth/register` | public | `{ email, name, password }` |
| POST | `/auth/login` | public | `{ email, password }` |
| GET | `/auth/me` | bearer | current user |
| PATCH | `/auth/password` | bearer | `{ currentPassword, newPassword }` |

### Users

| Method | Route | Notes |
|--------|-------|-------|
| GET | `/user` | list users |
| GET | `/user/:id` | one user |
| PATCH | `/user/:id` | `{ name?, email? }` |
| DELETE | `/user/:id` | |

### Monitors

| Method | Route | Notes |
|--------|-------|-------|
| POST | `/monitors` | create — `{ name, url, description?, checkIntervalSeconds?, timeoutMs?, isActive? }` |
| GET | `/monitors` | list (search / filter / sort / pagination) |
| GET | `/monitors/:id` | one monitor (ownership-checked) |
| PATCH | `/monitors/:id` | partial update |
| DELETE | `/monitors/:id` | delete (cascades history + incidents) |
| POST | `/monitors/:id/check` | **run a check immediately** |
| GET | `/monitors/:id/checks` | check history (newest first), `?limit&offset` |
| GET | `/monitors/:id/checks/:checkId` | single check result |
| GET | `/monitors/:id/incidents` | incident history, `?limit&offset` |
| GET | `/monitors/:id/incidents/:incidentId` | single incident |
| GET | `/monitors/stats` | uptime / last-success / avg response per monitor (`?days=30`) |
| GET | `/monitors/response-times` | aggregate response-time series (`?range=24h\|7d\|30d`) |
| GET | `/monitors/:id/response-times` | response-time series for one monitor |

`GET /monitors` query params: `search`, `active=true|false`, `sortBy`
(`createdAt|name|lastCheckedAt|currentStatus`), `sortDir` (`asc|desc`),
`limit` (1–100), `offset`.

### Notification settings

| Method | Route | Notes |
|--------|-------|-------|
| GET | `/notification-settings` | returns settings (auto-creates defaults on first call) |
| PUT | `/notification-settings` | upsert `{ telegramChatId?, telegramEnabled?, notifyOnDown?, notifyOnRecovery? }` |

### Incidents

| Method | Route | Notes |
|--------|-------|-------|
| GET | `/incidents` | all incidents across the user's monitors (with `monitorName`), `?limit&offset` |

### Misc

| Method | Route | Auth |
|--------|-------|------|
| GET | `/health` | public — `{ status, uptime }` |
| GET | `/` | serves the built React SPA (index.html), not under `/api` |

### Example flow

```bash
# 1. register
curl -X POST http://localhost:6542/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@sitepulse.dev","name":"Demo","password":"password123"}'
# → { access_token, user }

TOKEN="<access_token from above>"

# 2. create a monitor
curl -X POST http://localhost:6542/api/monitors \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"My site","url":"https://example.com","checkIntervalSeconds":60}'

# 3. check it now
curl -X POST http://localhost:6542/api/monitors/1/check \
  -H "Authorization: Bearer $TOKEN"

# 4. read history
curl http://localhost:6542/api/monitors/1/checks -H "Authorization: Bearer $TOKEN"

# 5. configure notifications
curl -X PUT http://localhost:6542/api/notification-settings \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"telegramEnabled":true,"telegramChatId":"123456789","notifyOnDown":true}'
```

---

## 8. Configuration (`.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `6542` | HTTP port |
| `DATABASE_URL` | — | Postgres connection string |
| `JWT_SECRET` | — | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | token lifetime |
| `INCIDENT_FAILURE_THRESHOLD` | `3` | failures before opening an incident |
| `MAX_MONITORS_PER_USER` | `100` | monitor cap per user (rule E) |
| `CHECK_RESULT_RETENTION_DAYS` | `90` | how long to keep check history (`0` = forever) |
| `INCIDENT_RETENTION_DAYS` | `365` | how long to keep resolved incidents (`0` = forever) |
| `TELEGRAM_BOT_TOKEN` | (empty) | enables Telegram delivery when set |

---

## 9. Setup & run

```bash
# 1. install backend + frontend dependencies
npm install
npm run frontend:install

# 2. create the database and set DATABASE_URL in .env
#    e.g. postgresql://postgres:123456@localhost:5432/nlp?schema=public

# 3. apply migrations (creates all tables/enums/indexes)
npx prisma migrate deploy

# 4. (optional) load demo data (demo@sitepulse.dev / password123)
npm run db:seed
```

### Production / single server

```bash
# Build the frontend into frontend/sitepulse/dist, then build the backend.
npm run build:all

# One server serves everything: the API under /api and the SPA at /.
npm run start:prod     # → http://localhost:6542
```

### Development (two servers + hot reload)

```bash
# terminal 1 — backend (API + scheduler) on :6542
npm run start:dev

# terminal 2 — frontend (Vite) on :5173, proxies /api → :6542
npm run frontend:dev
# → open http://localhost:5173
```

The seed creates `demo@sitepulse.dev` / `password123` with three monitors:
one healthy, one returning HTTP 404, and one unreachable — so you can watch
`CheckResult` rows appear and an `Incident` open/close as soon as the app runs.

---

## 10. Testing

```bash
npm test              # backend unit tests (vitest)
npm run test:e2e      # backend e2e tests
npm run lint          # backend lint (oxlint)
npm run frontend:build   # type-check + build the frontend
```

16 backend unit tests cover the services/controllers are defined and the auth
password-hash behavior.

---

## 11. Security notes

- **SSRF guard** (`src/common/url-safety.ts`): only `http(s)` is allowed;
  loopback/private/link-local IPs and well-known internal hostnames
  (`localhost`, cloud metadata, …) are rejected at validation time. Note: the
  check engine follows redirects, so re-validating resolved/redirected hosts
  at request time is a future hardening step.
- **Password** is bcrypt-hashed (cost 12) and never returned by any endpoint.
- **Ownership** is enforced on every monitor read/write via `getOwned()`.
- **JWT** signs `{ sub, email, name }`; the strategy reloads the user from the
  DB on each request, so deleted users are rejected immediately.

---

## 12. Recommended next steps

- **Hard DB guarantee for rule B** (multi-instance deployments): add a partial
  unique index, then make `onFailure` catch the `P2002` unique violation and
  ignore it:
  ```sql
  CREATE UNIQUE INDEX incidents_one_open_per_monitor
    ON incidents (monitorId)
    WHERE status = 'OPEN';
  ```
- **Re-validate redirects** in the checker (follow redirects, then re-run
  `assertSafeUrl` on the final URL) to fully close SSRF.
- **Telegram connect flow**: a bot `/start` webhook that writes the user's
  `telegramChatId` automatically instead of pasting it.
- **Rate limiting** on login/register and the manual check endpoint.
- **Health metrics**: expose check success rate / latency percentiles from
  `CheckResult`.

---

## 13. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Can't reach database server` | Postgres is not running, or `DATABASE_URL` is wrong. |
| `P3005` / migration drift | Schema changed without a migration — run `npx prisma migrate dev`. |
| Telegram not delivered | `telegramEnabled` + `telegramChatId` must be set **and** `TELEGRAM_BOT_TOKEN` present; the app logs a warning otherwise. |
| No checks happening | The monitor must be `isActive: true`; the scheduler scans every 60s and then waits for each monitor's own interval. Use `POST /monitors/:id/check` to test instantly. |
| `Monitor limit reached` | Raise `MAX_MONITORS_PER_USER`. |
