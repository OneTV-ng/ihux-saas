# Artist Song Upload API Documentation

## Overview

The Artist Song Upload API provides a **RESTful, incremental approach** to music uploads. Artists create a song, progressively add tracks and metadata, and then submit for admin review. This design allows:

- **Progress persistence**: Server-side state saves if browser closes
- **Concurrent uploads**: Upload multiple tracks simultaneously
- **Error recovery**: Individual track failures don't affect entire submission
- **Atomic operations**: All data changes are transactional
- **Clear separation**: Artists submit → Admins publish

---

## Architecture & Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARTIST SUBMISSION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. CREATE SONG
   POST /api/songs/create
   → Returns: songId, status="new"

2. UPLOAD FILES (Optional - Cover, Tracks)
   POST /api/upload/file
   → Returns: uploadId, URL, metadata

3. ADD TRACKS (Repeat for each track)
   POST /api/songs/[songId]/tracks
   → Auto-increments track numbers
   → Returns: Updated song with all tracks

4. SUBMIT FOR REVIEW
   POST /api/songs/[songId]/submit
   → Changes status: "new" → "submitted"
   → Validates track count

5. ADMIN REVIEW
   (Admin-only endpoints, not documented here)
   → Status: "submitted" → "checking" → "approved"/"flagged"
