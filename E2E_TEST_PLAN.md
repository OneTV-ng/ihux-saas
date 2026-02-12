# End-to-End Testing Plan - Incremental Music Upload System

## Overview
This document outlines the testing strategy for the incremental music upload system, which allows artists to:
1. Create a song with metadata
2. Add tracks progressively
3. Submit the song for admin review

## Prerequisites
- Node.js >= 20.9.0 (Required for Next.js 16)
- PostgreSQL database running
- Valid environment variables (.env.local configured)
- Test user account or authentication set up

## Test Scenarios

### Phase 1: Authentication & Authorization Tests

#### Test 1.1: Unauthenticated Access
**Expected:** All endpoints should return 401 Unauthorized
- [ ] `POST /api/songs/create` without session → 401
- [ ] `POST /api/songs/[songId]/tracks` without session → 401
- [ ] `POST /api/songs/[songId]/submit` without session → 401
- [ ] `POST /api/upload/file` without session → 401

#### Test 1.2: Session Verification
**Expected:** Session object contains valid user email
- [ ] `getServerSession()` returns valid ServerSession
- [ ] User email is correctly extracted from session
- [ ] Session persists across multiple API calls

---

### Phase 2: File Upload Tests

#### Test 2.1: Upload Audio File
**Steps:**
1. Prepare a valid MP3 file (min 10 seconds)
2. Call `POST /api/upload/file` with FormData
3. Expect successful response with uploadId

**Expected Response:**
```json
{
  "success": true,
  "upload": {
    "id": "uuid",
    "url": "/public/uploads/[userId]/audio/[filename]",
    "filename": "timestamp_uploadId.mp3",
    "mimeType": "audio/mpeg",
    "size": 123456,
    "metadata": {
      "duration": 180
    },
    "status": "complete",
    "createdAt": "2026-02-12T..."
  }
}
```

**Assertions:**
- [ ] Upload ID is generated correctly (UUID format)
- [ ] File exists at the specified path
- [ ] Metadata contains correct duration
- [ ] Database record created in uploads table
- [ ] Checksum calculated and stored

#### Test 2.2: Upload Cover Image
**Steps:**
1. Prepare a valid image file (JPEG/PNG, min 500x500px)
2. Call `POST /api/upload/file` with type="cover"
3. Expect successful response with URL

**Assertions:**
- [ ] Image dimensions extracted correctly
- [ ] File stored in `/public/uploads/[userId]/cover/` directory
- [ ] URL accessible publicly
- [ ] Metadata includes width/height

#### Test 2.3: Invalid File Upload
**Steps:**
1. Attempt to upload invalid file (e.g., .exe, empty file)
2. Expect error response

**Expected:** 400 Bad Request with error message
- [ ] File type validation works
- [ ] File size validation works
- [ ] Error message is descriptive

---

### Phase 3: Song Creation Tests

#### Test 3.1: Create Valid Single Song
**Request:**
```json
{
  "title": "Test Single",
  "type": "single",
  "artistId": "artist-uuid",
  "artistName": "Test Artist",
  "genre": "Pop",
  "language": "en",
  "copyrightAcknowledged": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "songId": "uuid",
  "song": {
    "id": "uuid",
    "title": "Test Single",
    "numberOfTracks": 0,
    "status": "new",
    "createdAt": "2026-02-12T..."
  }
}
```

**Assertions:**
- [ ] Song created with status="new"
- [ ] numberOfTracks initialized to 0
- [ ] songId returned is UUID format
- [ ] Database record created
- [ ] User correctly set as song creator

#### Test 3.2: Create Album
**Steps:**
1. Create song with type="album"
2. Verify song is created with numberOfTracks=0

**Assertions:**
- [ ] Album can be created
- [ ] Status defaults to "new"

#### Test 3.3: Missing Copyright Acknowledgement
**Request:**
```json
{
  "title": "Test",
  "type": "single",
  "artistId": "uuid",
  "artistName": "Artist",
  "copyrightAcknowledged": false
}
```

**Expected:** 400 Bad Request
- [ ] Error message: "Copyright acknowledgement required"

#### Test 3.4: Missing Required Fields
**Steps:**
1. Create song without title
2. Create song without type
3. Create song without artistId

**Expected:** 400 Bad Request for each
- [ ] Appropriate error messages for each missing field

---

### Phase 4: Track Addition Tests

#### Test 4.1: Add Single Track to Song
**Request:**
```json
{
  "title": "Track 1",
  "audioFileUploadId": "upload-uuid",
  "duration": 180,
  "explicit": "no"
}
```

