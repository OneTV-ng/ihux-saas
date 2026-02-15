# Quick Start - Incremental Upload API

## TL;DR - Basic Flow

```bash
# 1. Upload an audio file
curl -F "file=@song.mp3" -F "type=audio" http://localhost:3000/api/upload/file
# Response: { upload: { id: "UPLOAD_ID", url: "...", metadata: { duration: 180 } } }

# 2. Create a song
curl -X POST http://localhost:3000/api/songs/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Song",
    "type": "single",
    "artistId": "artist-uuid",
    "artistName": "Artist Name",
    "copyrightAcknowledged": true
  }'
# Response: { songId: "SONG_ID", song: { status: "new", numberOfTracks: 0 } }

# 3. Add track to song
curl -X POST http://localhost:3000/api/songs/SONG_ID/tracks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Track 1",
    "audioFileUploadId": "UPLOAD_ID",
    "duration": 180
  }'
# Response: { track: { trackNumber: 1 }, song: { numberOfTracks: 1 } }

# 4. Submit song for review
curl -X POST http://localhost:3000/api/songs/SONG_ID/submit
# Response: { success: true, song: { status: "submitted" } }

# 5. Get song details (public)
curl http://localhost:3000/api/songs/SONG_ID
# Response: { song: { ... }, tracks: [...] }
```

---

## API Endpoints at a Glance

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/upload/file` | POST | ✅ | Upload audio/cover file |
| `/api/songs/create` | POST | ✅ | Create new song |
| `/api/songs/[id]/tracks` | POST | ✅ | Add track to song |
| `/api/songs/[id]/submit` | POST | ✅ | Submit song for review |
| `/api/songs/[id]` | GET | ❌ | Get song details |

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { /* ... */ },
  "processingTime": 123
}
```

### Error
```json
{
  "error": "Human-readable error message",
  "status": 400
}
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Not logged in | Log in first |
| 403 Forbidden | Song belongs to another user | Create your own song |
| 404 Not Found | Song/upload doesn't exist | Check IDs are correct |
| 409 Conflict | Song already submitted | Create a new song |
| 400 Bad Request | Wrong track count for type | Single: 1, Medley: 2-4, Album: 5+ |

---

## Frontend Integration

### File Upload
```typescript
import { FileUploadService } from '@/lib/file-upload-service';

const uploader = new FileUploadService();
const file = document.getElementById('file-input').files[0];

const result = await uploader.uploadFileWithProgress(
  file,
  'audio',
  (percent) => console.log(`${percent}% uploaded`)
);

console.log('Upload ID:', result.id);
```

### Display Song
```typescript
import SongDisplay from '@/components/song-display';

<SongDisplay
  songId="song-uuid"
  playbackMode="direct"  // or "context"
/>
```

---

## Status Workflow

```
Artist creates → "new"
      ↓
Artist submits → "submitted"
      ↓
Admin reviews → "checking"
      ↓
Admin approves → "approved"
      ↓ or ↓
Admin rejects → "flagged"/"rejected"
```

---

## Track Count Rules

| Song Type | Min Tracks | Max Tracks |
|-----------|-----------|-----------|
| Single | 1 | 1 |
| Medley | 2 | 4 |
| Album | 5 | ∞ |

---

## Important Notes

1. **Create Song First** - Must create song before adding tracks
2. **Only New Songs** - Can't add tracks to submitted/approved songs
3. **Track Numbers Auto-Increment** - Don't provide track numbers yourself
4. **Optional Fields** - Only include non-empty optional fields
5. **User Ownership** - Can only modify your own songs

---

## Example: Complete Upload Flow

```typescript
// Step 1: Upload file
const audioFile = new File(['...'], 'song.mp3', { type: 'audio/mpeg' });
const uploadRes = await fetch('/api/upload/file', {
  method: 'POST',
  body: new FormData({
    file: audioFile,
    type: 'audio'
  })
});
const { upload } = await uploadRes.json();
const uploadId = upload.id;

// Step 2: Create song
const createRes = await fetch('/api/songs/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Song',
    type: 'single',
    artistId: 'artist-123',
    artistName: 'Artist Name',
    copyrightAcknowledged: true
  })
});
const { songId } = await createRes.json();

// Step 3: Add track
const trackRes = await fetch(`/api/songs/${songId}/tracks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Track 1',
    audioFileUploadId: uploadId,
    duration: 180,
    explicit: 'no'
  })
});
const { track } = await trackRes.json();
console.log(`Track ${track.trackNumber} added!`);

// Step 4: Submit
const submitRes = await fetch(`/api/songs/${songId}/submit`, {
  method: 'POST'
});
const { song } = await submitRes.json();
console.log(`Song submitted! Status: ${song.status}`);

// Step 5: Retrieve
const getRes = await fetch(`/api/songs/${songId}`);
const { song, tracks } = await getRes.json();
console.log(`Song has ${tracks.length} tracks`);
```

---

## Debugging Tips

1. **Check Console** - All endpoints log detailed stage information
2. **Use Postman** - Test endpoints with the provided examples
3. **Verify IDs** - Copy/paste IDs correctly (UUIDs with dashes)
4. **Check Status** - Verify song status matches operation (new, submitted, etc.)
5. **File Permissions** - Ensure `/public/uploads/` is writable

---

## Performance Tips

1. **Batch Uploads** - Upload multiple files concurrently
2. **Validate Early** - Check file size before uploading
3. **Show Progress** - Use progress callback for UX
4. **Retry Failed** - Implement retry for network errors
5. **Save State** - Store songId in localStorage for recovery

---

## For More Details

- **Full API Reference:** See `ARTIST_SONG_UPLOAD_API.md`
- **Testing Guide:** See `E2E_TEST_PLAN.md`
- **Implementation Details:** See `IMPLEMENTATION_COMPLETE.md`

---

## Support

For issues or questions:
1. Check error message (they're descriptive)
2. Review this quick start guide
3. Read full API documentation
4. Check console logs for details
5. Verify authentication is working
