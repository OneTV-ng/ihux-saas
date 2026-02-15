# Artist Creation System - Complete Integration Guide

This guide covers the complete artist creation system including slug validation and user notifications.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Artist Creation Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Input (Artist Name)                                    │
│         ↓                                                     │
│  useSlugValidation Hook (debounced)                         │
│         ↓                                                     │
│  GET /api/artist/check-slug                                 │
│         ↓                                                     │
│  checkSlugAvailability()                                    │
│         ↓                                                     │
│  SlugValidationFeedback Component                           │
│         ↓                                                     │
│  useShowMessage (toast notifications)                       │
│         ↓                                                     │
│  Form Submission → POST /api/artist/create                  │
│         ↓                                                     │
│  useShowMessage (success/error)                             │
│         ↓                                                     │
│  onSuccess Callback or Navigation                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. **useShowMessage Hook**
- **Location**: `src/hooks/use-show-message.ts`
- **Purpose**: Convenience wrapper for toast notifications
- **Methods**: `success()`, `error()`, `info()`, `showMessage()`

### 2. **useSlugValidation Hook**
- **Location**: `src/hooks/use-slug-validation.ts`
- **Purpose**: Real-time slug availability checking with debouncing
- **Methods**: `checkSlug(name, debounceMs?)`
- **Returns**: `{ loading, error, result, checkSlug }`

### 3. **SlugValidationFeedback Component**
- **Location**: `src/components/artist/slug-validation-feedback.tsx`
- **Purpose**: Visual feedback for slug validation
- **Props**: `loading`, `error`, `result`, `showNotifications`

### 4. **CreateArtistForm Component**
- **Location**: `src/components/artist/create-artist-form.tsx`
- **Purpose**: Complete artist creation form with all validations
- **Features**:
  - Real-time slug validation
  - Toast notifications
  - Optional fields (genre, city, country)
  - Error handling
  - Success callbacks

### 5. **Backend Services**
- **Location**: `src/lib/artist-service.ts`
- **Function**: `checkSlugAvailability()` - validates slug availability
- **Function**: `createArtist()` - creates new artist with validation

### 6. **API Endpoints**
- **GET /api/artist/check-slug** - Check slug availability
- **POST /api/artist/create** - Create new artist

## Quick Start

### Basic Implementation

```typescript
import { CreateArtistForm } from "@/components/artist/create-artist-form";

export function ArtistPage() {
  return (
    <CreateArtistForm
      onSuccess={(artistId) => {
        // Navigate or refresh
        router.push(`/desk/artist/${artistId}`);
      }}
      onCancel={() => {
        // Handle cancellation
      }}
    />
  );
}
```

### Custom Implementation

```typescript
import { useShowMessage } from "@/hooks/use-show-message";
import { useSlugValidation } from "@/hooks/use-slug-validation";
import { SlugValidationFeedback } from "@/components/artist/slug-validation-feedback";

export function CustomArtistForm() {
  const { success, error } = useShowMessage();
  const { loading, error: slugError, result, checkSlug } = useSlugValidation();
  const [artistName, setArtistName] = useState("");

  const handleCreate = async () => {
    if (!result?.available) {
      error("Please choose an available artist name");
      return;
    }

    try {
      const response = await fetch("/api/artist/create", {
        method: "POST",
        body: JSON.stringify({ artistName }),
      });

      const { artistId } = await response.json();
      success(`Created "${artistName}" successfully!`);
    } catch (err) {
      error("Failed to create artist");
    }
  };

  return (
    <div>
      <input
        value={artistName}
        onChange={(e) => {
          setArtistName(e.target.value);
          checkSlug(e.target.value);
        }}
      />
      <SlugValidationFeedback
        loading={loading}
        error={slugError}
        result={result}
        showNotifications={true}
      />
      <button onClick={handleCreate} disabled={!result?.available}>
        Create Artist
      </button>
    </div>
  );
}
```

## Complete Data Flow

### 1. User Types Artist Name
```typescript
handleArtistNameChange(e) {
  setFormData(prev => ({ ...prev, artistName: e.target.value }));
  checkSlug(e.target.value); // Triggers debounced check
}
```

### 2. Validation Check (Debounced 500ms)
```typescript
// In useSlugValidation hook
debounceTimer = setTimeout(() => {
  fetch(`/api/artist/check-slug?name=${encodeURIComponent(artistName)}`)
    .then(response => response.json())
    .then(data => setResult(data))
}, 500);
```

### 3. Backend Processing
```typescript
// In GET /api/artist/check-slug
const result = await checkSlugAvailability(name);
return NextResponse.json(result);
```

### 4. Database Query
```typescript
// In checkSlugAvailability()
const existing = await getArtistBySlug(slug);
if (existing) {
  return {
    available: false,
    message: "Artist name is already taken",
    suggestedSlug: "suggested-name-1"
  };
}
```

### 5. UI Update & Notification
```typescript
// SlugValidationFeedback renders feedback
// useShowMessage optionally shows toast

success("Artist name is available!")
```

