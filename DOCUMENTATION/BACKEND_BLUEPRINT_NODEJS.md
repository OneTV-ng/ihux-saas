# Backend Blueprint - Node.js (DXL-API Compatible)
**Purpose:** Provide a Node.js backend architecture that fully supports the existing DXL-API client and @= conventions.  
**Compatibility:** Must work with the same dxlApiClient/dxlAdminClient used by PHP.

---

## 1. Core Requirements
- Use the **@=module.operation** routing convention.
- Return the **standard response envelope**.
- Support **API Key + JWT** authentication.
- Enforce **roles & API classes**.
- Implement **admin extensions** (KPI, task board, alerts, royalties).
- Maintain **tenant** context.

---

## 2. Directory Structure
```
/var/app/sfapi-node
├─ src/
│  ├─ index.js
│  ├─ engine.js
│  ├─ config.js
│  ├─ middleware/
│  │  ├─ auth.js
│  │  ├─ apiKey.js
│  │  └─ tenant.js
│  ├─ handlers/
│  │  ├─ AuthHandler.js
│  │  ├─ SongsHandler.js
│  │  ├─ UploadsHandler.js
│  │  ├─ UsersHandler.js
│  │  ├─ AdminHandler.js
│  │  ├─ RoyaltyHandler.js
│  │  └─ TaskBoardHandler.js
│  ├─ lib/
│  │  ├─ jwt.js
│  │  ├─ db.js
│  │  └─ validator.js
│  └─ utils/
│     └─ response.js
└─ package.json
```

---

## 3. Routing Model
**Request Example:**
```
GET /api/?@=songs.list&page=1&limit=20
```
**Engine flow:**
1. Parse `@=songs.list`
2. Load handler by module
3. Call `process()` → method name by operation
4. Return envelope

---

## 4. Standard Response Envelope
```json
{
  "info": {
    "action_requested": "songs.list",
    "response_module": "songs",
    "module_version": "1.0.0",
    "timestamp": "2026-02-05T10:00:00Z",
    "request_id": "req_xxx",
    "execution_time_ms": 42.5,
    "memory_usage": "2.1 MB"
  },
  "status": true,
  "data": {},
  "message": "OK",
  "error_details": null,
  "vendor": {
    "name": "iMediaPORT Limited",
    "url": "https://imediaport.com"
  }
}
```

---

## 5. Auth & Security
- `X-API-KEY` header required
- `Authorization: Bearer <JWT>` for user requests
- JWT payload must include: `user_id`, `role`, `api_class`, `tenant`, `exp`
- Permissions enforced in middleware + handlers

---

## 6. Required Modules (Must Match Client)
### Auth
- `@=auth.register`
- `@=auth.login`
- `@=auth.logout`
- `@=auth.refresh`
- `@=auth.social` (optional)

### Songs
- `@=songs.list`
- `@=songs.create`
- `@=songs.get`
- `@=songs.update`
- `@=songs.delete`

### Uploads
- `@=uploads.start`
- `@=uploads.chunk`
- `@=uploads.complete`

### Users
- `@=users.list`
- `@=users.profile`
- `@=users.update`

### Admin (Extensions)
- `@=admin.dashboard.stats`
- `@=admin.kpi.system`
- `@=admin.kpi.business`
- `@=admin.kpi.royalty`
- `@=admin.tasks.*`
- `@=admin.alerts.*`
- `@=admin.notify.*`
- `@=admin.royalty.*`
- `@=admin.royalty.user_inflow`

---

## 7. Data Integrity Fields
All admin-managed entities should include:
```json
{
  "created_by": "user_uuid",
  "managed_by": "admin_uuid",
  "approved_by": "admin_uuid"
}
```

---

## 8. KPI Refresh Strategy
- Use polling in the client every **15 seconds**.
- Provide timestamped KPI data and server stats.
- Optionally expose **WebSocket** stream at `/api/admin/kpi/stream`.

---

## 9. Royalty Matching Logic
Priority matching:
1. ISRC → Track
2. UPC → Song
3. Artist name (exact → fuzzy)

Populate:
- `song_id`, `track_id`, `artist_id`, `user_id`, `manager_id`

---

## 10. Deployment Checklist
- HTTPS enabled
- JWT secret configured
- Rate limits by API class
- CORS configured for frontend
- Audit logging for admin actions

---

**Status:** ✅ Blueprint Complete (Node.js)
