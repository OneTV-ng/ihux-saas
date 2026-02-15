# DXL Music Hub API v3

A comprehensive REST API for music distribution platform built on Next.js with the DXL-API framework.

## 🚀 Quick Start

### API Endpoint

```
Base URL: /api/dxl/v3
Format: /api/dxl/v3?@=module.operation
```

### Example Request

```javascript
// List all songs
GET /api/dxl/v3?@=songs.list&page=1&limit=20

// Get single song
GET /api/dxl/v3?@=songs.get&id=uuid

// Create new song
POST /api/dxl/v3?@=songs.create
Content-Type: application/json
{
  "type": "single",
  "title": "Song Title",
  "artist_id": "uuid",
  "tracks": [...]
}
```

## 📚 API Convention

The API uses the **@=module.operation** convention:

```
Format: @=module.operation
Examples:
  @=songs.list       → List all songs
  @=songs.create     → Create new song
  @=songs.get        → Get single song
  @=uploads.start    → Start file upload
  @=admin.approvals  → Get pending approvals
```

## 🔐 Authentication

### Headers Required

```javascript
{
  "X-API-KEY": "your-api-key",              // API key
  "Authorization": "Bearer jwt-token",      // JWT token (optional)
  "X-PLATFORM": "web",                      // Platform type
  "Content-Type": "application/json"
}
```

### API Classes & Permissions

| Class | Role | Max per page | Can see totals | Requests/min |
|-------|------|-------------|----------------|-------------|
| 5 | Member | 100 | ❌ | 60 |
| 10 | Manager | 250 | ❌ | 120 |
| 20 | Admin | 500 | ✅ | 300 |
| 50 | Super Admin | Unlimited | ✅ | Unlimited |

## 📦 Response Format

All responses follow this standard envelope:

```json
{
  "info": {
    "action_requested": "songs.list",
    "response_module": "songs",
    "module_version": "3.0.0",
    "timestamp": "2026-02-09T18:30:45Z",
    "request_id": "req_unique_id",
    "execution_time_ms": 45.2
  },
  "status": true,
  "data": { /* your data here */ },
  "message": "Success message",
  "vendor": {
    "name": "iMediaPORT Limited",
    "url": "https://imediaport.com",
    "copyright": "Copyright © 2026 iMediaPORT Limited"
  }
}
```

### Error Response

```json
{
  "info": { /* ... */ },
  "status": false,
  "data": null,
  "message": "Error message",
  "error_details": {
    "code": 404,
    "type": "NotFound",
    "details": { /* additional context */ }
  }
}
```

## 🎵 Songs API

### List Songs
```
GET /api/dxl/v3?@=songs.list
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `artist` - Filter by artist name
- `status` - Filter by status (new, checking, approved, flagged)
- `genre` - Filter by genre
- `type` - Filter by type (single, album, medley)
- `search` - Search in title and artist name

**Response:**
```json
{
  "status": true,
  "data": {
    "total": 540,
    "page": 1,
    "limit": 20,
    "has_next": true,
    "items": [
      {
        "id": "uuid",
        "title": "Song Title",
        "artist_id": "uuid",
        "artist_name": "Artist Name",
        "type": "single",
        "genre": "Afrobeats",
        "status": "approved",
        "cover": "https://cdn.example.com/cover.jpg",
        "created_at": "2026-02-01T10:30:00Z"
      }
    ]
  }
}
```

### Get Single Song
```
GET /api/dxl/v3?@=songs.get&id=uuid
```

### Create Song
```
POST /api/dxl/v3?@=songs.create
Content-Type: application/json

{
  "type": "single",
  "title": "Song Title",
  "artist_id": "uuid",
  "genre": "Afrobeats",
  "language": "en",
  "cover": "upload_id_or_url",
  "tracks": [
    {
      "track_number": 1,
      "title": "Track Title",
      "isrc": "USUM71234567",
      "mp3": "upload_id",
      "explicit": "no",
      "lyrics": "optional",
      "lead_vocal": "Artist Name",
      "producer": "Producer Name",
      "writer": "Writer Name"
    }
  ]
}
```

### Update Song
```
PATCH /api/dxl/v3?@=songs.update
Content-Type: application/json