### 6. Form Submission
```typescript
handleSubmit(e) {
  // Validation checks
  if (!slugResult?.available) {
    showError("Please choose an available name");
    return;
  }

  // Submit form
  const response = await fetch("/api/artist/create", {
    method: "POST",
    body: JSON.stringify(formData)
  });

  // Show result
  success("Artist created successfully!");
}
```

## Integration Patterns

### Pattern 1: Self-Contained Form

```typescript
// Embed the complete form in your page
import { CreateArtistForm } from "@/components/artist/create-artist-form";

export function MyPage() {
  return (
    <CreateArtistForm
      onSuccess={(artistId) => {
        console.log(`Created artist: ${artistId}`);
      }}
    />
  );
}
```

### Pattern 2: Manual Notifications

```typescript
// Full control over notifications
export function MyForm() {
  const { success, error, info } = useShowMessage();

  const handleAction = async () => {
    info("Processing...");
    try {
      // Do something
      success("Done!");
    } catch (err) {
      error("Failed!");
    }
  };
}
```

### Pattern 3: Slug Validation Only

```typescript
// Just validate slugs without full form
export function SlugChecker() {
  const { result, checkSlug } = useSlugValidation();

  return (
    <>
      <input onChange={(e) => checkSlug(e.target.value)} />
      {result?.available && <p>✓ Available</p>}
      {!result?.available && <p>✗ Taken: Try {result?.suggestedSlug}</p>}
    </>
  );
}
```

## Error Handling

### Validation Errors
```typescript
if (!slugResult?.available) {
  showError("Artist name taken", `Try "${slugResult.suggestedSlug}"`);
}
```

### Network Errors
```typescript
try {
  const response = await fetch("/api/artist/check-slug?name=...");
  if (!response.ok) throw new Error("Network error");
} catch (err) {
  showError("Could not check availability", "Please try again");
}
```

### API Errors
```typescript
try {
  const response = await fetch("/api/artist/create", {
    method: "POST",
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const { error: errorMsg } = await response.json();
    throw new Error(errorMsg);
  }
} catch (err) {
  showError("Failed to create artist", err.message);
}
```

## Toast Notification Types

### Success
```typescript
success("Action completed!", "Optional description");
// Shows: Green toast with checkmark
```

### Error
```typescript
error("Something went wrong", "Optional details");
// Shows: Red toast with error icon
```

### Info
```typescript
info("Just letting you know", "Optional details");
// Shows: Blue toast with info icon
```

## Testing

### Testing useShowMessage
```typescript
import { renderHook, act } from "@testing-library/react";
import { useShowMessage } from "@/hooks/use-show-message";

test("success shows success toast", () => {
  const { result } = renderHook(() => useShowMessage());
  act(() => {
    result.current.success("Test message");
  });
  // Verify toast was called
});
```

### Testing useSlugValidation
```typescript
test("checkSlug returns available", async () => {
  const { result } = renderHook(() => useSlugValidation());

  await act(async () => {
    result.current.checkSlug("new-name");
  });

  await waitFor(() => {
    expect(result.current.result?.available).toBe(true);
  });
});
```

## Performance Optimization

### Debounce Duration
- Default: 500ms (good balance)
- For rapid typing: 300ms
- For slower connections: 1000ms

```typescript
checkSlug(artistName, 800); // Custom debounce
```

### Request Batching
For multiple validations:
```typescript
// Batch requests in one API call
const response = await fetch("/api/artist/check-slugs", {
  method: "POST",
  body: JSON.stringify({ names: [...] })
});
```

### Caching
Consider caching results:
```typescript
const cache = new Map();

if (cache.has(slug)) {
  setResult(cache.get(slug));
} else {
  const result = await checkSlug(slug);
  cache.set(slug, result);
}
```

## Files Created/Modified

### Created
- `src/hooks/use-show-message.ts` - Main notification hook
- `src/hooks/use-slug-validation.ts` - Slug validation hook
- `src/components/artist/slug-validation-feedback.tsx` - Validation UI
- `src/components/artist/create-artist-form.tsx` - Complete form
- `src/app/api/artist/check-slug/route.ts` - Slug check API
- `src/lib/SLUG_VALIDATION.md` - Slug validation docs
- `src/hooks/USE_SHOW_MESSAGE.md` - Notification hook docs

### Modified
- `src/lib/artist-service.ts` - Added `checkSlugAvailability()`

## Related Documentation

- [useShowMessage Hook](./use-show-message.ts) - Notification API
- [useSlugValidation Hook](./use-slug-validation.ts) - Validation API
- [SLUG_VALIDATION.md](./SLUG_VALIDATION.md) - Slug validation system
- [USE_SHOW_MESSAGE.md](./USE_SHOW_MESSAGE.md) - Notification examples

## Next Steps

1. Import and use `CreateArtistForm` in your pages
2. Customize styling to match your brand
3. Add additional validations as needed
4. Implement rate limiting on API endpoint
5. Add analytics for validation checks
6. Set up error tracking/monitoring

---

For questions or issues, see the individual documentation files for each component.
