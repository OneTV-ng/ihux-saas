# useShowMessage Hook

A convenient wrapper around the Sonner toast notification system for displaying user feedback messages.

## Overview

`useShowMessage` provides a simple API for showing success, error, and info messages to users through toast notifications.

## Basic Usage

```typescript
import { useShowMessage } from "@/hooks/use-show-message";

export function MyComponent() {
  const { success, error, info, showMessage } = useShowMessage();

  return (
    <button onClick={() => success("Operation completed!")}>
      Show Success
    </button>
  );
}
```

## API

### `useShowMessage()`

Returns an object with the following methods:

#### `success(message: string, description?: string)`

Shows a success toast notification (green).

```typescript
success("Artist created!");
success("Artist created!", "You can now upload songs");
```

#### `error(message: string, description?: string)`

Shows an error toast notification (red).

```typescript
error("Failed to create artist");
error("Failed to create artist", "Please check your input and try again");
```

#### `info(message: string, description?: string)`

Shows an info toast notification (blue).

```typescript
info("Please verify your email", "Check your inbox for the verification link");
```

#### `showMessage(message: string, type: "success" | "error" | "info", description?: string)`

Generic method for showing any type of message.

```typescript
showMessage("Custom message", "success");
showMessage("Something went wrong", "error", "Try again later");
```

## Examples

### Example 1: Form Submission

```typescript
import { useShowMessage } from "@/hooks/use-show-message";

export function LoginForm() {
  const { success, error } = useShowMessage();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Login failed");

      success("Welcome back!", "You're now logged in");
      // Navigate user...
    } catch (err) {
      error(
        "Login failed",
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### Example 2: Artist Creation

```typescript
import { useShowMessage } from "@/hooks/use-show-message";
import { useSlugValidation } from "@/hooks/use-slug-validation";

export function CreateArtistForm() {
  const { success, error } = useShowMessage();
  const { checkSlug, result } = useSlugValidation();

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/artist/create", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Creation failed");

      const { artistId } = await response.json();
      success(
        `"${formData.displayName}" created!`,
        "Start uploading your music now"
      );
    } catch (err) {
      error("Failed to create artist");
    }
  };

  return (
    <button onClick={handleCreate} disabled={!result?.available}>
      Create Artist
    </button>
  );
}
```

### Example 3: Async Operations

```typescript
import { useShowMessage } from "@/hooks/use-show-message";

export function DeleteArtistButton({ artistId }: { artistId: string }) {
  const { success, error } = useShowMessage();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this artist?")) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/artist/${artistId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Deletion failed");

      success("Artist deleted", "The artist has been removed from your account");
      // Refresh list...
    } catch (err) {
      error(
        "Could not delete artist",
        "There was an error deleting the artist. Try again later."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleting} variant="destructive">
      {deleting ? "Deleting..." : "Delete Artist"}
    </button>
  );
}
```

### Example 4: Real-time Validation Feedback

```typescript
import { useShowMessage } from "@/hooks/use-show-message";

export function EmailVerificationInput() {
  const { success, info, error } = useShowMessage();
  const [email, setEmail] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Real-time feedback
    if (!value) {
      info("Email is required");
    } else if (!value.includes("@")) {
      error("Invalid email format");
    } else {
      success("Email format looks good!");
    }
  };

  return <input value={email} onChange={handleEmailChange} />;
}
```

### Example 5: Batch Operations

```typescript
import { useShowMessage } from "@/hooks/use-show-message";

export function BulkUploadSongs() {
  const { success, error, info } = useShowMessage();

  const handleUpload = async (files: File[]) => {
    info(`Uploading ${files.length} songs...`);

    let successCount = 0;
    let failureCount = 0;

    for (const file of files) {
      try {
        await uploadSong(file);
        successCount++;
      } catch (err) {
        failureCount++;
      }
    }

    if (failureCount === 0) {
      success(
        `All ${successCount} songs uploaded!`,
        "Your music is now available"
      );
    } else {
      error(
        `Upload completed with errors`,
        `${successCount} succeeded, ${failureCount} failed. Try again for failed uploads.`
      );
    }
  };

  return <button onClick={() => handleUpload(files)}>Upload Songs</button>;
}
```

## Integration with Components

### With Slug Validation

```typescript
import { useShowMessage } from "@/hooks/use-show-message";
import { SlugValidationFeedback } from "@/components/artist/slug-validation-feedback";

export function ArtistNameInput() {
  const { checkSlug, loading, error, result } = useSlugValidation();
  const { success, error: showError } = useShowMessage();

  // Option 1: Use component's built-in notifications
  return (
    <SlugValidationFeedback
      loading={loading}
      error={error}
      result={result}
      showNotifications={true} // Enables toast notifications
    />
  );

  // Option 2: Manual control
  useEffect(() => {
    if (result?.available) {
      success("Name is available!");
    }
  }, [result]);
}
```

## Best Practices

1. **Use appropriate notification types**
   - `success()` for completed actions
   - `error()` for failures or validation issues
   - `info()` for informational messages

2. **Keep messages concise**
   ```typescript
   // Good
   success("Artist created!");

   // Avoid - too verbose
   success("Your new artist profile has been successfully created in the system");
   ```

3. **Provide helpful descriptions**
   ```typescript
   // Good - user knows what to do next
   error("Upload failed", "File size exceeds 100MB limit");

   // Poor - no context
   error("Upload failed");
   ```

4. **Use during async operations**
   ```typescript
   const handleSubmit = async () => {
     try {
       const response = await apiCall();
       success("Success message");
     } catch (err) {
       error("Error message");
     }
   };
   ```

5. **Combine with UI feedback**
   ```typescript
   // Show loading state + message
   <button disabled={loading}>
     {loading ? "Uploading..." : "Upload"}
   </button>
   {/* After completion, show toast */}
   ```

## Styling

Notifications are automatically styled based on type:
- **Success**: Green background
- **Error**: Red background
- **Info**: Default/Blue background

The styling respects dark mode and matches your application theme.

## See Also

- [use-toast.ts](./use-toast.ts) - Underlying toast implementation
- [Sonner Documentation](https://sonner.emilkowal.ski/) - Toast library docs

## Related Hooks

- `useSlugValidation()` - Artist name validation with notifications support
- `useToast()` - Lower-level toast API (if you need more control)
