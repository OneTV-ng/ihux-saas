# Songs Pages Integration Guide

## Overview

The songs pages are now fully integrated with:
- ✅ Frontend pages (React components)
- ✅ API endpoints (Backend routes)
- ✅ API client functions (mobileApiClient)
- ✅ React hooks (State management)

## Architecture

```
Frontend Pages
    ↓
React Hooks (useSongs)
    ↓
API Client (fetchArtistSongs, fetchUserSongs)
    ↓
API Endpoints (/api/artist-songs, /api/user-songs)
    ↓
Database Queries (Drizzle ORM)
```

## Pages

### 1. Artist Songs Page
**URL**: `http://localhost:3000/desk/artist/songs`

**Purpose**: Show all songs for the currently selected artist

**Flow**:
1. User navigates to `/desk/artist/songs`
2. Page checks if user is authenticated
3. Page checks if user's email is verified
4. Page checks if an artist is selected
5. Page loads songs for that artist using `useArtistSongs` hook
6. Hook calls `fetchArtistSongs()` which hits `/api/artist-songs`
7. Endpoint queries database for songs where `artistId` matches
8. Results are displayed in a table with search/pagination

**Features**:
- Search songs by title, genre, type
- Pagination (default 10 per page)
- Display stats: Total songs, Total plays, Total views, Total downloads
- Table columns: Title, Album, Release Date, Duration, Plays, Status
- Actions: Play, Edit, Analytics, Delete

**Location**: `src/app/desk/artist/songs/page.tsx`

### 2. User Songs Page
**URL**: `http://localhost:3000/desk/songs`

**Purpose**: Show all songs where user_id matches current user

**Flow**:
1. User navigates to `/desk/songs`
2. Page checks if user is authenticated
3. Page loads all songs created by this user using `useUserSongs` hook
4. Hook calls `fetchUserSongs()` which hits `/api/user-songs`
5. Endpoint queries database for songs where `userId` matches authenticated user
6. Results are displayed in tabs and cards

**Features**:
- Search across title, artist, genre, type
- Sort by: Most Recent, Most Popular, Title A-Z
- Filter by genre
- Tabs: All Songs, Recent, Trending, Favorites
- Card layout showing song info

**Location**: `src/app/desk/songs/page.tsx`

## API Endpoints

### Artist Songs Endpoint
**Route**: `GET /api/artist-songs`

**Query Parameters**:
- `artistId` (required): ID of the artist
- `search` (optional): Search string
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)

**Request Example**:
```
GET /api/artist-songs?artistId=2f953c2f-b79a-4b13-8bb3-adc39d658747&search=today&page=1&pageSize=10
```

**Response**:
```json
{
  "songs": [
    {
      "id": "song-id",
      "title": "Today na Today",
      "type": "single",
      "genre": "Hipop, Reggea",
      "cover": "http://...",
      "numberOfTracks": 1,
      "isFeatured": false,
      "createdAt": "2026-02-15T15:38:13Z",
      "artistId": "artist-id",
      "artistName": "Dr. El Hassan",
      "status": "new",
      "plays": 0,
      "releaseDate": "2026-02-15T00:00:00Z",
      "duration": 240,
      "userId": "user-id"
    }
  ],
  "total": 1
}
```

**Location**: `src/app/api/artist-songs/route.ts`

### User Songs Endpoint
**Route**: `GET /api/user-songs`

**Query Parameters**:
- `search` (optional): Search string
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)

**Request Example**:
```
GET /api/user-songs?search=today&page=1&pageSize=10
```

**Response**:
```json
{
  "songs": [
    {
      "id": "song-id",
      "title": "Today na Today",
      "type": "single",
      "genre": "Hipop, Reggea",
      "cover": "http://...",
      "numberOfTracks": 1,
      "isFeatured": false,
      "createdAt": "2026-02-15T15:38:13Z",
      "artistId": "artist-id",
      "artistName": "Dr. El Hassan",
      "status": "new",
      "userId": "user-id",
      "plays": 0
    }
  ],
  "total": 1
}
```

**Location**: `src/app/api/user-songs/route.ts`

## API Client Functions

### fetchArtistSongs()

**Location**: `src/lib/apiClient.ts`

**Usage**:
```typescript
import { fetchArtistSongs } from "@/lib/apiClient";

const data = await fetchArtistSongs({
  artistId: "artist-123",
  search: "today",
  page: 1,
  pageSize: 10
});

console.log(data.songs); // Array of songs
console.log(data.total); // Total count
```