```

---

## API Endpoints

### 1. Create Song
Create a new song record with metadata.

**Endpoint:** `POST /api/songs/create`

**Authentication:** Required (Session-based)

**Request Body:**
```json
{
  "title": "My Song",
  "type": "single",
  "artistId": "uuid-here",
  "artistName": "Artist Name",
  "genre": "Pop",
  "language": "en",
  "upc": "1234567890123",
  "cover": "upload-id-or-url",
  "copyrightAcknowledged": true
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Song/album title |
| `type` | enum | ✅ | One of: `single`, `album`, `medley` |
| `artistId` | string | ✅ | UUID of artist (user must own) |
| `artistName` | string | ✅ | Display name of artist |
| `genre` | string | | Genre classification |
| `language` | string | | Language code (default: "en") |
| `upc` | string | | Universal Product Code |
| `cover` | string | | Upload ID or URL for cover image |
| `copyrightAcknowledged` | boolean | ✅ | Must be true |

**Success Response (200):**
```json
{
  "success": true,
  "songId": "uuid-here",
  "song": {
    "id": "uuid-here",
    "title": "My Song",
    "artistId": "uuid-here",
    "artistName": "Artist Name",
    "type": "single",
    "genre": "Pop",
    "language": "en",
    "upc": "1234567890123",
    "cover": "upload-id-or-url",
    "numberOfTracks": 0,
    "status": "new",
    "createdAt": "2026-02-12T10:00:00Z",
    "updatedAt": "2026-02-12T10:00:00Z"
  },
  "processingTime": 45
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Title is required | Missing required field |
| 400 | Type must be one of: single, album, medley | Invalid song type |
| 400 | Copyright acknowledgement is required | Must accept copyright terms |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | User doesn't own artist |
| 500 | Server error | Database or system error |

---

### 2. Upload File
Upload audio, cover, or document files.

**Endpoint:** `POST /api/upload/file`

**Authentication:** Required

**Request:** `multipart/form-data`

```
Content-Type: multipart/form-data

file: <binary file>
type: "audio" | "cover" | "document"
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ | Binary file to upload |
| `type` | enum | ✅ | Upload type: `audio`, `cover`, `document` |

**File Limits:**

| Type | Max Size | Formats |
|------|----------|---------|
| audio | 100 MB | MP3 |
| cover | 10 MB | JPG, PNG |
| document | 20 MB | Any |

**Success Response (200):**
```json
{
  "success": true,
  "upload": {
    "id": "upload-uuid",
    "url": "/uploads/user-uuid/audio/timestamp_uploadid.mp3",
    "filename": "timestamp_uploadid.mp3",
    "originalName": "my-song.mp3",
    "mimeType": "audio/mpeg",
    "size": 5242880,
    "metadata": {
      "duration": 180,
      "bitrate": 320,
      "sampleRate": 44100
    },
    "status": "complete",
    "progress": 100,
    "createdAt": "2026-02-12T10:00:00Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Only MP3 files are supported | Invalid audio format |
| 400 | File too large | Exceeds size limit |
| 401 | Unauthorized | Not authenticated |
| 500 | Upload failed | Server error |

**Metadata Extracted:**

For **audio files**:
- `duration` (seconds)
- `bitrate` (kbps)
- `sampleRate` (Hz)
- `channels`

For **images**:
- `width` (pixels)
- `height` (pixels)
- `format` (png, jpeg, etc.)

---

### 3. Add Track
Add a track to an existing song.

**Endpoint:** `POST /api/songs/[songId]/tracks`

**Authentication:** Required (User must own song)

**Request Body:**
```json
{
  "title": "Track 1",
  "audioFileUploadId": "upload-uuid",
  "duration": 180,
  "isrc": "USRC17607839",
  "explicit": "no",
  "lyrics": "Song lyrics here...",
  "leadVocal": "Lead Artist Name",
  "featured": "Featured Artist",
  "producer": "Producer Name",
  "writer": "Songwriter Name"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Track title |
| `audioFileUploadId` | string | ✅ | UUID from `/api/upload/file` response |
| `duration` | number | | Duration in seconds |
| `isrc` | string | | International Standard Recording Code |
| `explicit` | enum | | One of: `no`, `yes`, `covered` |
| `lyrics` | string | | Full lyrics text |
| `leadVocal` | string | | Lead vocalist name |
| `featured` | string | | Featured artist name |
| `producer` | string | | Producer name |
| `writer` | string | | Songwriter name |

**Success Response (200):**
```json
{
  "success": true,
  "track": {
    "id": "track-uuid",
    "songId": "song-uuid",
    "trackNumber": 1,
    "title": "Track 1",
    "mp3": "/uploads/user-uuid/audio/file.mp3",
    "explicit": "no",
    "duration": 180,
    "isrc": "USRC17607839",
    "leadVocal": "Lead Artist",
    "featured": "Featured Artist",
    "producer": "Producer Name",
    "writer": "Songwriter Name",
    "createdAt": "2026-02-12T10:00:00Z"
  },
  "song": {
    "id": "song-uuid",
    "title": "My Song",
    "numberOfTracks": 1,
    "status": "new",
    "tracks": [ /* all tracks array */ ]
  },
  "processingTime": 120
}
```

**Track Numbers:**
- Auto-incremented: Track 1, 2, 3, etc.
- Cannot manually set
- Automatically updated when tracks are added

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Track title is required | Missing title |
| 400 | Audio file upload ID is required | Missing upload reference |
| 404 | Song not found | Song doesn't exist |
| 404 | Audio file upload not found | Upload ID invalid |
| 403 | Forbidden - song doesn't belong to you | User doesn't own song |
| 409 | Cannot add tracks to submitted songs | Song status != "new" |
| 401 | Unauthorized | Not authenticated |
| 500 | Failed to add track | Server error |

---

### 4. Submit Song
Submit song for admin review.

**Endpoint:** `POST /api/songs/[songId]/submit`

**Authentication:** Required (User must own song)

**Request Body:**
```json
{}
```

(Empty body, songId in URL only)

**Success Response (200):**
```json
{
  "success": true,
  "song": {
    "id": "song-uuid",
    "title": "My Song",
    "artistName": "Artist Name",
    "type": "single",
    "numberOfTracks": 1,
    "status": "submitted",
    "createdAt": "2026-02-12T10:00:00Z",
    "updatedAt": "2026-02-12T10:00:01Z"
  },
  "tracks": [
    {
      "id": "track-uuid",
      "trackNumber": 1,
      "title": "Track 1",
      "duration": 180
    }
  ],
  "message": "Song submitted for review successfully. Admin will review and approve or reject.",
  "processingTime": 85
}
```

**Validation Rules:**

Before submission, system validates:

1. **Song status must be "new"**
   - Cannot resubmit already submitted songs
   - Error: 409 Conflict

2. **Song must have at least 1 track**
   - Error: 400 Bad Request

3. **Track count must match song type:**

   | Type | Min Tracks | Max Tracks |
   |------|-----------|-----------|
   | single | 1 | 1 |
   | medley | 2 | 4 |
   | album | 5 | ∞ |

   - Error: 400 Bad Request with specific message

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Song must have at least one track | No tracks added |
| 400 | Single must have exactly 1 track | Wrong track count |
| 400 | Medley must have 2-4 tracks | Wrong track count |
| 400 | Album must have at least 5 tracks | Wrong track count |
| 404 | Song not found | Song doesn't exist |
| 403 | Forbidden - song doesn't belong to you | User doesn't own song |
| 409 | Song has already been submitted | Status != "new" |
| 401 | Unauthorized | Not authenticated |
| 500 | Failed to submit song | Server error |

---

### 5. Get Song (With Tracks)
Fetch song with all associated tracks.

**Endpoint:** `GET /api/songs/[songId]`

**Authentication:** Not required (Public endpoint)

**Request Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `songId` | string (URL) | UUID of song |

**Success Response (200):**
```json
{
  "success": true,
  "song": {
    "id": "song-uuid",
    "title": "My Song",
    "artistId": "artist-uuid",
    "artistName": "Artist Name",
    "type": "single",
    "genre": "Pop",
    "language": "en",
    "upc": "1234567890123",
    "cover": "/uploads/...",
    "numberOfTracks": 1,
    "isFeatured": false,
    "plays": 0,
    "status": "submitted",
    "duration": 180,
    "releaseDate": null,
    "createdAt": "2026-02-12T10:00:00Z",
    "updatedAt": "2026-02-12T10:00:01Z"
  },
  "tracks": [
    {
      "id": "track-uuid",
      "songId": "song-uuid",
      "trackNumber": 1,
      "title": "Track 1",
      "isrc": "USRC17607839",
      "mp3": "/uploads/user-uuid/audio/file.mp3",
      "explicit": "no",
      "lyrics": "Song lyrics...",
      "leadVocal": "Lead Artist",
      "featured": "Featured Artist",
      "producer": "Producer Name",
      "writer": "Songwriter Name",
      "duration": 180,
      "createdAt": "2026-02-12T10:00:00Z"
    }
  ]
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 404 | Song not found | Invalid songId |
| 500 | Failed to fetch song | Server error |

---

## Status Workflow

### Song Status Transitions

```
Created          Submitted        Admin Review       Final Status
─────────────────────────────────────────────────────────────────
     ↓                ↓                  ↓                ↓
   "new"      →   "submitted"   →   "checking"   →   "approved"
   (artist)       (artist)           (admin)          (admin)
                                        ↓
                                    "flagged"
                                    (admin)
                                        ↓
                                    "rejected"
                                    (admin)
```

### Artist Actions by Status

| Status | Can Add Tracks? | Can Submit? | Can Edit Metadata? |
|--------|---|---|---|
| `new` | ✅ Yes | ✅ Yes | ✅ Yes |
| `submitted` | ❌ No | ❌ No | ❌ No |
| `checking` | ❌ No | ❌ No | ❌ No |
| `approved` | ❌ No | ❌ No | ❌ No |
| `flagged` | ❌ No | ❌ No | ❌ No |
| `rejected` | ❌ No | ❌ No | ❌ No |

---

## Frontend Integration

### Using FileUploadService

```typescript
import { fileUploadService } from "@/lib/file-upload-service";

// Simple upload without progress
const uploadResult = await fileUploadService.uploadFile(
  audioFile,
  "audio"
);

// Upload with progress tracking
const uploadResult = await fileUploadService.uploadFileWithProgress(
  audioFile,
  "audio",
  (percent) => {
    console.log(`Upload progress: ${percent}%`);
    setProgress(percent);
  }
);

// Upload with cancellation support
const { promise, cancel } = fileUploadService.uploadFileWithCancel(
  audioFile,
  "audio",
  (percent) => setProgress(percent)
);

// Cancel if needed
cancel();
```

### Complete Upload Flow Example

```typescript
import { useState } from "react";
import { fileUploadService } from "@/lib/file-upload-service";

export function MusicUploadForm() {
  const [songId, setSongId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Step 1: Create Song
  async function createSong() {
    const response = await fetch("/api/songs/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "My Song",
        type: "single",
        artistId: "artist-uuid",
        artistName: "Artist Name",
        genre: "Pop",
        copyrightAcknowledged: true,
      }),
    });

    const data = await response.json();
    setSongId(data.songId);
    return data.songId;
  }

  // Step 2: Upload Cover Image
  async function uploadCover(coverFile: File, songIdValue: string) {
    const uploadResult = await fileUploadService.uploadFileWithProgress(
      coverFile,
      "cover",
      (percent) => setProgress(percent)
    );

    // Optionally update song with cover
    // await fetch(`/api/songs/${songIdValue}`, ...)

    return uploadResult;
  }

  // Step 3: Upload Track Audio
  async function uploadTrack(audioFile: File) {
    const uploadResult = await fileUploadService.uploadFileWithProgress(
      audioFile,
      "audio",
      (percent) => setProgress(percent)
    );
    return uploadResult;
  }

  // Step 4: Add Track to Song
  async function addTrack(trackData: TrackFormData) {
    const response = await fetch(`/api/songs/${songId}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: trackData.title,
        audioFileUploadId: trackData.uploadId, // From uploadTrack
        duration: trackData.duration,
        isrc: trackData.isrc,
        explicit: trackData.explicit,
      }),
    });

    return await response.json();
  }

  // Step 5: Submit Song
  async function submitSong() {
    const response = await fetch(`/api/songs/${songId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    return await response.json();
  }

  return (
    <div>
      {/* Your form UI here */}
    </div>
  );
}
```

### Using SongDisplay Component

```typescript
import SongDisplay from "@/components/song-display";

export function SongPage({ songId }: { songId: string }) {
  return (
    <div>
      <SongDisplay
        songId={songId}
        playbackMode="direct" // or "context"
      />
    </div>
  );
}
```

---

## Error Handling

### Common Error Patterns

```typescript
async function submitToApi(endpoint, body) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Handle specific HTTP errors
    if (response.status === 401) {
      // Redirect to login
      window.location.href = "/auth/signin";
      return;
    }

    if (response.status === 403) {
      // User doesn't have permission
      setError("You don't have permission to perform this action");
      return;
    }

    if (response.status === 409) {
      // Conflict - state mismatch
      const data = await response.json();
      setError(data.error); // "Cannot add tracks to submitted songs"
      return;
    }

    if (response.status === 400) {
      // Validation error
      const data = await response.json();
      setError(data.error); // Field-specific error
      return;
    }

    if (!response.ok) {
      throw new Error("Unexpected error");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    setError(error instanceof Error ? error.message : "Unknown error");
  }
}
```

### Retry Logic

```typescript
async function retryRequest(
  fn: () => Promise<any>,
  maxAttempts = 3,
  delayMs = 1000
) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, delayMs * attempt));
      }
    }
  }

  throw lastError;
}

