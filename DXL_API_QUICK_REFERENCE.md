# DXL API v3 - Quick Reference

## 🚀 Start Using

```bash
# 1. Apply database migration
pnpm db:push

# 2. Start dev server (if not running)
pnpm dev

# 3. Visit demo page
http://localhost:3000/api-demo
```

## 📡 API Format

```
/api/dxl/v3?@=module.operation&param1=value&param2=value
```

## 🎵 Common Operations

### List Songs
```bash
curl "http://localhost:3000/api/dxl/v3?@=songs.list&page=1&limit=20"
```

### Get Song
```bash
curl "http://localhost:3000/api/dxl/v3?@=songs.get&id=UUID"
```

### Create Song
```bash
curl -X POST "http://localhost:3000/api/dxl/v3?@=songs.create" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "single",
    "title": "My Song",
    "artist_id": "user-uuid",
    "tracks": [{"title": "Track 1", "mp3": "url"}]
  }'
```

### Upload File
```bash
# 1. Start upload
curl -X POST "http://localhost:3000/api/dxl/v3?@=uploads.start" \
  -H "Content-Type: application/json" \
  -d '{"filename": "song.mp3", "size": 5242880, "mime_type": "audio/mpeg"}'

# 2. Upload chunks (use upload_id from step 1)
# 3. Complete upload
curl -X POST "http://localhost:3000/api/dxl/v3?@=uploads.complete" \
  -H "Content-Type: application/json" \
  -d '{"upload_id": "UUID", "checksum": "hash"}'
```

### Admin Stats
```bash
curl "http://localhost:3000/api/dxl/v3?@=admin.dashboard.stats"
```

## 💻 Frontend Integration

```typescript
import { DxlApiClient } from '@/lib/dxl-api-client';

const api = new DxlApiClient({
  baseUrl: '/api/dxl/v3',
  platform: 'web'
});

// List songs
const response = await api.listSongs({ page: 1, limit: 20 });
console.log(response.data.items);

// Create song
await api.createSong({
  type: 'single',
  title: 'New Song',
  artist_id: 'uuid',
  tracks: [...]
});

// Get stats
const stats = await api.getDashboardStats();
```

## 📊 Response Format

```json
{
  "info": {
    "action_requested": "songs.list",
    "response_module": "songs",
    "module_version": "3.0.0",
    "timestamp": "2026-02-09T...",
    "request_id": "req_...",
    "execution_time_ms": 45.2
  },
  "status": true,
  "data": { /* your data */ },
  "message": "Success message"
}
```

## 🔐 Authentication

```javascript
// API Key
headers: {
  "X-API-KEY": "your-key"
}

// JWT Token
headers: {
  "Authorization": "Bearer token"
}
```

## 📚 Available Modules

- **songs** - Music catalog
- **uploads** - File uploads
- **admin** - Administration

## 📖 Full Documentation

- **API Guide**: `/DXL_API_V3_README.md`
- **Implementation**: `/DXL_API_V3_IMPLEMENTATION_SUMMARY.md`
- **Original Spec**: `/DOCUMENTATION/API_COMPREHENSIVE_GUIDE.md`
- **Demo**: http://localhost:3000/api-demo

## 🎯 Key Files

```
src/
  app/api/dxl/v3/route.ts      # Main API endpoint
  lib/
    dxl-api-client.ts           # Frontend client
    dxl-api-handler.ts          # API framework
    handlers/
      songs-handler.ts          # Songs API
      uploads-handler.ts        # Uploads API
      admin-handler.ts          # Admin API
  db/
    music-schema.ts             # Database tables

drizzle/0003_deep_zombie.sql  # Migration file
```

## ✅ Next Steps

1. Run `pnpm db:push` to apply schema
2. Visit `/api-demo` to test endpoints
3. Integrate using `DxlApiClient`
4. Build your music platform! 🎵