### fetchUserSongs()

**Location**: `src/lib/apiClient.ts`

**Usage**:
```typescript
import { fetchUserSongs } from "@/lib/apiClient";

const data = await fetchUserSongs({
  search: "today",
  page: 1,
  pageSize: 10
});

console.log(data.songs); // Array of songs
console.log(data.total); // Total count
```

## React Hooks

### useArtistSongs()

**Location**: `src/hooks/useSongs.ts`

**Usage**:
```typescript
import { useArtistSongs } from "@/hooks/useSongs";

const {
  songs,           // Array of songs
  total,          // Total count
  loading,        // Loading state
  error,          // Error message
  search,         // Current search string
  setSearch,      // Set search
  page,           // Current page
  setPage,        // Set page
  pageSize,       // Page size
  setPageSize,    // Set page size
  fetchData,      // Trigger fetch
} = useArtistSongs(artistId);

useEffect(() => {
  if (artistId) fetchData();
}, [artistId, search, page, pageSize]);
```

### useUserSongs()

**Location**: `src/hooks/useSongs.ts`

**Usage**:
```typescript
import { useUserSongs } from "@/hooks/useSongs";

const {
  songs,
  total,
  loading,
  error,
  search,
  setSearch,
  page,
  setPage,
  pageSize,
  setPageSize,
  fetchData,
} = useUserSongs();

useEffect(() => {
  fetchData();
}, [search, page, pageSize]);
```

## Status Filter

**Important**: The API endpoints now show songs in ALL statuses:
- `new` - Just uploaded
- `pending` - Under review
- `approved` - Published
- `rejected` - Flagged

**For Production**: Update endpoints to filter for `status = "approved"` only

**Files to Update**:
- `src/app/api/artist-songs/route.ts` (line 23)
- `src/app/api/user-songs/route.ts` (line 39)

## Testing

### Test Artist Songs
1. Go to `/desk/artist` and select/create an artist
2. Navigate to `/desk/artist/songs`
3. Should see all songs for that artist
4. Try search: Filter by title, genre, type
5. Try pagination: Change page size

### Test User Songs
1. Ensure you're logged in
2. Navigate to `/desk/songs`
3. Should see all songs created by your user
4. Try search: Filter by title, artist, genre, type
5. Try pagination
6. Try tabs: All, Recent, Trending

### Test API Directly
```bash
# Artist Songs
curl "http://localhost:3000/api/artist-songs?artistId=YOUR_ARTIST_ID&search=today&page=1&pageSize=10"

# User Songs
curl "http://localhost:3000/api/user-songs?search=today&page=1&pageSize=10"
```

## Common Issues & Solutions

### Issue: Redirect to Artist Selection
**Symptom**: Page keeps redirecting to `/desk/artist?redirect=/desk/artist/songs`

**Cause**: No artist selected or artistId not loading

**Solution**:
1. Go to `/desk/artist`
2. Create or select an artist
3. Return to `/desk/artist/songs`

### Issue: No Songs Appear
**Symptom**: "No songs found" message

**Possible Causes**:
1. No songs uploaded yet
2. Songs in "new" status (not "approved") - Check in database
3. Artist ID mismatch
4. User ID mismatch

**Solution**:
1. Upload a new song first
2. Check database for songs
3. Verify artist/user IDs match

### Issue: Search Not Working
**Cause**: API endpoint not indexing that field

**Solution**: Add field to search query in API endpoint

## Integration Checklist

- [x] Artist songs page created
- [x] User songs page created
- [x] Artist songs API endpoint created
- [x] User songs API endpoint created
- [x] API client functions created
- [x] React hooks created
- [x] Status filter removed (for testing)
- [x] Additional fields added to responses
- [x] Search functionality implemented
- [x] Pagination implemented
- [x] Error handling implemented
- [x] Loading states implemented
- [ ] Redirect flow fully tested
- [ ] End-to-end testing completed

## Next Steps

1. **Restart Dev Server** to apply changes
2. **Upload a Song** using `/desk/artist/upload/single`
3. **Test Artist Songs Page** - See songs for that artist
4. **Test User Songs Page** - See all songs for user
5. **Test Search** - Filter by various criteria
6. **Test Pagination** - Navigate through pages
7. **Production**: Update status filter to "approved" only

---

**Status**: Integration complete - Ready for end-to-end testing