// Usage
const result = await retryRequest(
  () => fileUploadService.uploadFile(file, "audio"),
  3,
  1000
);
```

---

## Data Validation

### Frontend Validation (Before API Call)

```typescript
function validateSongMetadata(data: SongMetadata): string[] {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push("Title is required");
  }

  if (!["single", "album", "medley"].includes(data.type)) {
    errors.push("Type must be single, album, or medley");
  }

  if (!data.artistId?.trim()) {
    errors.push("Artist is required");
  }

  if (!data.copyrightAcknowledged) {
    errors.push("You must acknowledge copyright terms");
  }

  return errors;
}

function validateTrackData(data: TrackData): string[] {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push("Track title is required");
  }

  if (!data.audioFileUploadId?.trim()) {
    errors.push("Audio file is required");
  }

  if (data.duration && data.duration < 10) {
    errors.push("Track must be at least 10 seconds");
  }

  return errors;
}
```

---

## Best Practices

### 1. Save Progress to LocalStorage

```typescript
const STORAGE_KEY = "music_upload_job";

function saveJobProgress(job: UploadJobData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    songId: job.songId,
    currentStep: job.currentStep,
    progress: job.progress,
    // Don't save File objects
  }));
}

function loadJobProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}

// Allow user to resume
if (loadJobProgress()) {
  // Show "Resume upload" option
}
```

### 2. Handle Network Failures

```typescript
function isNetworkError(error: any): boolean {
  return (
    error instanceof TypeError ||
    error.message.includes("network") ||
    error.message.includes("fetch")
  );
}

