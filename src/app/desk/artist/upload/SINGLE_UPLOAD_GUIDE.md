# Single Song Upload Guide

Complete guide for uploading individual songs through the `/desk/artist/upload/single` page.

## Overview

The single song upload flow provides a streamlined 3-step process:
1. **Audio & Cover** - Upload MP3 and cover art
2. **Details** - Fill in song metadata
3. **Submit** - Review and publish

## Upload Flow

```
┌─────────────────────────────────────────┐
│  Check Requirements                     │
│  - Email verified?                      │
│  - Artist selected?                     │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼──────┐
        │   Verified? │
        ├──────┬──────┤
        │ No   │ Yes  │
        │      │      │
     [❌]      [✓]    │
     Show      Continue
     Warning      │
     Card      ┌──┴──────────────────┐
               │ Artist Selected?    │
               ├──────┬──────────────┤
               │ No   │ Yes          │
               │      │              │
            [❌]      [✓]           │
            Show      Continue      │
            Warning      │          │
            Card      ┌──▼──────────────────┐
                      │                     │
                      │ Upload Form         │
                      │ 1. Audio + Cover    │
                      │ 2. Song Details     │
                      │ 3. Copyright Check  │
                      └────────┬────────────┘
                               │
                               ▼
                    POST /api/song-upload
                               │
                               ▼
                    Save to Database
                               │
                               ▼
                         Success Alert
```

## Features

### 1. Requirements Checking
- **Email Verification**: Required before upload
- **Artist Selection**: Must select or create artist
- **Warning Cards**: Clear feedback if requirements missing
- **Quick Actions**: Direct links to complete missing requirements

### 2. File Upload Management
- **Audio Files**: MP3/WAV up to 10MB
- **Cover Art**: JPG/PNG, 3000x3000px, 70-600dpi
- **Progress Tracking**: Real-time upload percentage
- **File Validation**: Size and format checks
- **Quality Feedback**: Issues highlighted with suggestions

### 3. Toast Notifications
- Upload progress notifications
- Success confirmations
- Error messages with details
- File information feedback

### 4. Song Metadata
**Required Fields:**
- Song Title
- Artist Name
- Producer
- Songwriter
- Language
- Country

**Optional Fields:**
- ISRC Code
- UPC Code
- Release Date
- Genre / Subgenre
- Studio
- Record Label
- Explicit Content Flag
- Lyrics
- Media Links (Spotify, Apple Music, etc.)

### 5. Copyright Protections
- Ownership confirmation checkbox
- Terms of Service agreement
- Legal compliance warnings
- Fraud prevention checks

## API Endpoint

### POST /api/song-upload

**Request Body:**
```json
{
  "userId": "user-id",
  "artistId": "artist-id",
  "tracks": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "isrc": "ISRC-CODE" // optional
    }
  ],
  "coverUrl": "https://...",
  "mp3Url": "https://...",
  "producer": "Producer Name",
  "songwriter": "Songwriter Name",
  "language": "English",
  "country": "United States",
  "genre": "Hip-Hop",
  "explicit": "no",
  "releaseDate": "2024-02-15",
  "lyrics": "Song lyrics...",
  "mediaLinks": {
    "spotify": "https://spotify.com/...",
    "appleMusic": "https://music.apple.com/...",
    "youtube": "https://youtube.com/..."
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "songId": "uuid",
  "message": "Song uploaded successfully and is pending review"
}
```

**Response (Error):**
```json
{
  "error": "Specific error message",
  "success": false
}
```

## Database Schema

Songs are stored with the following structure:

