# Artist Management System - Complete Implementation

## Overview
A comprehensive artist profile management system with role-based permissions, verification requirements, and seamless upload integration.

---

## 🗄️ Database Schema

### **artist_profiles Table**
Located in: `src/db/music-schema.ts`

```typescript
{
  id: uuid (Primary Key)
  userId: text (Foreign Key to user.id)
  artistName: text (unique) - URL slug (/artists/artist-name)
  displayName: text - Display name shown to users
  bio: text - Artist biography
  gender: text - Artist gender
  city: text - Artist city
  country: text - Artist country
  genre: text - Primary music genre
  picture: text - Main profile picture URL

  // JSON fields for rich media
  thumbnails: {
    small?: string
    medium?: string
    large?: string
  }

  gallery: [{
    url: string
    title?: string
    description?: string
    order?: number
  }]

  mediaPlatform: {
    spotify?: string
    appleMusic?: string
    youtube?: string
    soundcloud?: string
    tidal?: string
    deezer?: string
    amazonMusic?: string
  }

  socialMedia: {
    facebook?: string
    instagram?: string
    twitter?: string
    tiktok?: string
    website?: string
  }

  fanNews: [{
    id: string
    title: string
    content: string
    image?: string
    publishedAt: string
  }]

  // Status & Stats
  isPublic: boolean (default: true)
  isVerified: boolean (default: false)
  totalSongs: integer (default: 0)
  totalPlays: integer (default: 0)
  totalFollowers: integer (default: 0)

  createdAt: timestamp
  updatedAt: timestamp
}
```

### **user_profiles Table (Extended)**
Added field: `selectedArtistId: uuid` - Tracks currently active artist for uploads

---

## 📊 Role-Based Artist Limits

| Role | Max Artists | Can Upload |
|------|-------------|------------|
| **guest** | 0 | ❌ No |
| **new** | 0 | ❌ No |
| **member** | 1 | ✅ Yes (verified only) |
| **artist** | 3 | ✅ Yes |
| **band/studio/choir/group** | 5 | ✅ Yes |
| **community/label** | 10 | ✅ Yes |
| **editor/manager** | 20 | ✅ Yes |
| **admin/sadmin** | ∞ Unlimited | ✅ Yes |

---

## 🛣️ API Routes

### **GET /api/artist**
Fetch user's artists with quota information

**Query Parameters:**
- `id` - Get specific artist by ID
- `selected=true` - Get currently selected artist

**Response:**
```json
{
  "success": true,
  "data": {
    "artists": [...],
    "selectedArtist": {...},
    "canCreate": {
      "canCreate": true,
      "currentCount": 2,
      "maxCount": 3,
      "reason": null
    }
  }
}
```

### **POST /api/artist**
Create a new artist profile

**Body:**
```json
{
  "artistName": "artist-name",
  "displayName": "Artist Display Name",
  "bio": "Artist biography...",
  "picture": "https://...",
  "socialMedia": {...},
  "mediaPlatform": {...}
}
```

**Validation:**
- Checks role-based limits
- Auto-converts artistName to URL-safe slug
- Checks for duplicate artist names
- Auto-selects as active if first artist

### **PUT /api/artist**
Update existing artist profile

**Body:**
```json
{
  "id": "artist-uuid",
  "displayName": "Updated Name",
  "bio": "Updated bio...",
  ...other fields
}
```

**Note:** Cannot update `artistName` (URL slug is permanent)

### **DELETE /api/artist?id={artistId}**
Delete artist profile
- Verifies ownership
- Auto-clears selection if deleted artist was selected
- Cascades to related data

### **POST /api/artist/select**
Select active artist for uploads

**Body:**
```json
{
  "artistId": "artist-uuid"  // or null to clear selection
}
```

---

## 🎨 Frontend Pages

### **1. Artist Management Page**
**Route:** `/desk/artist`

**Features:**
- View all user's artists in grid layout
- Create new artist with inline form
- Edit artist details
- Delete with confirmation dialog
- Select active artist (highlighted with border)
- Shows quota (X/Y artists)
- Displays verification badges
- Shows song count and follower count

**Components:**
- Artist cards with avatars
- Create/Edit forms
- Delete confirmation dialog
- Role-based creation limits

### **2. Upload Page (Protected)**
**Route:** `/desk/artist/upload`

**Requirements:**
1. ✅ User must be **verified** (verificationStatus === "verified")
2. ✅ User must have **selected an artist**

**Flow:**
```
User visits /desk/artist/upload
  ↓
Check verification status
  ├─ Not verified → Show "Verification Required" + link to profile
  └─ Verified → Check for selected artist
       ├─ No artist → Show "Select an Artist" + link to /desk/artist
       └─ Has artist → Show upload options + selected artist info
```

**Upload Options:**
- Multi-Track Album / EP
- Music Single
- Music Medley
- Music Video

