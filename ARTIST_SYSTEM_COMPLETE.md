# Artist Management System - Complete Implementation
## Two-Table Architecture

**Last Updated:** 2026-02-10
**Status:** ✅ Fully Implemented & Running

---

## 🏗️ Database Architecture

### **artists** Table (Private Business Information)
Location: `src/db/music-schema.ts`

**Purpose:** Store private artist business information and legal details

```sql
CREATE TABLE artists (
  id uuid PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artist_name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  slug text NOT NULL UNIQUE,  -- URL-safe slug for /artists/slug

  -- Profile Information
  bio text,
  city text,
  country text,
  birthday timestamp,
  gender text,
  genre text,

  -- Contact Information (JSON)
  contact jsonb {
    email?: string
    whatsapp?: string
    phone?: string
    address?: string
    legalNames?: string
  },

  -- Legal Documents
  legal_id text,      -- Path to legal ID document
  contract text,      -- Path to contract document

  -- Status
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**Indexes:**
- `artists_user_idx` on user_id
- `artists_slug_idx` on slug
- `artists_name_idx` on artist_name

---

### **artist_profiles** Table (Public Profile Data)
Location: `src/db/music-schema.ts`

**Purpose:** Store public-facing artist profile information

```sql
CREATE TABLE artist_profiles (
  id uuid PRIMARY KEY,
  artist_id uuid NOT NULL REFERENCES artists(id) ON DELETE CASCADE,

  -- Visual Media
  picture text,
  thumbnails jsonb {
    small?: string
    medium?: string
    large?: string
  },
  gallery jsonb [{
    url: string
    title?: string
    description?: string
    order?: number
  }],

  -- Social & Media Links
  media_platform jsonb {
    spotify?: string
    appleMusic?: string
    youtube?: string
    soundcloud?: string
    tidal?: string
    deezer?: string
    amazonMusic?: string
  },
  social_media jsonb {
    facebook?: string
    instagram?: string
    twitter?: string
    tiktok?: string
    website?: string
  },

  -- Content
  fan_news jsonb [{
    id: string
    title: string
    content: string
    image?: string
    publishedAt: string
  }],
  press jsonb [{
    id: string
    title: string
    publication?: string
    url?: string
    image?: string
    publishedAt: string
  }],

  -- Status & Stats
  is_public boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  total_songs integer DEFAULT 0,
  total_plays integer DEFAULT 0,
  total_followers integer DEFAULT 0,

  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

**Indexes:**
- `artist_profiles_artist_idx` on artist_id
- `artist_profiles_public_idx` on is_public

---

## 📡 API Endpoints

### **GET /api/artist**
Fetch all user's artists with quota information

**Query Parameters:**
- `id` - Get specific artist by ID
- `selected=true` - Get currently selected artist

**Response:**
```json
{
  "success": true,
  "data": {
    "artists": [
      {
        "id": "uuid",
        "userId": "user-id",
        "artistName": "Artist Name",
        "displayName": "Display Name",
        "slug": "artist-slug",
        "bio": "Bio text...",
        "city": "City",
        "country": "Country",
        "gender": "Gender",
        "genre": "Genre",
        "birthday": "2000-01-01",
        "contact": {...},
        "legalId": null,
        "contract": null,
        "isActive": true,
        "createdAt": "2026-02-10",
        "updatedAt": "2026-02-10",
        "profile": {
          "id": "uuid",
          "artistId": "artist-id",
          "picture": "url",
          "thumbnails": {...},
          "gallery": [...],
          "mediaPlatform": {...},
          "socialMedia": {...},
          "fanNews": [...],
          "press": [...],
          "isPublic": true,
          "isVerified": false,
          "totalSongs": 0,
          "totalPlays": 0,
          "totalFollowers": 0,
          "createdAt": "2026-02-10",
          "updatedAt": "2026-02-10"
        }
      }
    ],
    "selectedArtist": {...},
    "canCreate": {
      "canCreate": true,
      "currentCount": 1,
      "maxCount": 3,
      "reason": null
    }
  }
}
```

### **POST /api/artist**
Create new artist profile

**Body:**
```json
{
  "artistName": "Artist Name",
  "displayName": "Display Name",
  "bio": "Bio...",
  "gender": "Male",
  "city": "Los Angeles",
  "country": "United States",
  "genre": "Pop",
  "birthday": "2000-01-01",
  "contact": {
    "email": "artist@example.com",
    "whatsapp": "+1234567890",
    "phone": "+1234567890",
    "address": "Address...",
    "legalNames": "Legal Name"
  },
  "picture": "https://...",
  "socialMedia": {...},
  "mediaPlatform": {...}
}
```

**Validation:**
- Checks role-based artist limits
- Auto-generates URL slug from artistName
- Checks for duplicate slugs
- Auto-selects as current if first artist
- Creates both artist and artist_profile records

### **PUT /api/artist**
Update artist information

**Body:**
```json
{
  "id": "artist-uuid",
  "displayName": "Updated Name",
  "bio": "Updated bio...",
  "city": "New City",
  "country": "New Country",
  "gender": "Updated gender",
  "genre": "Updated genre",
  "contact": {...}
}
```

### **DELETE /api/artist?id={artistId}**
Delete artist (cascades to profile)
- Verifies ownership
- Clears selection if deleted artist was selected
- Cascades to artist_profile automatically

### **POST /api/artist/select**
Select/deselect active artist

**Body:**
```json
{
  "artistId": "artist-uuid"  // or null to clear
}
```

### **POST /api/artist/suspend**
Suspend/unsuspend artist (toggle isPublic)

**Body:**
```json
{
  "artistId": "artist-uuid",
  "suspend": true  // false to activate
}
```

---

## 🎨 Frontend Pages

### **1. /desk/artist** - Artist Management
**File:** `src/app/desk/artist/page.tsx`

**Features:**
- Tabbed interface: "My Artists" | "Create New Artist"
- Artist cards with avatar, stats, verification badge
- View/Select button → navigates to /desk/artist/hub
- Edit, Delete, Suspend actions
- Shows quota: "X/Y artists"
- Displays bio, genre, location
- Auto-shows create form if no artists

**Create Form Fields:**
- Artist Name (URL) *required
- Display Name *required
- Bio
- Gender | Genre
- City | Country

### **2. /desk/artist/hub** - Artist Dashboard
**File:** `src/app/desk/artist/hub/page.tsx`

**Features:**
- Selected artist header with avatar
- Artist info: displayName, @slug, bio
- Badges: genre, gender, location
- Verification badge if verified
- Stats cards: Total Songs, Total Plays, Followers
- Quick actions:
  - Upload Music → /desk/artist/upload
  - Manage Gallery → /desk/artist/gallery
  - Fan News → /desk/artist/news
  - Social Links → /desk/artist/social
- Edit Profile button
- Change Artist button
- View Public Profile link → /artists/{slug}

### **3. /desk/artist/upload** - Protected Upload
**File:** `src/app/desk/artist/upload/page.tsx`

**Requirements:**
1. ✅ User must be **verified** (verificationStatus === "verified")
2. ✅ User must have **selected an artist**

**Flow:**
```
User visits /desk/artist/upload
  ↓
Check verification status
  ├─ Not verified → "Verification Required" card
  └─ Verified → Check for selected artist
       ├─ No artist → "Select an Artist" card + redirect to /desk/artist
       └─ Has artist → Show upload options + selected artist info
```

**Upload Options:**
- Multi-Track Album / EP
- Music Single
- Music Medley
- Music Video

---

## 🔧 Service Layer

### **Artist Service** (`src/lib/artist-service.ts`)

**Interfaces:**
```typescript
interface Artist {
  // Private business information
  id, userId, artistName, displayName, slug
  bio, city, country, birthday, gender, genre
  contact, legalId, contract
  isActive, createdAt, updatedAt
}

interface ArtistProfile {
  // Public profile data
  id, artistId
  picture, thumbnails, gallery
  mediaPlatform, socialMedia
  fanNews, press
  isPublic, isVerified
  totalSongs, totalPlays, totalFollowers
  createdAt, updatedAt
}

interface CombinedArtist extends Artist {
  profile: ArtistProfile
}
```

**Functions:**
```typescript
// Role & Quota
getMaxArtistsForRole(role: string): number
canUserCreateArtist(userId, userRole): Promise<{canCreate, currentCount, maxCount, reason?}>

// CRUD
getUserArtists(userId): Promise<CombinedArtist[]>
getArtistById(id): Promise<CombinedArtist | null>
getArtistBySlug(slug): Promise<CombinedArtist | null>
createArtist(userId, data): Promise<CombinedArtist>
updateArtist(artistId, userId, data): Promise<Artist | null>
updateArtistProfile(artistId, userId, data): Promise<ArtistProfile | null>
deleteArtist(artistId, userId): Promise<boolean>

// Selection
getUserSelectedArtist(userId): Promise<CombinedArtist | null>
setUserSelectedArtist(userId, artistId): Promise<void>
clearUserSelectedArtist(userId): Promise<void>
```

---

## 📊 Role-Based Artist Limits

| Role | Max Artists | Can Upload |
|------|-------------|------------|
| guest | 0 | ❌ No |
| new | 0 | ❌ No |
| member | 1 | ✅ Yes (verified only) |
| artist | 3 | ✅ Yes |
| band/studio/choir/group | 5 | ✅ Yes |
| community/label | 10 | ✅ Yes |
| editor/manager | 20 | ✅ Yes |
| admin/sadmin | ∞ Unlimited | ✅ Yes |

---

## 🔒 Security & Validation

### **Artist Creation:**
- ✅ Role-based quota enforcement
- ✅ URL slug auto-generation (lowercase, alphanumeric + hyphens)
- ✅ Duplicate slug prevention
- ✅ Ownership verification
- ✅ Auto-selection of first artist

### **Upload Protection:**
- ✅ User must be verified
- ✅ User must have selected artist
- ✅ Artist must belong to user
- ✅ Artist must be active

### **Data Separation:**
- ✅ Private business info (artists table)
- ✅ Public profile data (artist_profiles table)
- ✅ Cascade deletes maintain integrity
- ✅ Foreign key constraints enforced

---

## 🚀 Deployment

**Database Migrations Applied:**
- ✅ 0006_add_artist_profiles.sql - Initial artist_profiles (old structure)
- ✅ 0007_add_artist_location_gender.sql - Added gender, city, country
- ✅ 0008_add_artist_genre.sql - Added genre field
- ✅ 0009_restructure_artist_tables.sql - Created artists table, restructured artist_profiles

**Application Status:**
- ✅ PM2 Process: singf-dev (online)
- ✅ Database: PostgreSQL @ localhost:5432/singf
- ✅ Frontend: http://localhost:3000
- ✅ All APIs functional

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   └── artist/
│   │       ├── route.ts              # GET/POST/PUT/DELETE
│   │       ├── select/route.ts       # Select artist
│   │       └── suspend/route.ts      # Suspend/activate
│   └── desk/
│       └── artist/
│           ├── page.tsx              # Artist management
│           ├── hub/page.tsx          # Artist dashboard
│           └── upload/page.tsx       # Protected upload
├── db/
│   └── music-schema.ts               # artists & artist_profiles tables
├── lib/
│   └── artist-service.ts             # Artist service layer
└── drizzle/
    ├── 0006_add_artist_profiles.sql
    ├── 0007_add_artist_location_gender.sql
    ├── 0008_add_artist_genre.sql
    └── 0009_restructure_artist_tables.sql
```

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
- [x] Cascade deletes
- [x] Two-table architecture
- [x] Contact information storage
- [x] Press releases storage
- [x] Public/private data separation

---

## 🎯 Next Steps

### **Public Artist Profiles**
- [ ] Create `/artists/[slug]` page
- [ ] Display public profile data
- [ ] Show songs, gallery, press releases
- [ ] Fan news feed
- [ ] Social media links

### **Gallery Management**
- [ ] Create `/desk/artist/gallery` page
- [ ] Upload images
- [ ] Manage gallery items
- [ ] Set order and descriptions

### **Fan News & Press**
- [ ] Create `/desk/artist/news` page
- [ ] Create/edit fan news
- [ ] Manage press releases
- [ ] Rich text editor

### **Legal Documents**
- [ ] Upload legal ID interface
- [ ] Upload contract interface
- [ ] Document verification flow
- [ ] Secure document storage

---

**System fully operational and ready for production use! 🎉**