async function uploadWithRetry(file: File, type: string) {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      return await fileUploadService.uploadFileWithProgress(
        file,
        type,
        setProgress
      );
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) throw error;
      if (!isNetworkError(error)) throw error;

      // Wait before retry
      await new Promise(r => setTimeout(r, 1000 * attempts));
    }
  }
}
```

### 3. Concurrent Track Uploads

```typescript
async function uploadMultipleTracks(
  files: File[],
  songId: string
) {
  // Upload all files concurrently
  const uploadResults = await Promise.all(
    files.map(file =>
      fileUploadService.uploadFileWithProgress(
        file,
        "audio",
        (percent) => {
          // Update individual progress
        }
      )
    )
  );

  // Add tracks sequentially (to avoid race conditions)
  for (const uploadResult of uploadResults) {
    await fetch(`/api/songs/${songId}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: /* extract from file or form */,
        audioFileUploadId: uploadResult.id,
        duration: uploadResult.metadata?.duration,
      }),
    });
  }
}
```

---

## Rate Limiting & Quotas

No built-in rate limits currently implemented. Consider adding:

- **Per-user upload quota**: GB/month
- **File upload rate**: Max concurrent uploads per user
- **API rate limit**: Requests per minute per user

---

## Logging & Debugging

### Enable Debug Logs

```typescript
// Frontend
function enableDebugLogging() {
  // Save all API requests to console
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    console.log("[API]", args[0], args[1]);
    return originalFetch.apply(this, args);
  };
}
```

### Monitor Backend Logs

Check server logs for detailed operation logs:

```
🎵 [CREATE SONG] Song created with ID: uuid
📤 [ADD TRACK] Track 1 added: "My Track"
📤 [SUBMIT SONG] Song submitted with 5 tracks
```

---

## Support & Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Upload failed" after 10MB | File exceeds size limit (100MB audio, 10MB cover) |
| "Cannot add tracks to submitted songs" | Song already submitted; create new song |
| "Single must have exactly 1 track" | Remove extra tracks or change song type |
| "Copyright acknowledgement required" | Must accept copyright terms |
| Upload hangs indefinitely | Network issue; check connection, retry |
| "Song not found" after creation | Wrong songId used; verify from create response |

### Debugging Tips

1. **Check browser console** for JavaScript errors
2. **Check Network tab** for failed requests
3. **Verify songId** matches across requests
4. **Check localStorage** for saved progress
5. **Review server logs** for detailed error messages

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-12 | Initial release with 5 core endpoints |

---

**Documentation Last Updated:** February 12, 2026
