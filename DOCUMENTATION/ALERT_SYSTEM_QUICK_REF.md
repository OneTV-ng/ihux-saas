# ✨ Alert System - Quick Reference

## Basic Usage

```tsx
import { useAlert } from "@/contexts/alert-context";

function MyComponent() {
  const { showAlert } = useAlert();
  
  // Success (green) - 3 seconds
  showAlert("Operation successful!", "success");
  
  // Error (red) - 3 seconds
  showAlert("Something went wrong", "error");
  
  // Info (blue) - 3 seconds
  showAlert("Processing your request", "info");
  
  // Custom duration - 5 seconds
  showAlert("Custom duration message", "success", 5000);
}
```

---

## Alert Types

| Type | Color | Icon | Use Case |
|------|-------|------|----------|
| `success` | Green | ✓ CheckCircle2 | Success messages, confirmations |
| `error` | Red | ✗ XCircle | Error messages, validation failures |
| `info` | Blue | ℹ Info | Informational messages, tips |

---

## Features

- ✅ **Auto-dismiss** after 3 seconds (default)
- ✅ **Manual close** with X button
- ✅ **Smooth animations** (slide in from right)
- ✅ **Translucent background** with backdrop blur
- ✅ **Stacking support** (multiple alerts)
- ✅ **Customizable duration**
- ✅ **Fixed positioning** (top-right corner)

---

## Registration Flow Examples

```tsx
// Step 1: First name
showAlert("Great! Nice to meet you, John!", "success");

// Step 3: Username available
showAlert("Username is available!", "success");

// Step 3: Username taken
showAlert("Username is already taken", "error");

// Step 4: Email setup
showAlert("Now let's set up your account", "info");

// Complete
showAlert("Welcome, John! Check your email.", "success");
```

---

## Components

### AlertProvider
Wrap your app in `<AlertProvider>`:

```tsx
// layout.tsx
<AlertProvider>
  {children}
  <AlertContainer />
</AlertProvider>
```

### AlertContainer
Renders all active alerts (add once in layout):

```tsx
<AlertContainer />
```

### useAlert Hook
Access alert functions:

```tsx
const { showAlert, hideAlert, alerts } = useAlert();
```

---

## Styling

### Default Colors
- Success: `bg-green-500/90`
- Error: `bg-red-500/90`
- Info: `bg-blue-500/90`

### Customization
Edit `alert-bubble.tsx` → `alertStyles` object

---

## Files

- Context: `/src/contexts/alert-context.tsx`
- Component: `/src/components/ui/alert-bubble.tsx`
- Usage: Any component with `useAlert()`

---

## Tips

1. Keep messages **short and clear**
2. Use **appropriate types** (success/error/info)
3. Don't stack too many alerts
4. Default 3s duration works for most cases
5. Use longer duration for important messages

---

**Quick Test:**

```tsx
const { showAlert } = useAlert();

<button onClick={() => showAlert("Test!", "success")}>
  Show Alert
</button>
```
