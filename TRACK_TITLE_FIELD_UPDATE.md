# Track Title Field Addition

## Summary
Added separate input fields for "Album / Song Title" and "Track Title" to provide clearer distinction between album-level and track-level metadata.

## Changes Made

### 1. New State Variable
```typescript
const [trackTitle, setTrackTitle] = useState("");
```

### 2. Form Fields Updated

#### Before
```
Song Title: [input field]  ← Used for both album and track
```

#### After
```
Album / Song Title: [input field]  ← Album/single title
Track Title: [input field]         ← Individual track name
```

### 3. Field Properties

**Album / Song Title**
- Placeholder: "Album or single title"
- Required: Yes (part of canSubmit validation)
- Auto-filled from: Cover image file name
- Used for: Album metadata, API submission

**Track Title**
- Placeholder: "Individual track name"
- Required: Yes (part of canSubmit validation)
- Auto-filled from: Can be manually set or defaults to Album Title
- Used for: Track metadata, player display

### 4. Form Flow

**User Journey**:
1. Upload cover "My Album.jpg"
   - Album Title auto-fills: "My Album"

2. Enter Track Title: "Track 01" (or leave blank to default to album title)

3. Preview shows: "Track 01" on the player

4. Submit sends:
   - Album title: "My Album"
   - Track title: "Track 01" (or "My Album" if not set)

### 5. API Submission Changes

**Before**:
```json
{
  "tracks": [{ "title": "Song Title", "artist": "...", "isrc": "..." }]
}
```

**After**:
```json
{
  "title": "Album Title",
  "tracks": [{ "title": "Track Title or Album Title", "artist": "...", "isrc": "..." }]
}
```

### 6. Preview Display

**Media Preview Player** shows:
- Title: Track Title (if set) → Album Title (fallback)
- Artist: From artist field
- Album cover: From uploaded image

### 7. Validation

**canSubmit checks**:
- ✓ Album Title (songTitle) required
- ✓ Track Title (trackTitle) required
- ✓ Both must be filled for submission
- ✓ All other existing validations remain

**Fallback Logic**:
- If Track Title empty → defaults to Album Title in submission
- If Album Title empty → submission fails validation
- Preview shows Track Title first, then Album Title as fallback

### 8. Success Message

Shows: `"[Track Title]" is now being processed` or `"[Album Title]" if no track title set`

## Use Cases

### Single Track Release
```
Album / Song Title: "My First Song"
Track Title: "My First Song"
```

### Album with Multiple Tracks
```
Album / Song Title: "My Album"
Track Title: "Track 01" (first time)
Track Title: "Track 02" (second upload)
```

### EP Release
```
Album / Song Title: "My EP"
Track Title: "Intro"
Track Title: "Main Track"
Track Title: "Outro"
```

## Database Schema Alignment

**Songs Table** stores:
- `title`: Album/song title (from Album Title field)

**Tracks Table** stores:
- `title`: Track title (from Track Title field)
- `song_id`: Reference to parent song

## Benefits

1. **Clear Distinction**
   - Users understand album vs. track metadata
   - Reduces confusion for multi-track uploads

2. **Better Metadata**
   - Accurate album information
   - Precise track naming
   - Supports EP/album uploads

3. **Improved UX**
   - Preview shows correct track name
   - Success message uses track title
   - Player displays track title

4. **API Accuracy**
   - Sends both album and track titles
   - Backend receives correct structure
   - Database reflects proper hierarchy

## Testing

### Test Case 1: Single Track
1. Upload cover "Song.jpg"
2. Album Title auto-fills: "Song"
3. Leave Track Title empty
4. Submit
5. Expected: Uses "Song" for both album and track

### Test Case 2: Album with Track
1. Upload cover "Album.jpg"
2. Album Title auto-fills: "Album"
3. Enter Track Title: "Track 01"
4. Submit
5. Expected: Album = "Album", Track = "Track 01"

### Test Case 3: Both Empty
1. Upload cover (no auto-fill if needed)
2. Leave Album Title empty
3. Leave Track Title empty
4. Try to submit
5. Expected: Submit button disabled, validation fails

## Integration Points

### Form Fields
- Line 726-729: Album Title input
- Line 730-733: Track Title input

### Preview Display
- Uses `trackTitle || songTitle` for display
- Falls back to Album Title if Track Title not set

### API Submission
- Line 364: Sends `title: songTitle` (album)
- Line 365: Sends `tracks[0].title: trackTitle || songTitle`

### Player Controls
- Line 883: Preview button uses trackTitle
- Line 901: Success play button uses trackTitle

## Migration Notes

If updating existing uploads:
- Track Title field is new
- Existing submissions that used songTitle for tracks will need no change
- New submissions will use trackTitle explicitly
- API handles fallback gracefully

## Future Enhancements

Potential improvements:
- [ ] Auto-detect track numbers from filenames (Track 01, Track 02, etc.)
- [ ] Allow multiple track uploads in one go
- [ ] Template system for album track listing
- [ ] Batch upload with CSV track definitions
- [ ] Album artwork with individual track management

## Status

✅ **Implementation Complete**
- State added
- Form fields created
- Validation updated
- Preview updated
- API submission updated
- Player controls updated

Ready for testing and deployment.