{
  "id": "uuid",
  "title": "Updated Title",
  "genre": "Afrobeats",
  "status": "submitted"
}
```

### Delete Song
```
DELETE /api/dxl/v3?@=songs.delete&id=uuid
```

## 📤 Uploads API

### Start Upload
```
POST /api/dxl/v3?@=uploads.start
Content-Type: application/json

{
  "filename": "song.mp3",
  "size": 5242880,
  "mime_type": "audio/mpeg"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "upload_id": "uuid",
    "filename": "song.mp3",
    "status": "loading",
    "chunk_size": 1048576,
    "total_chunks": 5
  }
}
```

### Upload Chunk
```
POST /api/dxl/v3?@=uploads.chunk
Content-Type: application/octet-stream
Upload-ID: uuid
Chunk-Number: 1

[Binary file data]
```

### Complete Upload
```
POST /api/dxl/v3?@=uploads.complete
Content-Type: application/json

{
  "upload_id": "uuid",
  "checksum": "sha256_hash"
}
```

### Get Upload Status
```
GET /api/dxl/v3?@=uploads.status&id=uuid
```

## 🛡️ Admin API

**Note:** All admin endpoints require admin role or api_class >= 20

### Get Pending Approvals
```
GET /api/dxl/v3?@=admin.approvals
```

### Approve Song
```
PATCH /api/dxl/v3?@=admin.approve
Content-Type: application/json

{
  "song_id": "uuid",
  "status": "approved",
  "note": "Ready for distribution"
}
```

### Flag Song
```
PATCH /api/dxl/v3?@=admin.flag
Content-Type: application/json

{
  "song_id": "uuid",
  "flag_type": "flag_cover",
  "reason": "Cover image does not match requirements",
  "details": {}
}
```

### Dashboard Statistics
```
GET /api/dxl/v3?@=admin.dashboard.stats
```

**Response:**
```json
{
  "status": true,
  "data": {
    "songs": {
      "total": 540,
      "pending": 25,
      "approved": 490,
      "flagged": 15
    },
    "tasks": {
      "total": 50,
      "pending": 20,
      "in_progress": 15,
      "completed": 15
    },
    "alerts": {
      "total": 10,
      "active": 5,
      "critical": 2
    }
  }
}
```

### Admin Tasks
```
GET /api/dxl/v3?@=admin.tasks.list&page=1&limit=20
POST /api/dxl/v3?@=admin.tasks.create
```

### Admin Alerts
```
GET /api/dxl/v3?@=admin.alerts.list&status=active
```

### Royalties
```
GET /api/dxl/v3?@=admin.royalty.list&period=2026-Q1&status=pending
GET /api/dxl/v3?@=admin.royalty.user_inflow&user_id=uuid
```

## 🔧 Frontend Integration

### Using the DXL API Client

```javascript
import { DxlApiClient } from '@/lib/dxl-api-client';

// Initialize client
const api = new DxlApiClient({
  baseUrl: '/api/dxl/v3',
  apiKey: 'your-api-key',
  platform: 'web',
  debug: true
});

// List songs
const response = await api.listSongs({
  page: 1,
  limit: 20,
  genre: 'Afrobeats'
});

if (response.status) {
  console.log('Songs:', response.data.items);
} else {
  console.error('Error:', response.message);
}

// Create song
const newSong = await api.createSong({
  type: 'single',
  title: 'My New Song',
  artist_id: 'user-uuid',
  genre: 'Afrobeats',
  tracks: [
    {
      title: 'Track 1',
      mp3: 'upload-id'
    }
  ]
});