**Selected Artist Display:**
Shows at top with:
- Artist display name
- "Uploading as:" label
- "Change Artist" button

---

## 🔧 Utility Functions

### **Artist Service** (`src/lib/artist-service.ts`)

```typescript
// Role-based limits
getMaxArtistsForRole(role: string): number

// CRUD operations
getUserArtists(userId: string): Promise<ArtistProfile[]>
getArtistById(id: string): Promise<ArtistProfile | null>
getArtistByName(artistName: string): Promise<ArtistProfile | null>
createArtist(userId, data): Promise<ArtistProfile>
updateArtist(artistId, userId, data): Promise<ArtistProfile>
deleteArtist(artistId, userId): Promise<boolean>

// Selection management
getUserSelectedArtist(userId: string): Promise<ArtistProfile | null>
setUserSelectedArtist(userId, artistId): Promise<void>
clearUserSelectedArtist(userId): Promise<void>

// Quota checking
canUserCreateArtist(userId, userRole): Promise<{
  canCreate: boolean
  currentCount: number
  maxCount: number
  reason?: string
}>
```

---

## 📝 Database Migration

**File:** `drizzle/0006_add_artist_profiles.sql`

**Run migration:**
```bash
# Option 1: Using drizzle-kit
npm run db:push

# Option 2: Manual SQL execution
psql $DATABASE_URL < drizzle/0006_add_artist_profiles.sql
```

**Migration creates:**
1. `artist_profiles` table with all fields
2. Indexes on userId, artistName, isPublic
3. Foreign key to user.id with cascade delete
4. `selectedArtistId` column in user_profiles

---

## 🎯 User Workflow

### **Step 1: Get Verified**
```
User signs up → Complete profile → Submit for verification → Admin approves
```

### **Step 2: Create Artist**
```
Visit /desk/artist → Click "Create Artist" → Enter details → First artist auto-selected
```

### **Step 3: Upload Music**
```
Visit /desk/artist/upload → System checks verification + artist → Shows upload options
```

### **Multiple Artists**
```
Create additional artists (within role limits) → Select active artist → Upload as that artist
```

---

## 🔒 Security & Validation

### **Upload Requirements**
- ✅ User must be verified (prevents spam)
- ✅ Must have selected artist (proper attribution)
- ✅ Role-based artist limits (prevents abuse)

### **Ownership Verification**
All API endpoints verify:
- User owns the artist they're modifying
- User has permission to create more artists
- Artist name uniqueness

### **URL Slugs**
Artist names automatically sanitized:
- Lowercase only
- Alphanumeric + hyphens
- No spaces or special characters
- Example: "John's Band!" → "johns-band"

---

## 🚀 Next Steps

### **Public Artist Profiles**
Create route: `/artists/[artistName]`
- Public view of artist info
- Display gallery, social links, media platforms
- List published songs
- Fan news feed

### **Artist Dashboard**
Create route: `/desk/artist/hub`
- Analytics for selected artist
- Manage songs, uploads, royalties
- Edit gallery and fan news
- Social media integrations

### **Enhanced Features**
- [ ] Artist collaboration (multiple users managing one artist)
- [ ] Artist verification badges (verified checkmark)
- [ ] Gallery management UI
- [ ] Fan news editor
- [ ] Media platform auto-sync
- [ ] Artist analytics dashboard

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   └── artist/
│   │       ├── route.ts          # CRUD endpoints
│   │       └── select/
│   │           └── route.ts      # Select artist endpoint
│   └── desk/
│       └── artist/
│           ├── page.tsx           # Artist management UI
│           └── upload/
│               └── page.tsx       # Protected upload selector
├── db/
│   └── music-schema.ts           # Artist profile schema
├── lib/
│   └── artist-service.ts         # Artist utilities
└── drizzle/
    └── 0006_add_artist_profiles.sql  # Database migration
```

---

## 🐛 Troubleshooting

### **"No artist selected" error**
- Go to `/desk/artist`
- Create or select an artist
- Refresh upload page

### **"Verification required" error**
- Go to `/desk/profile#verification`
- Complete all required fields
- Submit for verification
- Wait for admin approval

### **Cannot create more artists**
- Check your role limits
- Contact admin to upgrade role
- Or delete unused artists

### **Artist name already taken**
- Try different name variant
- Add numbers or additional words
- Check existing artists at `/artists`

---

## ✅ Testing Checklist

- [x] Create artist (within quota)
- [x] Edit artist details
- [x] Delete artist
- [x] Select/deselect artist
- [x] Quota enforcement
- [x] Upload page verification check
- [x] Upload page artist requirement
- [x] URL slug sanitization
- [x] Ownership verification
- [x] First artist auto-selection

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review API error messages
3. Check browser console for errors
4. Verify database migration ran successfully
5. Ensure user has required verification status

---

**System Status:** ✅ Fully Implemented & Running
**Application URL:** http://localhost:3000
**Last Updated:** 2026-02-10
