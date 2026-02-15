# 🚀 DXL AUTH API - QUICK REFERENCE

## Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `@=auth.check.email` | GET | Check email availability |
| `@=auth.check.username` | GET | Check username availability |
| `@=auth.register` | POST | Register new user |
| `@=auth.send_verification_code` | POST | Send PIN to email |
| `@=auth.verify_email` | POST | Verify with PIN |
| `@=auth.resend_code` | POST | Resend PIN |

---

## Quick Examples

### Check Email
```bash
GET /api/dxl/v3?@=auth.check.email&email=user@example.com
```

### Check Username
```bash
GET /api/dxl/v3?@=auth.check.username&username=johndoe
```

### Register
```bash
POST /api/dxl/v3?@=auth.register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstname": "John",
  "lastname": "Doe",
  "username": "johndoe"
}
```

### Verify Email
```bash
POST /api/dxl/v3?@=auth.verify_email
{
  "email": "user@example.com",
  "code": "123456"
}
```

### Resend Code
```bash
POST /api/dxl/v3?@=auth.resend_code
{
  "email": "user@example.com"
}
```

---

## DxlApiClient Methods

```typescript
const client = new DxlApiClient({ baseUrl: '/api/dxl/v3' });

// Check availability
await client.checkEmailAvailability('user@example.com');
await client.checkUsernameAvailability('johndoe');

// Register
await client.register({
  email: 'user@example.com',
  password: 'pass',
  firstname: 'John',
  lastname: 'Doe',
  username: 'johndoe' // optional
});

// Verify
await client.verifyEmail('user@example.com', '123456');
await client.sendVerificationCode('user@example.com');
await client.resendVerificationCode('user@example.com');
```

---

## Response Format

```json
{
  "status": true,
  "data": { ... },
  "message": "...",
  "info": { ... }
}
```

---

## Username Rules

- 3-20 characters
- Letters, numbers, underscores, hyphens
- Case-insensitive
- Example: `john_doe`, `artist123`, `my-band`

---

## PIN Code

- **Length**: 6 digits
- **Expiry**: 10 minutes
- **Usage**: One-time (deleted after use)
- **Type**: Sent via email

---

## Demo Page

**http://localhost:3000/auth-demo**

Test all features interactively!

---

## Database Migration

```bash
pnpm db:push
```

---

## Files

- Handler: `src/lib/handlers/auth-handler.ts`
- Client: `src/lib/dxl-api-client.ts`
- Demo: `src/app/auth-demo/page.tsx`
- Docs: `DOCUMENTATION/DXL_AUTH_API_GUIDE.md`

---

## Status

✅ All endpoints implemented  
✅ TypeScript types complete  
✅ Demo page ready  
✅ Documentation complete  
⏳ Migration pending (`pnpm db:push`)

---

**DXL Auth API v1.0.0**
