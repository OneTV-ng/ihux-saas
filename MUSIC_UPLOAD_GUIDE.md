# Music Upload Guide

## Overview

The music upload system at `/desk/upload/point` is a comprehensive, user-friendly interface for uploading music with automatic metadata extraction and progress recovery.

## Features

✅ **Multi-Step Upload Wizard**
- Metadata (Song info, genre, language)
- Cover Art (Album artwork)
- Track Details (One or more tracks)
- Review (Verification before publishing)
- Publishing (Automatic processing)

✅ **Automatic Metadata Extraction**
- Extracts track titles from MP3 ID3 tags
- Detects song duration automatically
- Allows manual editing of all fields

✅ **Progress Saving**
- Automatic browser storage (localStorage)
- Server-side job tracking in database
- Resume incomplete uploads later
- 30-day expiration for abandoned uploads

✅ **Song Types**
- **Single**: One track (1 MP3 file)
- **Album**: 5+ tracks with cover art
- **Medley**: 2-4 tracks combined in one or more MP3 files

✅ **Copyright Protection**
- Copyright warning acknowledgement required
- Tracks content for compliance
- Flags for copyright issues during approval

✅ **User-Friendly Design**
- Progress indicator with step tracking
- Drag-and-drop file uploads
- Real-time validation
- Clear error messages
- Incremental progress updates

## How to Use

### Step 1: Basic Information
1. Navigate to `/desk/upload/point`
2. Accept copyright warning (required)
3. Enter song title, type, genre, and language
4. Optionally add UPC/EAN code
5. Click "Next: Cover Art"

### Step 2: Cover Art
1. Upload album/cover artwork (JPG, PNG)
2. Recommended size: 3000x3000px or 1500x1500px minimum
3. Click "Next: Track Details"

### Step 3: Track Details
1. For each track:
   - Upload MP3 file (metadata auto-extracts)
   - Edit track title (auto-filled from MP3 tags)
   - Add ISRC code (International Standard Recording Code)
   - Set explicit content flag
   - Add producer, writer, lead vocal names
   - Add lyrics (optional)
2. All MP3 files must be uploaded before proceeding
3. All track titles must be filled
4. Click "Next: Review"

### Step 4: Review
- Verify all information is correct
- Check track count and titles
- Click "Publish" to proceed

### Step 5: Publishing
- Files are uploaded
- Metadata is processed
- Copyright checks are performed
- Status changes to "checking" (under review)
- You'll be notified when approved

## Save & Resume

**Automatic Saving:**
- All progress is saved to browser storage automatically
- Save button available for server backup
- Browser storage persists for 30 days

**Resuming Uploads:**
- If you reload the page, your draft is restored
- "Start Over" button resets the form
- Unfinished uploads can be resumed from browser storage

## Important Notes

⚠️ **Copyright Compliance:**
- Confirm you own or have rights to the music
- Copyright violations will result in account suspension
- All uploads are scanned for copyright issues

⚠️ **File Requirements:**
- MP3 format required
- All tracks must be high quality
- Cover art must be image format (JPG, PNG)

⚠️ **Metadata:**
- Track titles are auto-extracted but can be edited
- ISRC codes recommended for track identification
- Producer and writer info helps with royalties

## Troubleshooting

### Metadata Not Extracting
- Ensure MP3 file has ID3 tags
- Try manually entering track information
- File will still upload without auto-metadata

### Upload Stuck
- Check browser console for errors
- Try saving progress and refreshing
- Use "Save Progress" button to backup

### Need to Resume Later
- Click "Save Progress" before leaving
- Use "Start Over" to discard current upload
- Retrieved saved upload from browser storage

## Storage Location

- **Browser Storage**: `localStorage` under key `music_upload_job`
- **Database**: `upload_jobs` table for server-side tracking
- **Uploads**: `/public/uploads/songs/` directory

## Database Schema

### upload_jobs Table
Tracks upload progress and recovery:
- `id`: Unique upload job ID
- `userId`: User performing the upload
- `songTitle`, `songType`, `genre`, `language`: Song metadata
- `tracks`: JSON array of track data
- `status`: in_progress, completed, failed, cancelled
- `currentStep`: Which step user is on
- `progress`: 0-100% completion
- `copyrightAcknowledged`: Copyright warning accepted
- `createdAt`, `updatedAt`, `completedAt`: Timestamps
- `expiresAt`: Auto-cleanup after 30 days

### songs Table
Created upon publishing:
- `id`: Song ID
- `title`, `artistId`, `artistName`: Song info
- `type`: single, album, medley
- `numberOfTracks`: Track count
- `status`: new, checking, approved, flagged, deleted
- `coverUploadId`: Cover image reference
- `createdBy`, `managedBy`: User references

### tracks Table
Created for each track:
- `id`: Track ID
- `songId`: Parent song reference
- `trackNumber`: Order in song
- `title`, `isrc`: Track metadata
- `mp3`: File location
- `explicit`: Content rating
- `lyrics`, `leadVocal`, `producer`, `writer`: Credits
- `duration`: Track length in seconds

## API Endpoints

### POST /api/upload/save-job
Saves upload job progress to database for recovery.

**Request:**
```json
{
  "id": "job_123456",
  "userId": "user_id",
  "songTitle": "My Song",
  "songType": "single",
  "tracks": [...],
  "status": "in_progress",
  "currentStep": "tracks",
  "progress": 50
}
```

### POST /api/upload/extract-metadata
Extracts ID3 metadata from MP3 file.

**Request:** (multipart/form-data)
```
file: <mp3-file>
```

**Response:**
```json
{
  "success": true,
  "metadata": {
    "title": "Song Title",
    "artist": "Artist Name",
    "duration": 180,
    "album": "Album Name",
    "year": "2024"
  }
}
```

### POST /api/upload/publish
Publishes song with all tracks and creates database records.

**Request:**
```json
{
  "id": "job_123456",
  "userId": "user_id",
  "songTitle": "My Song",
  "tracks": [...],
  "copyrightAcknowledged": true,
  ...
}
```

**Response:**
```json
{
  "success": true,
  "songId": "song_id",
  "status": "checking"
}
```

## Future Enhancements

- [ ] Batch upload multiple songs
- [ ] Album organization
- [ ] Collaborator permissions
- [ ] Upload templates
- [ ] Automatic format conversion
- [ ] Detailed copyright scanning
- [ ] Release scheduling
- [ ] Analytics after publishing
