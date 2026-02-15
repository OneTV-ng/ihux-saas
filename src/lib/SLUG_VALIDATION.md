# Artist Slug Validation System

## Overview

The slug validation system provides real-time background checking of artist name availability during account creation. It prevents duplicate artist names and offers suggestions for alternatives.

## Components & Functions

### 1. **checkSlugAvailability()** - Backend Function
**Location:** `src/lib/artist-service.ts`

Validates if an artist name/slug is available for creation.

```typescript
// Returns validation result with suggestions
const result = await checkSlugAvailability("The Black Mambas");
// Result:
// {
//   available: true,
//   message: "Artist name is available"
// }
```

**Features:**
- Normalizes artist names to URL-safe slugs
- Checks database for existing artists with similar names
- Provides alternative suggestions if name is taken
- Handles special characters and spaces

---

### 2. **GET /api/artist/check-slug** - API Endpoint
**Location:** `src/app/api/artist/check-slug/route.ts`

HTTP endpoint for real-time slug availability checking from the frontend.

**Usage:**
```bash
GET /api/artist/check-slug?name=The%20Black%20Mambas
```

**Response:**
```json
{
  "available": true,
  "message": "Artist name is available"
}
```

Or if taken:
```json
{
  "available": false,
  "message": "Artist name is already taken",
  "suggestedSlug": "the-black-mambas1"
}
```

---

### 3. **useSlugValidation()** - React Hook
**Location:** `src/hooks/use-slug-validation.ts`

Custom hook for managing slug validation state in React components.

**Usage:**
```typescript
const { loading, error, result, checkSlug } = useSlugValidation();

// Check slug as user types
const handleNameChange = (value: string) => {
  checkSlug(value); // Auto-debounced (500ms)
};

// Access validation state
console.log(loading);      // boolean - checking in progress
console.log(error);        // string | null - error message
console.log(result);       // validation result object
```

**Features:**
- Built-in debouncing (500ms default)
- Error handling
- Loading state management
- Automatic cleanup of timers

---

### 4. **SlugValidationFeedback** - UI Component
**Location:** `src/components/artist/slug-validation-feedback.tsx`

Displays real-time validation feedback to users.

**Usage:**
```typescript
import { SlugValidationFeedback } from "@/components/artist/slug-validation-feedback";

<SlugValidationFeedback
  loading={isChecking}
  error={validationError}
  result={validationResult}
/>
```

**States Displayed:**
- ✨ Loading state with spinner
- ✅ Success: "Artist name is available"
- ⚠️ Unavailable with suggestions
- ❌ Error state

---

### 5. **CreateArtistForm** - Complete Example
**Location:** `src/components/artist/create-artist-form.tsx`

Full-featured form component demonstrating all slug validation features.

**Features:**
- Real-time slug validation as user types
- Optional fields (genre, city, country)
- Form submission with validation
- Error handling and feedback
- Loading states
- Success callback

**Usage:**
```typescript
import { CreateArtistForm } from "@/components/artist/create-artist-form";

<CreateArtistForm
  onSuccess={(artistId) => {
    // Navigate or update state
    router.push(`/desk/artist/${artistId}`);
  }}
  onCancel={() => {
    // Handle cancellation
  }}
/>
```

---

## Integration Examples

### Example 1: Simple Slug Check in a Form Field

```typescript
import { useSlugValidation } from "@/hooks/use-slug-validation";
import { SlugValidationFeedback } from "@/components/artist/slug-validation-feedback";

export function MyArtistForm() {
  const [name, setName] = useState("");
  const { loading, error, result, checkSlug } = useSlugValidation();

  return (
    <div>
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          checkSlug(e.target.value);
        }}
        placeholder="Enter artist name"
      />
      <SlugValidationFeedback
        loading={loading}
        error={error}
        result={result}
      />
    </div>
  );
}
```

### Example 2: Manual API Call

