# Upload State Management Hook

Complete persistent state management system for music uploads with localStorage integration.

## Overview

The `useUploadState` hook manages the entire upload form state and automatically persists it to the browser's localStorage. Users can leave the upload page and return later to continue from where they left off.

## Features

✅ **Persistent Storage** - Automatically saves to localStorage
✅ **Smart Auto-fill** - Pre-fills metadata from artist/user data
✅ **File Name Detection** - Extracts titles from file names
✅ **Session Expiry** - 24-hour timeout for saved sessions
✅ **State Recovery** - Restore previous session on page load
✅ **Metadata Prefilling** - Cascading fallback: artist → user → profile

## Hook API

### `useUploadState()`

Main hook for managing upload state.

```typescript
const { state, updateState, clearState, resetFiles, hasSavedState, isLoaded } = useUploadState();
```

#### Returns

```typescript
{
  // Current upload state
  state: UploadState;

  // Update specific fields
  updateState: (updates: Partial<UploadState>) => void;

  // Clear all state and localStorage
  clearState: () => void;

  // Reset files but keep metadata
  resetFiles: () => void;

  // Check if there's saved state available
  hasSavedState: () => boolean;

  // Whether state has been loaded from storage
  isLoaded: boolean;
}
```

## State Structure

```typescript
interface UploadState {
  // Files
  coverUrl: string;
  coverFileName: string;
  mp3Url: string;
  mp3FileName: string;
  audioProgress: number;
  coverProgress: number;

  // Song Info
  songTitle: string;      // Extracted from cover filename
  artist: string;
  trackTitle: string;     // Extracted from mp3 filename
  isrc: string;
  upc: string;

  // Metadata
  producer: string;
  songwriter: string;
  writer: string;
  studio: string;
  recordLabel: string;
  genre: string;
  subGenre: string;
  language: string;      // Default: "English"
  country: string;
  city: string;
  explicit: string;      // "yes" | "no" | "covered"
  releaseDate: string;   // ISO date format

  // Additional Info
  info: string;
  lyrics: string;
  mediaLinks: {
    appleMusic: string;
    spotify: string;
    youtube: string;
    soundcloud: string;
    tidal: string;
    deezer: string;
    amazonMusic: string;
  };

  // Status
  submitted: boolean;
  audioUploading: boolean;
  coverUploading: boolean;
  rejectionFlag: boolean;
  rejectionReasons: string[];

  // Agreements
  agreedOwnership: boolean;
  agreedTerms: boolean;

  // Timestamps
  lastSaved: number;
}
```

## Usage Examples

### Basic Usage

```typescript
import { useUploadState } from "@/hooks/use-upload-state";

export function UploadForm() {
  const { state, updateState, isLoaded } = useUploadState();

  if (!isLoaded) return <LoadingSpinner />;

  return (
    <form>
      <input
        value={state.songTitle}
        onChange={(e) => updateState({ songTitle: e.target.value })}
        placeholder="Song Title"
      />
      {/* More fields... */}
    </form>
  );
}
```

### With File Upload

```typescript
const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Auto-extract title from filename
  const title = file.name.replace(/\.[^/.]+$/, "");

  updateState({
    coverFileName: file.name,
    songTitle: state.songTitle || title, // Use extracted name if not set
  });

  // Upload file...
};
```

### With Auto-fill from Artist Data

```typescript
import { prefillMetadata } from "@/hooks/use-upload-state";

useEffect(() => {
  if (!hasSavedState() && selectedArtist) {
    const prefilled = prefillMetadata(selectedArtist, userData, userProfileData);
    updateState(prefilled);
  }
}, [selectedArtist]);
```

### Restore Previous Session

```typescript
{
  hasSavedState() && (
    <Alert>
      <p>We found your previous upload session.</p>
      <Button onClick={() => clearState()}>Start Fresh</Button>
    </Alert>
  );
}
```

## Helper Functions

### `getFileNameWithoutExtension(fileName: string)`

Extracts file name without extension.

```typescript
import { getFileNameWithoutExtension } from "@/hooks/use-upload-state";

const fileName = "My Song.mp3";
const title = getFileNameWithoutExtension(fileName); // "My Song"
```

### `prefillMetadata(artistData?, userData?, userProfileData?)`

Intelligently prefills metadata from multiple sources with cascading fallback.

```typescript
import { prefillMetadata } from "@/hooks/use-upload-state";

const prefilled = prefillMetadata(
  selectedArtist,    // Priority 1: Artist data
  userData,          // Priority 2: User data
  userProfileData    // Priority 3: User profile
);

// Returns partial UploadState with prefilled values
```

## Storage Details

### Storage Keys

- `singft_upload_state` - Serialized upload state
- `singft_upload_timestamp` - When state was last saved

### Session Timeout

- Default: 24 hours
- After timeout, saved state is automatically cleared
- Configurable via `SESSION_TIMEOUT` constant

### Auto-save Behavior

- Saves occur after 2 seconds of state changes (debounced)
- File progress values are not persisted
- Automatic timestamp updates on each save

## Integration with Components

### Enhanced Upload Form Component

