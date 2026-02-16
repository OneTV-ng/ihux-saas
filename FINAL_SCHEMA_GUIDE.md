# Final Schema Guide - Song Submission

Complete schema definition for song and track submission to backend based on actual database structure.

---

## 📋 SONGS TABLE - Submission Requirements

### **REQUIRED Fields** (Must be provided)
```typescript
title: string              // Song/Album title (max 255 chars)
userId: string            // Account owner ID (varchar 100)
artistId: string          // Artist profile ID (varchar 100)
artistName: string        // Artist display name (max 255 chars)
type: string              // 'single' | 'album' | 'ep' (default: 'single')
genre: string             // Music genre (default: 'Pop')
releaseDate: timestamp    // Release date (default: now())
cover: text              // Album cover image URL
language: string         // Language (default: 'English')
```

### **OPTIONAL Fields** (Recommended but not required)
```typescript
producer?: string        // Producer name
writer?: string         // Writer/composer name
recordLabel?: string    // Record label name (max 255)
featured?: text         // Featured artiststive info .env.example with place holders
//  info
upc?: string           // Universal Product Code (max 50)
```

### **Automatic Fields** (System-managed, don't set)
```typescript
id: string                    // UUID (varchar 100) - auto generated
numberOfTracks: number        // Default: 0
isFeatured: boolean          // Default: false
plays: number               // Default: 0
status: string              // Default: 'new' (new | pending | approved | rejected)
createdAt: timestamp        // Auto-set to now()
updatedAt: timestamp        // Auto-set to now(), updated on changes
```

### **Moderation Fields** (Admin only, don't set)
```typescript
flagType?: string         // Reason for flag if rejected
flagReason?: text        // Detailed flag reason
flaggedAt?: timestamp    // When flagged
flaggedBy?: string       // Admin ID who flagged
approvedBy?: string      // Admin ID who approved
approvedAt?: timestamp   // When approved
```

### **Tracking Fields** (Optional, for audit)
```typescript
createdBy?: string       // User ID who created
managedBy?: string       // Current manager/admin ID
deletedAt?: timestamp    // Soft delete timestamp
```

---

## 🎵 TRACKS TABLE - Submission Requirements

### **REQUIRED Fields** (Must be provided)
```typescript
songId: string           // Parent song ID (varchar 100)
title: string           // Track title (max 255 chars)
mp3: text              // Audio file URL
explicit: string        // 'yes' | 'no' | 'covered' (default: 'no')
```

### **OPTIONAL Fields** (Recommended but not required)
```typescript
trackNumber?: number     // Track position (default: 1)
isrc?: string           // International Standard Recording Code
lyrics?: text           // Song lyrics
leadVocal?: string      // Lead vocalist name (max 255)
featured?: text         // Featured artists
producer?: string       // Track producer
writer?: string         // Track writer
duration?: number       // Duration in seconds
links?: text            // External links (JSON: spotify, apple, youtube, etc.)
```

### **Automatic Fields** (System-managed)
```typescript
id: string              // UUID (varchar 100) - auto generated
createdAt: timestamp    // Auto-set to now()
updatedAt: timestamp    // Auto-set to now(), updated on changes
```

---

## 📤 API Submission Example

```typescript
const songSubmission = {
  // ===== REQUIRED =====
  title: "My Song Title",
  userId: "user-id-123",
  artistId: "artist-id-456",
  artistName: "Artist Name",
  type: "single",
  genre: "Hip Hop",
  releaseDate: "2026-02-15",
  cover: "http://localhost:3000/uploads/renny/cover/1771178778336.jpg",
  language: "English",

  // ===== OPTIONAL =====
  producer: "Producer Name",
  writer: "Songwriter Name",
  recordLabel: "Record Label",
  featured: "Guest Artist",
  upc: "123456789",
};

const trackSubmission = {
  // ===== REQUIRED =====
  songId: "song-id-789",
  title: "Track Title",
  mp3: "http://localhost:3000/uploads/renny/audio/1771178772250.mp3",
  explicit: "no",

  // ===== OPTIONAL =====
  trackNumber: 1,
  isrc: "USRC12345678",
  lyrics: "Song lyrics here...",
  leadVocal: "Artist Name",
  featured: "Guest Artists",
  producer: "Producer Name",
  writer: "Songwriter",
  duration: 240,
  links: JSON.stringify({
    spotify: "https://spotify.com/...",
    appleMusic: "https://music.apple.com/...",
    youtube: "https://youtube.com/..."
  })
};

// Submit to API
POST /api/song-upload {
  ...songData,
  tracks: [trackSubmission]
}
```