**Expected Response:**
```json
{
  "success": true,
  "track": {
    "id": "uuid",
    "songId": "song-uuid",
    "trackNumber": 1,
    "title": "Track 1",
    "mp3": "/public/uploads/[userId]/audio/[filename]",
    "duration": 180,
    "explicit": "no"
  },
  "song": {
    "numberOfTracks": 1,
    "tracks": [...]
  }
}
```

**Assertions:**
- [ ] Track created with correct trackNumber (1)
- [ ] mp3 URL comes from uploads table
- [ ] Optional fields only included if provided
- [ ] Song.numberOfTracks incremented to 1
- [ ] Database transaction successful

#### Test 4.2: Add Multiple Tracks (Track Numbering)
**Steps:**
1. Add track to empty song → expects trackNumber=1
2. Add second track → expects trackNumber=2
3. Add third track → expects trackNumber=3

**Assertions:**
- [ ] Track numbers auto-increment correctly
- [ ] MAX(trackNumber) + 1 formula works
- [ ] All tracks returned in response

#### Test 4.3: Add Optional Metadata
**Request:**
```json
{
  "title": "Track 1",
  "audioFileUploadId": "upload-uuid",
  "isrc": "USRC17607839",
  "lyrics": "Verse 1...",
  "leadVocal": "John Doe",
  "featured": "Jane Smith",
  "producer": "Producer Name",
  "writer": "Writer Name",
  "duration": 180
}
```

**Assertions:**
- [ ] All optional fields stored correctly
- [ ] Empty optional fields not stored (null/undefined, not empty strings)
- [ ] Response includes all provided fields

#### Test 4.4: Add Track to Non-Existent Song
**Expected:** 404 Not Found
- [ ] Error message: "Song not found"

#### Test 4.5: Add Track When Song Not Owned by User
**Setup:**
1. Create song as User A
2. Try to add track as User B

**Expected:** 403 Forbidden
- [ ] Error message: "Forbidden - song doesn't belong to you"

#### Test 4.6: Add Track to Submitted Song
**Setup:**
1. Create song
2. Submit song (status="submitted")
3. Try to add another track

**Expected:** 409 Conflict
- [ ] Error message: "Cannot add tracks to a song with status 'submitted'"

#### Test 4.7: Add Track with Invalid Upload
**Request:**
```json
{
  "title": "Track",
  "audioFileUploadId": "non-existent-uuid"
}
```

**Expected:** 404 Not Found
- [ ] Error message: "Audio file upload not found"

#### Test 4.8: Add Track with Incomplete Upload
**Setup:**
1. Create upload record with status="uploading"
2. Try to add track with this uploadId

**Expected:** 400 Bad Request
- [ ] Error message: "Upload must be complete before adding as track"

---

### Phase 5: Song Submission Tests

#### Test 5.1: Submit Single Song with Valid Track Count
**Setup:**
1. Create single song
2. Add exactly 1 track
3. Submit song

**Expected Response:**
```json
{
  "success": true,
  "song": {
    "id": "uuid",
    "status": "submitted",
    "numberOfTracks": 1
  },
  "message": "Song submitted for review successfully"
}
```

**Assertions:**
- [ ] Status changed to "submitted"
- [ ] Timestamp recorded
- [ ] Admin notification (future feature)

#### Test 5.2: Submit Album with Minimum Tracks
**Setup:**
1. Create album
2. Add exactly 5 tracks
3. Submit

**Expected:** 200 OK with status="submitted"
- [ ] Album accepts 5+ tracks

#### Test 5.3: Submit Medley with Valid Range
**Setup:**
1. Create medley
2. Add 3 tracks
3. Submit

**Expected:** 200 OK
- [ ] Medley validates 2-4 tracks range

#### Test 5.4: Submit Song with Invalid Track Count - Single
**Setup:**
1. Create single
2. Add 2 tracks
3. Try to submit

**Expected:** 400 Bad Request
- [ ] Error: "Single must have exactly 1 track. Current: 2"

#### Test 5.5: Submit Album with Too Few Tracks
**Setup:**
1. Create album
2. Add 3 tracks
3. Try to submit

**Expected:** 400 Bad Request
- [ ] Error: "Album must have at least 5 tracks. Current: 3"

#### Test 5.6: Submit Song with Zero Tracks
**Setup:**
1. Create song
2. Try to submit without adding tracks

**Expected:** 400 Bad Request
- [ ] Error: "Song must have at least one track before submission"

#### Test 5.7: Submit Already Submitted Song
**Setup:**
1. Create and submit song
2. Try to submit again

**Expected:** 409 Conflict
- [ ] Error: "Song has already been submitted or processed. Current status: submitted"