```typescript
import { EnhancedUploadForm, UploadStateSummary } from "@/components/artist/enhanced-upload-form";

export function UploadPage() {
  const { state, updateState } = useUploadState();
  const [selectedArtist, setSelectedArtist] = useState();

  return (
    <div>
      <EnhancedUploadForm
        selectedArtist={selectedArtist}
        userData={user}
        userProfileData={userProfile}
        showRestoreOption={true}
      >
        {(state, updateState) => (
          <div>
            <input
              value={state.songTitle}
              onChange={(e) => updateState({ songTitle: e.target.value })}
            />
            {/* Form fields... */}
          </div>
        )}
      </EnhancedUploadForm>

      <UploadStateSummary state={state} />
    </div>
  );
}
```

## Data Flow

```
┌─────────────────────────────┐
│   User Types/Uploads        │
└──────────────┬──────────────┘
               │
               ▼
        updateState()
               │
               ▼
        setState() (React)
               │
               ▼
        useEffect watches state
               │
               ▼
        Debounce 2 seconds
               │
               ▼
        Save to localStorage
               │
               ▼
        localStorage persists
               │
               ▼
       User returns later
               │
               ▼
       useEffect on mount
               │
               ▼
      Load from localStorage
               │
               ▼
      setState() with saved data
               │
               ▼
      User sees restored form
```

## Best Practices

### 1. Always Check `isLoaded`

```typescript
if (!isLoaded) {
  return <LoadingSpinner />;
}
```

### 2. Use Partial Updates

```typescript
// Good - only update changed fields
updateState({ songTitle: "New Title" });

// Avoid - unnecessary full state updates
updateState(entireNewState);
```

### 3. Auto-fill Intelligently

```typescript
// Only auto-fill if user hasn't set value
updateState({
  songTitle: state.songTitle || extractedName,
});
```

### 4. Handle File Uploads Properly

```typescript
// Don't store actual files in state
// Just store metadata and URLs
updateState({
  mp3Url: uploadedUrl,      // ✓ Store URL
  mp3FileName: file.name,   // ✓ Store name
  // mp3File: file,          // ✗ Don't store file object
});
```

### 5. Clear on Successful Submission

```typescript
if (uploadSuccess) {
  clearState(); // Clean up after successful upload
}
```

## Advanced Usage

### Custom Prefill Logic

```typescript
const customPrefill = useCallback(() => {
  const prefilled = prefillMetadata(selectedArtist, userData, userProfileData);

  // Add custom logic
  const enhancements = {
    ...prefilled,
    language: detectUserLanguage(), // Custom detection
    country: selectedArtist?.country || userData?.country,
  };

  updateState(enhancements);
}, [selectedArtist, userData, userProfileData]);
```

### Session Persistence Check

```typescript
const canResumeUpload = useCallback(() => {
  return hasSavedState() && state.coverUrl && state.mp3Url;
}, [hasSavedState, state]);
```

### Monitoring Upload Progress

```typescript
useEffect(() => {
  console.log(`Audio: ${state.audioProgress}%`);
  console.log(`Cover: ${state.coverProgress}%`);
}, [state.audioProgress, state.coverProgress]);
```

## Browser Compatibility

- ✅ Chrome 4+
- ✅ Firefox 3.5+
- ✅ Safari 4+
- ✅ Edge 12+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Storage Limits

- localStorage limit: ~5-10MB per domain
- Upload state typically uses <100KB
- Safe for persistent storage

## Performance Considerations

- Debounced saves (2 seconds)
- Minimal re-renders
- Efficient serialization
- Lazy loading on mount

## Troubleshooting

### State Not Persisting

1. Check browser's localStorage is enabled
2. Check for quota exceeded errors
3. Verify `isLoaded` is true before reading state
4. Check browser console for errors

### Old Session Not Loading

- Sessions expire after 24 hours
- Clear browser cache and try again
- Check browser console for storage errors

### Too Many Saves

- Increase debounce time (currently 2 seconds)
- Consider removing high-frequency updates
- Monitor localStorage quota usage

## Related Components

- [EnhancedUploadForm](../components/artist/enhanced-upload-form.tsx) - UI wrapper
- [UploadPreview](../components/album/upload-preview.tsx) - Preview component
- [PictureWithPlayer](../components/album/picture-with-player.tsx) - Player component

## Migration Guide

### From Manual State Management

```typescript
// Before: Manual state management
const [songTitle, setSongTitle] = useState("");
const [artist, setArtist] = useState("");
// ... many more states

// After: Centralized persistent state
const { state, updateState } = useUploadState();

// Update multiple fields at once
updateState({ songTitle: "...", artist: "..." });
```

## Testing

```typescript
// Clear state before each test
beforeEach(() => {
  localStorage.clear();
});

// Test persistence
test("persists state to localStorage", () => {
  const { updateState } = renderHook(() => useUploadState());
  updateState({ songTitle: "Test" });

  expect(localStorage.getItem("singft_upload_state")).toBeDefined();
});

// Test restoration
test("loads state from localStorage", () => {
  localStorage.setItem(
    "singft_upload_state",
    JSON.stringify({ songTitle: "Saved" })
  );

  const { result } = renderHook(() => useUploadState());
  expect(result.current.state.songTitle).toBe("Saved");
});
```

## FAQ

**Q: How long is state saved?**
A: 24 hours. Sessions older than 24 hours are automatically cleared.

**Q: Can users see saved passwords?**
A: No. Sensitive data like passwords should never be stored in state.

**Q: What if localStorage is disabled?**
A: Hook still works, but state won't persist between sessions.

**Q: Can I export upload state?**
A: Yes, serialize `state` object and send to server for resumable uploads.

---

For integration examples, see [ENHANCED_UPLOAD_FORM.md](../components/artist/ENHANCED_UPLOAD_FORM.md).