```typescript
async function checkArtistName(name: string) {
  const response = await fetch(
    `/api/artist/check-slug?name=${encodeURIComponent(name)}`
  );
  const data = await response.json();

  if (data.available) {
    console.log("Name is available!");
  } else {
    console.log(`Try "${data.suggestedSlug}" instead`);
  }
}
```

### Example 3: Backend Validation

```typescript
import { checkSlugAvailability } from "@/lib/artist-service";

// In your API route or server action
const result = await checkSlugAvailability(artistName);
if (!result.available) {
  throw new Error(`Artist name taken. Try: ${result.suggestedSlug}`);
}
```

---

## Data Flow

```
User Types Artist Name
       ↓
useSlugValidation Hook (with debounce)
       ↓
GET /api/artist/check-slug
       ↓
checkSlugAvailability() (backend function)
       ↓
Database Query via getArtistBySlug()
       ↓
SlugValidationFeedback Component
       ↓
User sees availability status + suggestions
```

---

## Key Features

✅ **Real-time Validation** - Immediate feedback as users type
✅ **Debounced Requests** - Reduces server load (500ms default)
✅ **Smart Suggestions** - Offers alternatives if name is taken
✅ **Error Handling** - Graceful error states
✅ **Loading States** - Clear indication when checking
✅ **Type-Safe** - Full TypeScript support
✅ **Accessible** - Proper ARIA labels and semantic HTML
✅ **Responsive** - Works on mobile and desktop

---

## Customization

### Change Debounce Duration

```typescript
// Check after 1 second of no typing instead of 500ms
checkSlug(artistName, 1000);
```

### Customize Feedback Component

```typescript
<SlugValidationFeedback
  loading={loading}
  error={error}
  result={result}
/>
// Customize colors/icons by modifying slug-validation-feedback.tsx
```

### Extend Slug Validation

```typescript
// Add additional checks in checkSlugAvailability()
export async function checkSlugAvailability(slugInput: string) {
  // ... existing checks

  // Add custom validation
  if (slugInput.includes("admin")) {
    return {
      available: false,
      message: "Reserved artist name"
    };
  }
}
```

---

## Performance Considerations

- **Debouncing**: Defaults to 500ms to reduce API calls
- **Single Lookup**: Uses efficient database queries
- **Caching**: Consider adding Redis caching for high-traffic scenarios
- **Rate Limiting**: Recommend adding API rate limiting to `/api/artist/check-slug`

---

## Testing

```typescript
// Test the hook
test("checkSlug returns available true for new name", async () => {
  const { result } = renderHook(() => useSlugValidation());
  await act(() => result.current.checkSlug("new-artist-name"));

  expect(result.current.result?.available).toBe(true);
});

// Test the API
test("GET /api/artist/check-slug returns availability", async () => {
  const res = await fetch("/api/artist/check-slug?name=test");
  const data = await res.json();

  expect(data).toHaveProperty("available");
  expect(data).toHaveProperty("message");
});
```

---

## Migration Notes

If updating existing artist creation flows:

1. Import the new hook and component
2. Wrap artist name input with validation
3. Add slug feedback component below input
4. Update form submission to validate `slugResult.available`
5. Remove old manual validation code

---

## Troubleshooting

**Issue**: Validation never completes
- Check if debounce time is too long
- Verify API endpoint is accessible
- Check browser console for errors

**Issue**: False positives (name marked taken when it's not)
- May be due to slug normalization differences
- Check `getArtistBySlug()` normalization logic
- Ensure database queries are case-insensitive

**Issue**: API always returns unavailable
- Check database connectivity
- Verify artists table has data
- Test `getArtistBySlug()` directly

---

## Future Enhancements

- [ ] Add Redis caching for frequently checked names
- [ ] Implement rate limiting per user/IP
- [ ] Add webhook for real-time collaboration
- [ ] Support checking multiple names at once
- [ ] Add profanity/reserved word checking
- [ ] Analytics on checked vs created names