#### Test 5.8: Submit Non-Existent Song
**Expected:** 404 Not Found
- [ ] Error: "Song not found"

---

### Phase 6: Song Retrieval Tests

#### Test 6.1: Get Song Details
**Request:** `GET /api/songs/[songId]`

**Expected Response:**
```json
{
  "success": true,
  "song": {
    "id": "uuid",
    "title": "Song Title",
    "artistName": "Artist",
    "type": "single",
    "numberOfTracks": 1,
    "status": "submitted",
    "duration": 180,
    "tracks": [...]
  },
  "tracks": [...]
}
```

**Assertions:**
- [ ] All song metadata returned
- [ ] All tracks included
- [ ] Total duration calculated from tracks
- [ ] No authentication required (public endpoint)

#### Test 6.2: Get Song with Multiple Tracks
**Setup:**
1. Create song with 3 tracks
2. Get song details

**Expected:** All 3 tracks returned
- [ ] Track order by trackNumber
- [ ] All track metadata included

#### Test 6.3: Get Non-Existent Song
**Expected:** 404 Not Found
- [ ] Error: "Song not found"

---

### Phase 7: Complete Workflow Tests

#### Test 7.1: Single Upload Flow
**Steps:**
1. Upload audio file → get uploadId1
2. Create single song → get songId
3. Add track with uploadId1 → verify trackNumber=1
4. Submit song → verify status="submitted"
5. Get song → verify all data correct

**Assertions:**
- [ ] Each step completes successfully
- [ ] IDs correctly reference each other
- [ ] Final status is "submitted"

#### Test 7.2: Album Upload Flow
**Steps:**
1. Upload 5 audio files → get uploadIds
2. Create album → get songId
3. Add 5 tracks (concurrent or sequential) → verify trackNumbers 1-5
4. Submit → verify status="submitted"
5. Get song → verify numberOfTracks=5, total duration correct

**Assertions:**
- [ ] Concurrent track uploads work
- [ ] Track numbers don't duplicate
- [ ] Total duration = sum of all track durations

#### Test 7.3: Song with Cover Image
**Steps:**
1. Upload cover image → get coverId
2. Create song with cover image
3. Add track
4. Get song details
5. Verify cover URL in response

**Assertions:**
- [ ] Cover image URL stored and returned
- [ ] Cover image accessible

#### Test 7.4: Resume After Browser Close (Simulated)
**Steps:**
1. Create song → save songId to localStorage
2. Close browser (simulate)
3. Reopen browser
4. Use saved songId to fetch song from `/api/songs/[songId]`
5. Add more tracks
6. Submit

**Assertions:**
- [ ] Song can be resumed by ID
- [ ] Existing data preserved
- [ ] Can continue adding tracks

---

### Phase 8: Error Handling Tests

#### Test 8.1: Invalid JSON in Request Body
**Expected:** 400 Bad Request
- [ ] Error: "Invalid request body"

#### Test 8.2: Network Error Retry
**Setup:**
1. Upload file with simulated network failure
2. Implement retry logic
3. Verify file eventually uploads

**Assertions:**
- [ ] FileUploadService retries 3 times
- [ ] Success after recovery

#### Test 8.3: Server Error (500)
**Expected:** Error response with status 500
- [ ] Client can handle error gracefully
- [ ] Error message shown to user

#### Test 8.4: Large File Upload
**Setup:**
1. Upload file > 100MB
2. Monitor memory usage
3. Verify stream-based handling (if implemented)

**Assertions:**
- [ ] Large files handled efficiently
- [ ] No memory overflow

---

### Phase 9: Performance Tests

#### Test 9.1: Track Addition Performance
**Setup:**
1. Create song with 50 tracks
2. Measure time per track addition
3. Calculate average

**Target:** Each track addition < 2 seconds

#### Test 9.2: Database Query Performance
**Setup:**
1. Query songs with large track lists
2. Measure query time
3. Verify indexes are used

**Assertions:**
- [ ] Index on (songId) for tracks
- [ ] Index on (userId) for songs
- [ ] Queries complete in < 100ms

#### Test 9.3: Concurrent Track Uploads
**Setup:**
1. Upload 5 tracks concurrently
2. Verify all complete successfully
3. Check database consistency

**Assertions:**
- [ ] No race conditions
- [ ] All tracks recorded correctly
- [ ] trackNumber values unique per song

---

### Phase 10: Security Tests

#### Test 10.1: SQL Injection Prevention
**Steps:**
1. Add track with title: `"; DROP TABLE songs; --`
2. Verify title stored as-is (escaped properly)