---

## 🔑 Key Constraints

### **No Foreign Key Constraints** ⚠️
- `artist_id` does NOT require artist to exist (validation at application level)
- `user_id` does NOT require user to exist (validation at application level)
- This allows flexible submission without strict DB validation

### **Default Values**
- All fields with `.default()` will use that value if not provided
- Timestamps auto-set to current time
- Numeric fields default to 0
- Boolean fields default to false

### **Not Null Constraints**
- `title` - must have a value
- `userId` - must have a value
- `artistId` - must have a value
- `artistName` - must have a value
- `type` - must have a value
- `cover` - should have a value (album art)
- `mp3` (in tracks) - must have a value
- `trackNumber` (in tracks) - must have a value

---

## 📊 Database Schema Overview

```sql
CREATE TABLE `songs` (
  `id` varchar(100) NOT NULL PRIMARY KEY,

  -- REQUIRED for submission
  `title` varchar(255) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `artist_id` varchar(100) NOT NULL,
  `artist_name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'single',
  `genre` varchar(100) DEFAULT 'Pop',
  `release_date` timestamp DEFAULT CURRENT_TIMESTAMP,
  `cover` text,
  `language` varchar(50) DEFAULT 'English',

  -- OPTIONAL metadata
  `producer` text,
  `writer` text,
  `record_label` varchar(255),
  `featured` text,
  `upc` varchar(50),

  -- Metadata
  `number_of_tracks` int DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `plays` int DEFAULT 0,
  `duration` int,

  -- Status
  `status` varchar(32) NOT NULL DEFAULT 'new',
  `flag_type` varchar(32),
  `flag_reason` text,
  `flagged_at` timestamp NULL,
  `flagged_by` varchar(100),
  `approved_by` varchar(100),
  `approved_at` timestamp NULL,

  -- Tracking
  `created_by` varchar(100),
  `managed_by` varchar(100),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL
);

CREATE TABLE `tracks` (
  `id` varchar(100) NOT NULL PRIMARY KEY,

  -- REQUIRED for submission
  `song_id` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `mp3` text NOT NULL,
  `explicit` varchar(10) DEFAULT 'no',

  -- OPTIONAL metadata
  `track_number` int DEFAULT 1,
  `isrc` varchar(32),
  `lyrics` text,
  `lead_vocal` varchar(255),
  `featured` text,
  `producer` text,
  `writer` text,
  `duration` int DEFAULT 0,
  `links` text,

  -- Timestamps
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## ✅ Submission Validation Checklist

Before submitting a song, ensure:

### **Songs Table**
- [ ] `title` is not empty
- [ ] `userId` is valid
- [ ] `artistId` is valid
- [ ] `artistName` is not empty
- [ ] `type` is valid ('single', 'album', 'ep')
- [ ] `cover` URL is accessible
- [ ] `language` is valid

### **Tracks Table**
- [ ] `songId` matches the song ID
- [ ] `title` is not empty
- [ ] `mp3` URL is accessible
- [ ] `explicit` is 'yes', 'no', or 'covered'
- [ ] If provided, `duration` is in seconds

---

## 🚀 Ready for Submission

The schema is now fully defined and matches the actual database structure. All REQUIRED fields must be provided, all OPTIONAL fields enhance the submission but are not mandatory.

**Status: Ready for Production**
