# Songs Pages & API Status

## Current Implementation Status

### ✅ Pages Created
1. **Artist Songs Page**: `/desk/artist/songs`
   - Location: `src/app/desk/artist/songs/page.tsx`
   - Shows: All songs for the currently selected artist
   - Features: Search, pagination, stats (total songs, total plays)
   - Requires: Artist ID (redirects to artist selection if missing)

2. **User Songs Page**: `/desk/songs`
   - Location: `src/app/desk/songs/page.tsx`
   - Shows: All songs where `user_id` matches current user
   - Features: Search, filters, tabs (all, recent, trending, favorites)
   - Requires: User authentication

### ✅ API Endpoints Created
1. **Artist Songs Endpoint**: `GET /api/artist-songs`
   - Query params: `artistId`, `search`, `page`, `pageSize`
   - Returns: Songs for specified artist
   - Filters: Status = "approved" only
   - Location: `src/app/api/artist-songs/route.ts`

2. **User Songs Endpoint**: `GET /api/user-songs`
   - Query params: `search`, `page`, `pageSize`
   - Returns: Songs where userId matches current user
   - Filters: Status = "approved" only
   - Location: `src/app/api/user-songs/route.ts`

### ✅ API Client Functions
Located in `src/lib/apiClient.ts`:
- `fetchArtistSongs()` - Calls `/api/artist-songs`
- `fetchUserSongs()` - Calls `/api/user-songs`

### ✅ React Hooks
Located in `src/hooks/useSongs.ts`:
- `useArtistSongs()` - Manages artist songs state
- `useUserSongs()` - Manages user songs state

## Redirect Behavior

### Artist Songs Page (`/desk/artist/songs`)
Redirects to:
- `/login?redirect=/desk/artist/songs` - If not authenticated
- `/desk/profile#verification` - If user email not verified
- `/desk/artist?redirect=/desk/artist/songs` - If no artist selected

**Note**: If you see a redirect to artist selection, it means:
1. You haven't selected a default artist yet, OR
2. The artist ID isn't being loaded from the auth context properly

**Solution**: Go to `/desk/artist` first, select/create an artist, then navigate to `/desk/artist/songs`

### User Songs Page (`/desk/songs`)
Redirects to:
- Requires user authentication only
- Shows all songs created by that user

## API Status Filter Issue

**Current Behavior**: Both endpoints filter for `status = "approved"` only

**Problem**: Songs uploaded might be in "new" or "pending" status, so they won't appear

**Fix Required**: Update endpoints to also show songs in other statuses for testing/development

### Songs Table Status Values
- `new` - Just uploaded
- `pending` - Under review
- `approved` - Published
- `rejected` - Flagged for review

## Test URLs

```
Artist Songs: http://localhost:3000/desk/artist/songs
User Songs: http://localhost:3000/desk/songs
```

## What Works
- ✅ Page layouts created
- ✅ API endpoints created
- ✅ React hooks created
- ✅ API client functions created
- ✅ Table/list UI components
- ✅ Search functionality
- ✅ Pagination structure
- ✅ Stats display

## What Needs Fixing
- ⚠️ Status filter too restrictive (only "approved")
- ⚠️ May need to verify auth context properly loads artist ID
- ⚠️ Test with actual uploaded songs

## Next Steps

1. Update API endpoints to include more status values
2. Test with songs in different statuses
3. Verify artist selection flows properly
4. Test search and pagination

---

**Status**: Mostly complete - needs status filter adjustment for full testing