// Update song
await api.updateSong('song-uuid', {
  title: 'Updated Title',
  status: 'submitted'
});

// Admin operations
await api.approveSong('song-uuid', 'approved', 'Looks good!');
const stats = await api.getDashboardStats();
```

### React Component Example

```tsx
import { useEffect, useState } from 'react';
import { DxlApiClient } from '@/lib/dxl-api-client';

export function SongsList() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = new DxlApiClient({ baseUrl: '/api/dxl/v3' });

  useEffect(() => {
    api.listSongs({ page: 1, limit: 20 })
      .then(response => {
        if (response.status) {
          setSongs(response.data.items);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {songs.map(song => (
        <div key={song.id}>
          <h3>{song.title}</h3>
          <p>{song.artist_name}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🗄️ Database Schema

### Songs Table
- Basic info (title, artist, type, genre, status)
- Cover image and UPC
- Approval tracking (approved_by, approved_at)
- Flag system (flag_type, flag_reason, flagged_by)
- Soft delete support

### Tracks Table
- Track metadata (title, ISRC, track number)
- Audio file (mp3 URL/upload_id)
- Explicit content flag
- Credits (lead vocal, producer, writer)
- Lyrics support

### Uploads Table
- Chunked upload support
- Progress tracking
- File metadata (size, mime type, checksum)
- Status management (loading, complete, failed)

### Royalties Table
- Period-based tracking (monthly/quarterly)
- Financial data (gross, deductions, net)
- Matching system (UPC/ISRC to songs)
- Payment status tracking

### Admin Tables
- Tasks (assignment, priority, status)
- Alerts (type, severity, resolution)
- API keys (rate limits, permissions)

## 🚦 Status Codes

| Code | Type | Meaning |
|------|------|---------|
| 200 | Success | Request successful |
| 400 | BadRequest | Invalid request format |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | NotFound | Resource not found |
| 422 | ValidationError | Invalid data |
| 429 | RateLimited | Too many requests |
| 500 | InternalError | Server error |

## 📝 Migration

To apply the database schema:

```bash
# Generate migration (already done)
pnpm db:generate

# Apply migration to database
pnpm db:push

# Or run migrations
pnpm db:migrate
```

Migration file: `drizzle/0003_deep_zombie.sql`

## 🧪 Testing the API

### Using cURL

```bash
# List songs
curl "http://localhost:3000/api/dxl/v3?@=songs.list&page=1&limit=10" \
  -H "X-API-KEY: your-key"

# Create song
curl -X POST "http://localhost:3000/api/dxl/v3?@=songs.create" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: your-key" \
  -d '{
    "type": "single",
    "title": "Test Song",
    "artist_id": "user-uuid",
    "tracks": [{"title": "Track 1", "mp3": "url"}]
  }'
```

### Using JavaScript

```javascript
fetch('/api/dxl/v3?@=songs.list&page=1&limit=20', {
  headers: {
    'X-API-KEY': 'your-key',
    'X-PLATFORM': 'web'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

## 🔒 Security Notes

1. **Authentication**: Always include X-API-KEY or Authorization header
2. **Rate Limiting**: Respect rate limits based on API class
3. **Permission Checks**: Admin endpoints require admin role
4. **Data Validation**: All inputs are validated server-side
5. **Soft Deletes**: Deleted items are marked, not removed

## 📚 Available Modules

- ✅ **songs** - Music catalog management
- ✅ **uploads** - File upload system  
- ✅ **admin** - Administration tools
- 🚧 **users** - User management (coming soon)
- 🚧 **auth** - Authentication (coming soon)

## 🤝 Support

For API support and questions:
- Documentation: Full API guide in `/DOCUMENTATION/API_COMPREHENSIVE_GUIDE.md`
- Issues: Create an issue in the repository
- Email: support@imediaport.com

## 📄 License

Copyright © 2026 iMediaPORT Limited. All rights reserved.

---

**Built with DXL Music HUB** 🎵
