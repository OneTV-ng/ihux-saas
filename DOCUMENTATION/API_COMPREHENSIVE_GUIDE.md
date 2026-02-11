# Universal Music Hub API - Complete Integration Guide
**Version:** 1.0.0  
**Built on:** DXL - API Framework  
**Status:** READY FOR IMPLEMENTATION  
**Date:** February 4, 2026  
**Audience:** Frontend, Mobile, Backend Engineers

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Request/Response Standard](#requestresponse-standard)
3. [Authentication & Security](#authentication--security)
4. [Complete Endpoint Reference](#complete-endpoint-reference)
5. [dxlApiClient - Frontend Integration](#dxlapiclient---frontend-integration)
6. [Mobile Integration Guide](#mobile-integration-guide)
7. [Error Handling](#error-handling)
8. [Implementation Checklist](#implementation-checklist)

---

## Architecture Overview

### DXL-API Request Structure (@= Convention)

The API uses a **@=action** convention for all requests:

```
Format: @=module.operation
Examples:
  @=songs.list       → List all songs
  @=songs.create     → Create new song
  @=songs.get        → Get single song
  @=users.login      → User authentication
  @=uploads.complete → Mark upload as complete
```

### Request Resolution Order

```
1. Extract @=action from request
   ↓
2. Determine module (songs, users, uploads, etc.)
   ↓
3. Load module handler (SongsHandler, UserHandler, etc.)
   ↓
4. Validate authentication headers
   ↓
5. Process request via handler->process()
   ↓
6. Wrap response in standard envelope
   ↓
7. Return to client
```

---

## Request/Response Standard

### Standard Request Format

All requests follow this pattern:

**GET Request:**
```
GET /api/?@=songs.list&page=1&limit=20
Headers:
  X-API-KEY: your-api-key
  Authorization: Bearer your-jwt-token
  X-PLATFORM: web
  Content-Type: application/json
```

**POST Request:**
```
POST /api/?@=songs.create
Headers:
  X-API-KEY: your-api-key
  Authorization: Bearer your-jwt-token
  X-PLATFORM: web
  Content-Type: application/json

Body:
{
  "title": "Song Title",
  "artist_id": "uuid",
  "type": "single",
  "tracks": [...]
}
```

### Standard Response Envelope

**Every response follows this structure:**

```json
{
  "info": {
    "action_requested": "songs.list",
    "response_module": "songs",
    "module_version": "1.0.0",
    "timestamp": "2026-02-04T18:30:45Z",
    "request_id": "req_unique_identifier",
    "execution_time_ms": 45.2,
    "memory_usage": "2.34 MB"
  },
  "status": true,
  "data": {
    "total": 540,
    "page": 1,
    "limit": 20,
    "items": [...]
  },
  "message": "Songs retrieved successfully",
  "vendor": {
    "name": "iMediaPORT Limited",
    "url": "https://imediaport.com",
    "copyright": "Copyright © 2026 iMediaPORT Limited"
  }
}
```

### Error Response Format

```json
{
  "info": {
    "action_requested": "songs.get",
    "response_module": "songs",
    "module_version": "1.0.0",
    "timestamp": "2026-02-04T18:30:45Z",
    "request_id": "req_error_identifier"
  },
  "status": false,
  "data": null,
  "message": "Song not found",
  "error_details": {
    "code": 404,
    "type": "NotFoundError",
    "details": {
      "resource": "song",
      "id": "invalid_id"
    }
  },
  "vendor": {
    "name": "iMediaPORT Limited",
    "url": "https://imediaport.com",
    "copyright": "Copyright © 2026 iMediaPORT Limited"
  }
}
```

---

## Authentication & Security

### API Key Authentication

```
Header: X-API-KEY: your-api-key
```

**Where to find:** Provided in dashboard after registration

### JWT Token Authentication (Recommended)

```
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token contains:**
- `user_id` - Unique user identifier
- `tenant` - Organization/portal identifier
- `role` - User role (artist, manager, admin, etc.)
- `api_class` - Permission level (5, 10, 20, 50)
- `exp` - Expiration timestamp

### Optional Context Headers

```
X-PLATFORM: web|mobile|desktop|tablet
X-PLATFORM-VERSION: 1.0.0
X-TENANT: optional-tenant-override
Content-Type: application/json
```

### User Roles & Hierarchy

| Role | Description | Status | Default API Class |
|------|-------------|--------|-------------------|
| **guest** | Unregistered users | No account | 0 |
| **new** | Unverified users | Email not verified | 0 |
| **member** | Verified users | Email verified | 5 |
| **manager** | Content managers | Elevated access | 10 |
| **admin** | System administrators | Full access | 20 |
| **super_admin** | Super administrators | Unrestricted | 50 |

**Role Progression:**
```
guest → new (signup) → member (email verified) → manager/admin/super_admin (promoted)
```

### API Classes & Rate Limits

| Class | Role | Max per page | Can see totals | Requests/min |
|-------|------|-------------|----------------|-------------|
| 0     | Guest/New   | 10        | ❌ | 10         |
| 5     | Member      | 100       | ❌ | 60         |
| 10    | Manager     | 250       | ❌ | 120        |
| 20    | Admin       | 500       | ✅ | 300       |
| 50    | Super Admin | Unlimited | ✅ | Unlimited |

---

## Complete Endpoint Reference

### Authentication Endpoints

#### POST /api/?@=auth.register
**Create new account**

Request:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "secure_password",
  "firstname": "John",
  "lastname": "Doe",
  "provider": "local"
}
```

Response:
```json
{
  "status": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "token": "jwt_token",
    "expires_in": 3600
  },
  "message": "Account created successfully"
}
```

---

#### POST /api/?@=auth.login
**Authenticate user**

Request:
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "status": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600,
    "role": "artist"
  },
  "message": "Login successful"
}
```

---

### Songs/Music Endpoints

#### GET /api/?@=songs.list
**List all songs (paginated)**

Query Params:
```
?page=1&limit=20&artist=wizkid&status=approved&genre=afrobeats
```

Response:
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
        "id": "song_uuid",
        "title": "Song Title",
        "artist_id": "artist_uuid",
        "artist_name": "Artist Name",
        "type": "single",
        "cover": "https://cdn.example.com/cover.jpg",
        "genre": "Afrobeats",
        "status": "approved",
        "created_at": "2026-02-01T10:30:00Z"
      }
    ]
  },
  "message": "Songs retrieved successfully"
}
```

---

#### POST /api/?@=songs.create
**Create new song/album**

Request:
```json
{
  "type": "single|album|medley",
  "title": "Song Title",
  "artist_id": "uuid",
  "genre": "Afrobeats",
  "language": "en",
  "upc": "optional-upc",
  "cover": "upload_id_or_url",
  "tracks": [
    {
      "track_number": 1,
      "title": "Track Title",
      "isrc": "USUM71234567",
      "mp3": "upload_id",
      "explicit": "no|yes|covered",
      "lyrics": "optional",
      "lead_vocal": "Artist Name",
      "producer": "Producer Name",
      "writer": "Writer Name"
    }
  ]
}
```

Response:
```json
{
  "status": true,
  "data": {
    "id": "song_uuid",
    "title": "Song Title",
    "artist_id": "uuid",
    "type": "single",
    "status": "new",
    "created_at": "2026-02-04T18:30:45Z",
    "tracks_count": 1
  },
  "message": "Song created successfully"
}
```

---

#### GET /api/?@=songs.get
**Get single song details**

Query Params:
```
?id=song_uuid
```

Response:
```json
{
  "status": true,
  "data": {
    "id": "song_uuid",
    "title": "Song Title",
    "artist_id": "artist_uuid",
    "artist_name": "Artist Name",
    "type": "single",
    "genre": "Afrobeats",
    "status": "approved",
    "cover": "https://cdn.example.com/cover.jpg",
    "number_of_tracks": 1,
    "tracks": [
      {
        "id": "track_uuid",
        "track_number": 1,
        "title": "Track Title",
        "isrc": "USUM71234567",
        "mp3": "https://cdn.example.com/song.mp3",
        "lyrics": "optional",
        "explicit": "no",
        "lead_vocal": "Artist Name"
      }
    ],
    "created_at": "2026-02-01T10:30:00Z",
    "updated_at": "2026-02-04T18:30:45Z"
  },
  "message": "Song retrieved successfully"
}
```

---

#### PATCH /api/?@=songs.update
**Update song metadata**

Request:
```json
{
  "id": "song_uuid",
  "title": "Updated Title",
  "genre": "Afrobeats",
  "status": "submitted"
}
```

Response:
```json
{
  "status": true,
  "data": {
    "id": "song_uuid",
    "title": "Updated Title",
    "updated_at": "2026-02-04T18:30:45Z"
  },
  "message": "Song updated successfully"
}
```

---

#### DELETE /api/?@=songs.delete
**Delete song (soft delete)**

Query Params:
```
?id=song_uuid
```

Response:
```json
{
  "status": true,
  "data": {
    "id": "song_uuid",
    "status": "deleted",
    "deleted_at": "2026-02-04T18:30:45Z"
  },
  "message": "Song deleted successfully"
}
```

---

### Upload Endpoints

#### POST /api/?@=uploads.start
**Initialize file upload**

Request:
```json
{
  "filename": "song.mp3",
  "size": 5242880,
  "mime_type": "audio/mpeg"
}
```

Response:
```json
{
  "status": true,
  "data": {
    "upload_id": "upload_uuid",
    "filename": "song.mp3",
    "status": "loading",
    "chunk_size": 1048576
  },
  "message": "Upload started"
}
```

---

#### POST /api/?@=uploads.chunk
**Upload file chunk**

Request:
```
Content-Type: application/octet-stream
Upload-ID: upload_uuid
Chunk-Number: 1
```

Binary file data in body

Response:
```json
{
  "status": true,
  "data": {
    "upload_id": "upload_uuid",
    "chunk_number": 1,
    "total_chunks": 5,
    "progress": 20
  },
  "message": "Chunk uploaded successfully"
}
```

---

#### POST /api/?@=uploads.complete
**Finalize upload**

Request:
```json
{
  "upload_id": "upload_uuid",
  "checksum": "sha256_hash"
}
```

Response:
```json
{
  "status": true,
  "data": {
    "upload_id": "upload_uuid",
    "status": "complete",
    "path": "/storage/uploads/file.mp3",
    "size": 5242880,
    "url": "https://cdn.example.com/file.mp3"
  },
  "message": "Upload completed successfully"
}
```

---

### User Endpoints

#### GET /api/?@=users.list
**List users (admin only)**

Response:
```json
{
  "status": true,
  "data": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "items": [
      {
        "id": "user_uuid",
        "email": "user@example.com",
        "username": "username",
        "role": "artist",
        "status": "active",
        "created_at": "2026-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

#### GET /api/?@=users.profile
**Get current user profile**

Response:
```json
{
  "status": true,
  "data": {
    "id": "user_uuid",
    "email": "user@example.com",
    "username": "username",
    "firstname": "John",
    "lastname": "Doe",
    "role": "artist",
    "status": "active",
    "platform": "web",
    "language": "en",
    "socials": {
      "instagram": "https://instagram.com/username",
      "twitter": "https://twitter.com/username",
      "tiktok": "https://tiktok.com/@username"
    }
  },
  "message": "Profile retrieved successfully"
}
```

---

#### PATCH /api/?@=users.update
**Update user profile**

Request:
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "language": "en",
  "socials": {
    "instagram": "https://instagram.com/newhandle"
  }
}
```

Response:
```json
{
  "status": true,
  "data": {
    "id": "user_uuid",
    "updated_at": "2026-02-04T18:30:45Z"
  },
  "message": "Profile updated successfully"
}
```

---

### Admin Endpoints

#### GET /api/?@=admin.approvals
**List songs pending approval**

Response:
```json
{
  "status": true,
  "data": {
    "total": 25,
    "pending": [
      {
        "id": "song_uuid",
        "title": "Song Title",
        "artist_id": "artist_uuid",
        "artist_name": "Artist Name",
        "status": "checking",
        "submitted_at": "2026-02-03T10:30:00Z"
      }
    ]
  },
  "message": "Pending approvals retrieved"
}
```

---

#### PATCH /api/?@=admin.approve
**Approve song**

Request:
```json
{
  "song_id": "song_uuid",
  "status": "approved",
  "note": "Ready for distribution"
}
```

Response:
```json
{
  "status": true,
  "data": {
    "song_id": "song_uuid",
    "status": "approved",
    "approved_at": "2026-02-04T18:30:45Z"
  },
  "message": "Song approved successfully"
}
```

---

#### PATCH /api/?@=admin.flag
**Flag song for issues**

Request:
```json
{
  "song_id": "song_uuid",
  "flag_type": "flag_cover|flag_song|copyright",
  "reason": "Detailed reason for flag",
  "details": {}
}
```

Response:
```json
{
  "status": true,
  "data": {
    "song_id": "song_uuid",
    "status": "flagged",
    "flag_type": "flag_cover",
    "flagged_at": "2026-02-04T18:30:45Z"
  },
  "message": "Song flagged successfully"
}
```

---

### Admin Management Extensions

#### Entity Ownership & Admin Assignment
All admin-controlled entities include creator/manager fields for auditability and access control:

```json
{
  "created_by": "user_uuid",
  "managed_by": "admin_user_uuid",
  "approved_by": "admin_user_uuid"
}
```

#### Admin Alerts, Flags, and User Actions
```
GET  /api/?@=admin.alerts.list
PATCH /api/?@=admin.alerts.edit
PATCH /api/?@=admin.alerts.flag
PATCH /api/?@=admin.alerts.suspend
PATCH /api/?@=admin.alerts.clear

PATCH /api/?@=admin.users.suspend
PATCH /api/?@=admin.users.activate
PATCH /api/?@=admin.users.flag
PATCH /api/?@=admin.users.unflag
PATCH /api/?@=admin.users.delete
```

#### Admin Messaging & Notifications
```
POST /api/?@=admin.notify.user
POST /api/?@=admin.notify.group
POST /api/?@=admin.notify.all

POST /api/?@=admin.email.user
POST /api/?@=admin.email.group
POST /api/?@=admin.email.all
```

#### Admin Task Board
```
GET  /api/?@=admin.tasks.list
POST /api/?@=admin.tasks.create
PATCH /api/?@=admin.tasks.update
PATCH /api/?@=admin.tasks.assign
PATCH /api/?@=admin.tasks.complete
```

#### Admin Dashboard & KPI Monitoring (15s refresh)
```
GET /api/?@=admin.dashboard.stats
GET /api/?@=admin.kpi.system
GET /api/?@=admin.kpi.business
GET /api/?@=admin.kpi.royalty
```

Optional real-time stream:
```
WS /api/admin/kpi/stream
```

#### Royalty Management

**Royalty record (canonical):**
```json
{
  "id": "uuid",
  "period": "2026-Q1",
  "period_type": "monthly|quarterly",
  "upc": "199350886072",
  "isrc": "USRC12345678",
  "track_name": "Ikuku",
  "song_title": "Ikuku EP",
  "artist_name": "Mezyblack",
  "record_label": "Singflex",
  "gross_amount_usd": 1500.00,
  "deductions_percent": 15,
  "deductions_usd": 225.00,
  "net_amount_usd": 1275.00,
  "payment_status": "pending|paid|processing",
  "song_id": "uuid",
  "track_id": "uuid",
  "artist_id": "uuid",
  "user_id": "uuid",
  "manager_id": "uuid",
  "match_status": "matched|partial|unmatched"
}
```

**Royalty endpoints:**
```
POST /api/?@=admin.royalty.import
GET  /api/?@=admin.royalty.list
GET  /api/?@=admin.royalty.unmatched
POST /api/?@=admin.royalty.match
POST /api/?@=admin.royalty.auto_match
POST /api/?@=admin.royalty.calculate
POST /api/?@=admin.royalty.approve
POST /api/?@=admin.royalty.mark_paid
GET  /api/?@=admin.royalty.report.period
GET  /api/?@=admin.royalty.report.artist
GET  /api/?@=admin.royalty.report.label
GET  /api/?@=admin.royalty.export
```

**User inflow queries:**
```
GET /api/?@=admin.royalty.user_inflow?user_id=uuid
GET /api/?@=admin.royalty.user_inflow?artist_id=uuid
GET /api/?@=admin.royalty.user_inflow?song_id=23328#1
```

**Track notation:** `{song_id}#{track_number}`
- Singles use `#1`
- Albums use track position (e.g., `474#4`)
- Medley uses position within the medley track

## dxlApiClient - Frontend Integration

### Overview

The `dxlApiClient` is a lightweight JavaScript class that handles all API communication for web and web-based applications.

### Installation

**Option 1: Direct Script Tag**
```html
<script src="/api/client/dxlApiClient.js"></script>
```

**Option 2: NPM Module** (Coming Soon)
```bash
npm install @imediaport/dxlapiclient
```

---

### Basic Usage

```javascript
// Initialize client
const api = new DxlApiClient({
  baseUrl: 'http://localhost/api',
  apiKey: 'your-api-key',
  platform: 'web',
  platformVersion: '1.0.0',
  debug: true
});

// Make a request
api.request('@=songs.list', {
  method: 'GET',
  params: { page: 1, limit: 20 }
}).then(response => {
  console.log('Songs:', response.data.items);
}).catch(error => {
  console.error('Error:', error);
});
```

---

### Complete API Reference

#### Constructor

```javascript
const api = new DxlApiClient(config);
```

**Config Options:**
```javascript
{
  baseUrl: 'http://localhost/api',      // API base URL
  apiKey: 'your-api-key',               // API key
  jwtToken: 'optional-jwt-token',       // Optional JWT
  platform: 'web',                      // web|mobile|desktop
  platformVersion: '1.0.0',             // Your app version
  timeout: 15000,                       // Request timeout (ms)
  debug: false,                         // Enable console logs
  headers: {}                           // Custom headers
}
```

---

#### Core Methods

**request(action, options)**
```javascript
api.request('@=songs.list', {
  method: 'GET',
  params: { page: 1, limit: 20 },
  headers: { 'X-Custom': 'value' },
  timeout: 30000
})
.then(response => {
  // response.data, response.message, response.info
})
.catch(error => {
  // error.code, error.message, error.response
});
```

---

**GET(action, params)**
```javascript
api.get('@=songs.list', { page: 1, limit: 20 })
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

---

**POST(action, body)**
```javascript
api.post('@=songs.create', {
  title: 'My Song',
  artist_id: 'uuid',
  tracks: [...]
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

---

**PATCH(action, id, updates)**
```javascript
api.patch('@=songs.update', 'song_uuid', {
  title: 'Updated Title',
  status: 'submitted'
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

---

**DELETE(action, id)**
```javascript
api.delete('@=songs.delete', 'song_uuid')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

---

#### Authentication Methods

**setToken(token)**
```javascript
api.setToken('new-jwt-token');
```

---

**clearToken()**
```javascript
api.clearToken();
```

---

**getToken()**
```javascript
const token = api.getToken();
```

---

**setApiKey(key)**
```javascript
api.setApiKey('new-api-key');
```

---

#### Response Handling

**All responses follow standard structure:**
```javascript
{
  info: {
    action_requested: 'songs.list',
    response_module: 'songs',
    module_version: '1.0.0',
    timestamp: '2026-02-04T18:30:45Z',
    request_id: 'req_xxx',
    execution_time_ms: 45.2,
    memory_usage: '2.34 MB'
  },
  status: true,
  data: {...},
  message: 'Success',
  vendor: {...}
}
```

---

#### Error Handling

```javascript
api.post('@=songs.create', songData)
  .then(response => {
    if (response.status) {
      console.log('Created:', response.data.id);
    }
  })
  .catch(error => {
    // Network error
    if (error.code === 'NETWORK_ERROR') {
      console.error('Network failed:', error.message);
    }
    // API returned error
    if (error.response && !error.response.status) {
      console.error('API Error:', error.response.message);
      console.error('Details:', error.response.error_details);
    }
  });
```

---

### Frontend Integration Examples

#### React Example

```jsx
import React, { useState, useEffect } from 'react';

function SongsComponent() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const api = new DxlApiClient({
      baseUrl: process.env.REACT_APP_API_URL,
      apiKey: process.env.REACT_APP_API_KEY
    });

    setLoading(true);
    api.get('@=songs.list', { page: 1, limit: 20 })
      .then(response => {
        setSongs(response.data.items);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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

export default SongsComponent;
```

---

#### Vue 3 Example

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <div v-for="song in songs" :key="song.id">
        <h3>{{ song.title }}</h3>
        <p>{{ song.artist_name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const songs = ref([]);
const loading = ref(false);
const error = ref(null);

onMounted(async () => {
  const api = new DxlApiClient({
    baseUrl: import.meta.env.VITE_API_URL,
    apiKey: import.meta.env.VITE_API_KEY
  });

  try {
    loading.value = true;
    const response = await api.get('@=songs.list', { page: 1, limit: 20 });
    songs.value = response.data.items;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>
```

---

#### Vanilla JavaScript Example

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  const api = new DxlApiClient({
    baseUrl: 'http://localhost/api',
    apiKey: 'dev-key-123'
  });

  try {
    const response = await api.get('@=songs.list', { page: 1, limit: 20 });
    
    const list = document.getElementById('songs-list');
    response.data.items.forEach(song => {
      const item = document.createElement('div');
      item.innerHTML = `
        <h3>${song.title}</h3>
        <p>${song.artist_name}</p>
        <p>Genre: ${song.genre}</p>
      `;
      list.appendChild(item);
    });
  } catch (error) {
    console.error('Failed to load songs:', error);
  }
});
```

---

### Advanced Features

#### Request Interceptors

```javascript
api.interceptors.request.use((config) => {
  // Modify request before sending
  config.headers['X-Custom-Header'] = 'value';
  return config;
});
```

---

#### Response Interceptors

```javascript
api.interceptors.response.use(
  (response) => {
    // Process successful response
    return response;
  },
  (error) => {
    // Handle error
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

---

#### Batch Requests

```javascript
Promise.all([
  api.get('@=songs.list', { page: 1 }),
  api.get('@=users.profile'),
  api.get('@=admin.approvals')
])
.then(([songs, profile, approvals]) => {
  console.log('All data loaded');
})
.catch(error => console.error(error));
```

---

## Mobile Integration Guide

### iOS/Swift Integration

#### Using URLSession (Native)

```swift
import Foundation

class ApiClient {
    let baseUrl = "http://localhost/api"
    let apiKey = "your-api-key"
    
    func request(action: String, method: String = "GET", body: [String: Any]? = nil) async throws -> [String: Any] {
        var urlComponents = URLComponents(string: baseUrl)
        urlComponents?.queryItems = [URLQueryItem(name: "@", value: action)]
        
        guard let url = urlComponents?.url else { throw URLError(.badURL) }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue(apiKey, forHTTPHeaderField: "X-API-KEY")
        request.setValue("mobile", forHTTPHeaderField: "X-PLATFORM")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if let body = body {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        return json ?? [:]
    }
}

// Usage
let client = ApiClient()
let songs = try await client.request(action: "songs.list")
```

---

#### Using Alamofire (Popular Library)

```swift
import Alamofire

class ApiClient {
    let baseUrl = "http://localhost/api"
    let apiKey = "your-api-key"
    
    func getSongs(page: Int = 1, limit: Int = 20) async throws -> [String: Any] {
        let parameters: [String: Any] = [
            "@": "songs.list",
            "page": page,
            "limit": limit
        ]
        
        let headers: HTTPHeaders = [
            "X-API-KEY": apiKey,
            "X-PLATFORM": "mobile",
            "Content-Type": "application/json"
        ]
        
        let response = try await AF.request(
            baseUrl,
            parameters: parameters,
            headers: headers
        ).serializingDecodable([String: Any].self).value
        
        return response
    }
}
```

---

### Android/Kotlin Integration

#### Using OkHttp (Native)

```kotlin
import okhttp3.*
import kotlinx.serialization.json.JsonObject

class ApiClient(val baseUrl: String, val apiKey: String) {
    private val client = OkHttpClient()
    
    suspend fun getSongs(page: Int = 1, limit: Int = 20): JsonObject {
        val url = HttpUrl.parse(baseUrl)?.newBuilder()
            ?.addQueryParameter("@", "songs.list")
            ?.addQueryParameter("page", page.toString())
            ?.addQueryParameter("limit", limit.toString())
            ?.build()
        
        val request = Request.Builder()
            .url(url!!)
            .header("X-API-KEY", apiKey)
            .header("X-PLATFORM", "mobile")
            .header("Content-Type", "application/json")
            .build()
        
        return withContext(Dispatchers.IO) {
            val response = client.newCall(request).execute()
            Json.parseToJsonElement(response.body?.string() ?: "{}") as JsonObject
        }
    }
}
```

---

#### Using Retrofit

```kotlin
import retrofit2.http.*

interface ApiService {
    @GET(".")
    suspend fun getSongs(
        @Query("@") action: String = "songs.list",
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Header("X-API-KEY") apiKey: String,
        @Header("X-PLATFORM") platform: String = "mobile"
    ): ApiResponse<List<Song>>
}

// Usage
val retrofit = Retrofit.Builder()
    .baseUrl("http://localhost/api")
    .addConverterFactory(GsonConverterFactory.create())
    .build()

val service = retrofit.create(ApiService::class.java)
val songs = service.getSongs(apiKey = "your-key")
```

---

### React Native Integration

```javascript
// app/services/apiClient.js
export class DxlApiClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost/api';
    this.apiKey = config.apiKey;
    this.platform = 'mobile';
    this.platformVersion = config.platformVersion || '1.0.0';
  }

  async request(action, options = {}) {
    const url = new URL(this.baseUrl);
    url.searchParams.append('@', action);
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = {
      'X-API-KEY': this.apiKey,
      'X-PLATFORM': this.platform,
      'X-PLATFORM-VERSION': this.platformVersion,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const config = {
      method: options.method || 'GET',
      headers,
      timeout: options.timeout || 15000
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url.toString(), config);
    return await response.json();
  }

  async get(action, params = {}) {
    return this.request(action, { method: 'GET', params });
  }

  async post(action, body) {
    return this.request(action, { method: 'POST', body });
  }
}

// Usage in component
import { DxlApiClient } from './services/apiClient';
import { useEffect, useState } from 'react';

export function SongsScreen() {
  const [songs, setSongs] = useState([]);
  const api = new DxlApiClient({ apiKey: 'your-key' });

  useEffect(() => {
    api.get('@=songs.list', { page: 1, limit: 20 })
      .then(response => setSongs(response.data.items))
      .catch(error => console.error(error));
  }, []);

  return (
    <ScrollView>
      {songs.map(song => (
        <Text key={song.id}>{song.title}</Text>
      ))}
    </ScrollView>
  );
}
```

---

### Flutter Integration

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class DxlApiClient {
  final String baseUrl;
  final String apiKey;
  final String platform = 'mobile';

  DxlApiClient({
    required this.baseUrl,
    required this.apiKey,
  });

  Future<Map<String, dynamic>> request(
    String action, {
    String method = 'GET',
    Map<String, dynamic>? body,
    Map<String, String>? params,
  }) async {
    final uri = Uri.parse(baseUrl).replace(
      queryParameters: {
        '@': action,
        ...?params,
      },
    );

    final headers = {
      'X-API-KEY': apiKey,
      'X-PLATFORM': platform,
      'Content-Type': 'application/json',
    };

    http.Response response;

    switch (method.toUpperCase()) {
      case 'POST':
        response = await http.post(
          uri,
          headers: headers,
          body: jsonEncode(body ?? {}),
        );
        break;
      case 'PATCH':
        response = await http.patch(
          uri,
          headers: headers,
          body: jsonEncode(body ?? {}),
        );
        break;
      case 'DELETE':
        response = await http.delete(uri, headers: headers);
        break;
      default:
        response = await http.get(uri, headers: headers);
    }

    return jsonDecode(response.body);
  }

  Future<Map<String, dynamic>> getSongs({int page = 1, int limit = 20}) {
    return request(
      'songs.list',
      params: {'page': page.toString(), 'limit': limit.toString()},
    );
  }
}

// Usage in widget
class SongsScreen extends StatefulWidget {
  @override
  _SongsScreenState createState() => _SongsScreenState();
}

class _SongsScreenState extends State<SongsScreen> {
  late DxlApiClient api;
  List<dynamic> songs = [];
  bool loading = false;

  @override
  void initState() {
    super.initState();
    api = DxlApiClient(
      baseUrl: 'http://localhost/api',
      apiKey: 'your-key',
    );
    _loadSongs();
  }

  void _loadSongs() async {
    setState(() => loading = true);
    try {
      final response = await api.getSongs();
      setState(() {
        songs = response['data']['items'] ?? [];
      });
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return Center(child: CircularProgressIndicator());
    
    return ListView.builder(
      itemCount: songs.length,
      itemBuilder: (context, index) {
        final song = songs[index];
        return ListTile(
          title: Text(song['title']),
          subtitle: Text(song['artist_name']),
        );
      },
    );
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "info": {...},
  "status": false,
  "data": null,
  "message": "User-friendly error message",
  "error_details": {
    "code": 422,
    "type": "ValidationError",
    "details": {
      "field": "email",
      "reason": "Email already exists"
    }
  }
}
```

---

### Common Error Codes

| Code | Type | Meaning | Action |
|------|------|---------|--------|
| 400 | BadRequest | Invalid request format | Check request syntax |
| 401 | Unauthorized | Missing/invalid auth | Provide valid token |
| 403 | Forbidden | Insufficient permissions | Check user role |
| 404 | NotFound | Resource not found | Verify resource ID |
| 422 | ValidationError | Invalid data | Fix validation errors |
| 429 | RateLimited | Too many requests | Wait before retrying |
| 500 | InternalError | Server error | Contact support |

---

### Frontend Error Handling Best Practices

```javascript
// React component
function SongsList() {
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('@=songs.list')
      .catch(error => {
        if (error.code === 'NETWORK_ERROR') {
          setError('Network connection failed. Please check your internet.');
        } else if (error.response?.status === 401) {
          setError('Your session expired. Please log in again.');
        } else if (error.response?.status === 429) {
          setError('Too many requests. Please wait a moment.');
        } else {
          setError(error.message || 'An unexpected error occurred.');
        }
      });
  }, []);

  if (error) return <ErrorBoundary message={error} />;
  return <SongsDisplay />;
}
```

---

## Implementation Checklist

### Phase 1: Backend Setup (Week 1)
- [ ] Create Music Catalog Handler (`SongsHandler`)
- [ ] Create Upload Manager Handler (`UploadsHandler`)
- [ ] Create Auth Handler (`AuthHandler`)
- [ ] Create Admin Handler (`AdminHandler`)
- [ ] Database schema for songs, tracks, uploads
- [ ] Validation rules per endpoint
- [ ] Error handling middleware

### Phase 2: API Documentation (Week 2)
- [ ] Generate OpenAPI specification
- [ ] Create Postman collection
- [ ] Write endpoint documentation
- [ ] Add example requests/responses
- [ ] Setup API documentation portal

### Phase 3: Frontend Client (Week 3)
- [ ] Build dxlApiClient.js library
- [ ] Create React integration examples
- [ ] Create Vue 3 integration examples
- [ ] Setup TypeScript definitions
- [ ] Create NPM package

### Phase 4: Mobile Integration (Week 4)
- [ ] iOS/Swift integration guide
- [ ] Android/Kotlin integration guide
- [ ] React Native example app
- [ ] Flutter example app
- [ ] Mobile SDK release

### Phase 5: Testing & QA (Week 5)
- [ ] Unit tests for handlers
- [ ] Integration tests for endpoints
- [ ] Load testing
- [ ] Security testing
- [ ] Mobile app testing

### Phase 6: Documentation & Release (Week 6)
- [ ] Complete API documentation
- [ ] Mobile developer guide
- [ ] Frontend developer guide
- [ ] Deployment guide
- [ ] Release notes

---

## Approval Checklist

Before proceeding with implementation, please verify:

- [ ] Request structure (@=action.operation) is correct
- [ ] Response envelope format is acceptable
- [ ] Authentication approach (API Key + JWT) is approved
- [ ] Error handling strategy is acceptable
- [ ] Endpoint list is complete
- [ ] dxlApiClient architecture is suitable
- [ ] Mobile integration examples are appropriate
- [ ] Timeline and deliverables are realistic

---

**Document Status:** ✅ READY FOR REVIEW AND APPROVAL

Once you approve this specification, we will proceed with:
1. Creating dxlApiClient.js (Frontend)
2. Creating mobile SDKs (iOS/Android/React Native/Flutter)
3. Building handlers for each module
4. Comprehensive implementation guides
5. Full test coverage

---

**Next Steps:**
1. Review this comprehensive guide
2. Provide feedback/modifications
3. Approve for implementation
4. Begin Phase 1 (Backend Setup)