```typescript
{
  id: string (UUID);
  userId: string (FK to users);
  artistId: string (FK to artists);
  title: string;
  artist: string;
  mp3Url: string;
  coverUrl: string;
  tracks: Array<{
    title: string;
    artist: string;
    isrc?: string;
    duration?: number;
    order: number;
  }>;

  // Metadata
  language: string;
  genre: string | null;
  country: string | null;
  explicit: boolean | "covered" | false;
  releaseDate: Date;

  // Optional Fields
  lyrics: string | null;
  info: string | null;
  producer: string | null;
  songwriter: string | null;
  recordLabel: string | null;
  studio: string | null;
  writer: string | null;
  upc: string | null;
  isrc: string | null;

  // Media Links
  mediaPlatform: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    soundcloud?: string;
    tidal?: string;
    deezer?: string;
    amazonMusic?: string;
  } | null;

  // Status
  status: "pending_review" | "approved" | "rejected";
  rejectionFlag: boolean;
  rejectionReasons: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

## User Experience Flow

### Step 1: Verify Requirements
```
┌─────────────────────────────────────┐
│ Check Email Verification            │
│ Check Artist Selected               │
│ Show appropriate warning if needed  │
│ Provide quick action buttons        │
└─────────────────────────────────────┘
```

### Step 2: Upload Audio & Cover
```
┌─────────────────────────────────────┐
│ Audio File                          │
│ ├─ Drag & drop support              │
│ ├─ File picker                      │
│ ├─ Progress bar                     │
│ ├─ File validation                  │
│ └─ Success notification             │
│                                     │
│ Cover Art                           │
│ ├─ Drag & drop support              │
│ ├─ File picker                      │
│ ├─ Progress bar                     │
│ ├─ Dimension validation              │
│ ├─ Quality feedback                 │
│ └─ Success notification             │
└─────────────────────────────────────┘
```

### Step 3: Fill Details
```
┌─────────────────────────────────────┐
│ Required Fields                     │
│ ├─ Song Title                       │
│ ├─ Artist Name                      │
│ ├─ Producer                         │
│ ├─ Songwriter                       │
│ ├─ Language                         │
│ └─ Country                          │
│                                     │
│ Optional Fields                     │
│ ├─ Genre / Subgenre                 │
│ ├─ Release Date                     │
│ ├─ Explicit Content                 │
│ ├─ Lyrics                           │
│ ├─ Media Links                      │
│ └─ Other Metadata                   │
└─────────────────────────────────────┘
```

### Step 4: Preview & Confirm
```
┌─────────────────────────────────────┐
│ Album Preview                       │
│ ├─ Cover art display                │
│ ├─ Song title                       │
│ ├─ Artist name                      │
│ └─ Play button                      │
│                                     │
│ Copyright Agreements                │
│ ├─ Ownership confirmation           │
│ └─ Terms acceptance                 │
└─────────────────────────────────────┘
```

### Step 5: Submit
```
┌─────────────────────────────────────┐
│ Submit Song                         │
│ ├─ Validation checks                │
│ ├─ API request                      │
│ ├─ Database save                    │
│ ├─ Success notification             │
│ └─ Redirect to uploads page         │
└─────────────────────────────────────┘
```

## Error Handling

### Common Errors

1. **Email Not Verified**
   - Message: "Email not verified"
   - Action: Direct to settings page
   - Status: Blocking

2. **No Artist Selected**
   - Message: "No artist selected"
   - Action: Direct to artist selection
   - Status: Blocking

3. **File Too Large**
   - Message: "File too large - Maximum 10MB"
   - Action: Suggest compression
   - Status: Non-blocking

4. **Invalid Cover Dimensions**
   - Message: "Cover must be 3000x3000px"
   - Action: Show dimension feedback
   - Status: Warning (can override)

5. **Missing Required Fields**
   - Message: "Producer, Songwriter required"
   - Action: Highlight missing fields
   - Status: Blocking

6. **Database Error**
   - Message: "Failed to upload song"
   - Action: Show retry option
   - Status: Non-blocking

## Notifications

### Toast Messages

**Upload Progress:**
```
"Uploading audio..." → filename + size
"Uploading cover art..." → filename
```

**Success:**
```
"Audio uploaded" → "Ready to publish"
"Cover uploaded" → "3000x3000px"
"Song uploaded successfully!" → "pending review"
```

**Errors:**
```
"Audio upload failed" → "Network error"
"Cover upload failed" → "Please try again"
"Upload failed" → "Specific error message"
```

## File Size & Format Specifications

### Audio Files
- **Formats**: MP3, WAV
- **Max Size**: 10MB
- **Bitrate**: 128-320 kbps recommended
- **Sample Rate**: 44.1kHz or higher

### Cover Art
- **Formats**: JPG, PNG
- **Dimensions**: 3000x3000 pixels (required)
- **DPI**: 70-600 (recommended)
- **Color Space**: RGB or CMYK
- **File Size**: Under 5MB

## Validation Rules

### File Uploads
```typescript
// Audio validation
- Type: audio/mp3 | audio/mpeg | audio/wav
- Size: <= 10MB
- Required: true

// Cover validation
- Type: image/jpeg | image/png
- Size: <= 5MB
- Dimensions: exactly 3000x3000px
- DPI: >= 70dpi
- Required: true
```

### Required Fields
```typescript
const requiredFields = [
  'songTitle',
  'artist',
  'producer',
  'songwriter',
  'language',
  'country',
  'mp3Url',
  'coverUrl'
];
```

### Agreements
```typescript
const agreements = [
  'agreedOwnership',   // I own the content
  'agreedTerms'        // I accept ToS
];
```

## Success Flow

1. **Validation Passes** ✓
   - All required fields filled
   - Files uploaded successfully
   - Agreements accepted

2. **API Request** ✓
   - POST to /api/song-upload
   - Database transaction begins

3. **Song Created** ✓
   - Song record inserted
   - Status set to pending_review
   - UUID generated

4. **Settings Saved** ✓
   - Upload preferences stored
   - Artist profile updated
   - Metadata cached

5. **User Feedback** ✓
   - Success toast notification
   - Song details displayed
   - Redirect after 2 seconds

## Related Pages

- **[Artist Selection](/desk/artist)** - Select or create artist
- **[Email Verification](/desk/settings)** - Verify email address
- **[Upload Dashboard](/desk/artist?tab=uploads)** - View all uploads
- **[Song Details](/desk/artist/songs/[id])** - Edit song metadata

## Troubleshooting

### Upload Stuck at Progress Bar
- Check file size (< 10MB)
- Check internet connection
- Try refreshing page
- Use different browser

### "Email Not Verified" Error
- Click "Verify Email" button
- Check inbox for verification link
- Request new link if needed
- Wait 5 minutes after verification

### "No Artist Selected" Error
- Click "Select Artist" button
- Create new artist or select existing
- Return to upload page
- Try again

### Cover Art Quality Warning
- Ensure exactly 3000x3000px
- Check DPI is 70-600
- Re-export from image editor
- Try different cover image

### Song Won't Submit
- Check all required fields highlighted
- Accept both copyright agreements
- Ensure files uploaded completely
- Check browser console for errors

---

For more information about artist management, see the [Artist Service Documentation](../../../lib/artist-service.ts).