**Assertions:**
- [ ] Title safely escaped
- [ ] No database damage

#### Test 10.2: XSS Prevention
**Steps:**
1. Add track with title: `<script>alert('xss')</script>`
2. Fetch and render song in frontend
3. Verify script doesn't execute

**Assertions:**
- [ ] Script tags escaped in response
- [ ] Frontend properly escapes output

#### Test 10.3: File Upload Security
**Steps:**
1. Attempt to upload executable file (.exe)
2. Attempt to upload zip containing malware
3. Verify rejection

**Assertions:**
- [ ] File type validation works
- [ ] Only audio/image files allowed

#### Test 10.4: Authorization Checks
**Steps:**
1. Try to modify song created by another user
2. Try to access private songs of other users

**Expected:** 403 Forbidden
- [ ] Authorization checks pass on all operations

---

## Manual Testing Checklist

### Desktop Browser Testing
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browser Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Verify touch interactions work

### Network Conditions
- [ ] Fast 4G (50 Mbps)
- [ ] Slow 4G (5 Mbps)
- [ ] 3G (1 Mbps)
- [ ] Offline → Online transition
- [ ] Packet loss simulation

---

## UI/UX Testing (Frontend Integration)

### Test 10.1: Upload Progress Feedback
- [ ] Progress bar displays correctly
- [ ] Percentage updates in real-time
- [ ] Speed/time remaining estimate shown

### Test 10.2: Error Messages
- [ ] Error messages are clear and actionable
- [ ] User knows what failed and why
- [ ] Retry button available

### Test 10.3: Song Display Component
- [ ] Cover image displays
- [ ] Track list shows all tracks
- [ ] Track numbers in correct order
- [ ] Duration formatting correct
- [ ] Play button works (audio plays)
- [ ] Responsive design on mobile

### Test 10.4: Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast sufficient
- [ ] Focus indicators visible

---

## Test Execution Order

**Recommended execution sequence:**
1. **Phase 2:** File Upload (foundational)
2. **Phase 3:** Song Creation (needed for other phases)
3. **Phase 4:** Track Addition (main feature)
4. **Phase 5:** Song Submission (critical path)
5. **Phase 6:** Song Retrieval (data consistency check)
6. **Phase 7:** Complete Workflows (integration)
7. **Phase 1:** Authentication (across all phases)
8. **Phase 8:** Error Handling (edge cases)
9. **Phase 9:** Performance (optimization)
10. **Phase 10:** Security (final validation)

---

## Tools & Setup

### Postman/REST Client Setup
```bash
# Environment variables needed in Postman:
baseUrl = http://localhost:3000
songId = (set after creating song)
uploadId = (set after uploading file)
authToken = (set from login)
```

### cURL Testing
```bash
# Create song
curl -X POST http://localhost:3000/api/songs/create \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","type":"single","artistId":"uuid","artistName":"Artist","copyrightAcknowledged":true}'

# Add track
curl -X POST http://localhost:3000/api/songs/[songId]/tracks \
  -H "Content-Type: application/json" \
  -d '{"title":"Track 1","audioFileUploadId":"upload-uuid","duration":180}'

# Submit song
curl -X POST http://localhost:3000/api/songs/[songId]/submit

# Get song
curl http://localhost:3000/api/songs/[songId]
```

### Automated Testing (Jest/Vitest)
See `/src/tests/` directory for test files

---

## Success Criteria

✅ **All endpoints return correct status codes**
✅ **All database records created correctly**
✅ **No SQL injection vulnerabilities**
✅ **No XSS vulnerabilities**
✅ **Authorization checks working**
✅ **Error messages clear and helpful**
✅ **Performance targets met**
✅ **Browser compatibility confirmed**
✅ **Mobile responsiveness verified**
✅ **Accessibility standards met**

---

## Known Limitations & Future Work

- [ ] Batch track upload (upload multiple tracks at once)
- [ ] Track deletion/reordering
- [ ] Auto-save progress to localStorage
- [ ] Resumable uploads (if connection drops mid-upload)
- [ ] Admin dashboard for reviewing submissions
- [ ] Email notifications for submission status
- [ ] Webhook notifications for status changes

---

## Regression Testing

After each deployment:
- [ ] Run full test suite
- [ ] Verify no regressions in existing workflows
- [ ] Check performance hasn't degraded
- [ ] Verify all error messages still work

---

## Contact & Support

For test failures or issues:
1. Check recent commits for breaking changes
2. Review error logs in console
3. Verify environment variables are correct
4. Check database connection
5. Report issue with:
   - Test step that failed
   - Expected vs actual result
   - Error message/logs
   - Browser/environment details
