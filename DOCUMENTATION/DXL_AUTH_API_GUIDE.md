# DXL Auth API - Complete Guide

## Overview

The DXL Auth API provides comprehensive authentication endpoints with username/email availability checks and PIN-based email verification. This allows users to verify their email either immediately at signup or afterwards.

## Features

✅ **Email Availability Check** - Verify if an email is available before registration  
✅ **Username Availability Check** - Check username availability with format validation  
✅ **Enhanced Registration** - Includes firstname, lastname, and optional username  
✅ **PIN-based Email Verification** - 6-digit code sent via email  
✅ **Flexible Verification Timing** - Verify immediately at signup or later  
✅ **Resend Verification Code** - Request new code if expired or lost  

---

## API Endpoints

### 1. Check Email Availability

**Endpoint:** `GET /api/dxl/v3?@=auth.check.email`

**Parameters:**
- `email` (required) - Email address to check

**Response:**
```json
{
  "info": {
    "action_requested": "auth.check.email",
    "response_module": "auth",
    "module_version": "1.0.0",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "request_id": "req_1234567890",
    "execution_time_ms": 45
  },
  "status": true,
  "data": {
    "email": "user@example.com",
    "available": true,
    "message": "Email is available"
  },
  "message": "Email is available"
}
```

**Example:**
```typescript
const res = await fetch('/api/dxl/v3?@=auth.check.email&email=user@example.com');
const data = await res.json();
console.log(data.data.available); // true or false
```

---

### 2. Check Username Availability

**Endpoint:** `GET /api/dxl/v3?@=auth.check.username`

**Parameters:**
- `username` (required) - Username to check (3-20 characters, alphanumeric, underscores, hyphens)

**Response:**
```json
{
  "info": {
    "action_requested": "auth.check.username",
    "response_module": "auth",
    "module_version": "1.0.0",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "request_id": "req_1234567891",
    "execution_time_ms": 38
  },
  "status": true,
  "data": {
    "username": "john_doe",
    "available": true,
    "message": "Username is available"
  },
  "message": "Username is available"
}
```

**Username Rules:**
- 3-20 characters
- Letters, numbers, underscores, hyphens only
- Case-insensitive (stored lowercase)

**Example:**
```typescript
const res = await fetch('/api/dxl/v3?@=auth.check.username&username=john_doe');
const data = await res.json();
console.log(data.data.available); // true or false
```

---

### 3. Register New User

**Endpoint:** `POST /api/dxl/v3?@=auth.register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstname": "John",
  "lastname": "Doe",
  "username": "johndoe" // optional
}
```

**Response:**
```json
{
  "info": {
    "action_requested": "auth.register",
    "response_module": "auth",
    "module_version": "1.0.0",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "request_id": "req_1234567892",
    "execution_time_ms": 523
  },
  "status": true,
  "data": {
    "user_id": "user_abc123",
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "username": "johndoe",
    "verification_code_sent": true,
    "message": "Registration successful. Please check your email for the verification code."
  },
  "message": "Registration successful. Verification code sent to your email."
}
```

**Example:**
```typescript
const res = await fetch('/api/dxl/v3?@=auth.register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    firstname: 'John',
    lastname: 'Doe',
    username: 'johndoe'
  })
});
const data = await res.json();
console.log(data.data.user_id); // New user ID
```

---

### 4. Verify Email with Code

**Endpoint:** `POST /api/dxl/v3?@=auth.verify_email`

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "info": {
    "action_requested": "auth.verify_email",
    "response_module": "auth",
    "module_version": "1.0.0",
    "timestamp": "2024-01-15T10:35:00.000Z",
    "request_id": "req_1234567893",
    "execution_time_ms": 78
  },
  "status": true,
  "data": {
    "email": "user@example.com",
    "verified": true,
    "message": "Email verified successfully"
  },
  "message": "Email verified successfully"
}
```

**Example:**
```typescript
const res = await fetch('/api/dxl/v3?@=auth.verify_email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    code: '123456'
  })
});
const data = await res.json();
console.log(data.data.verified); // true
```

---

### 5. Send Verification Code

**Endpoint:** `POST /api/dxl/v3?@=auth.send_verification_code`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "info": {
    "action_requested": "auth.send_verification_code",
    "response_module": "auth",
    "module_version": "1.0.0",
    "timestamp": "2024-01-15T10:40:00.000Z",
    "request_id": "req_1234567894",
    "execution_time_ms": 234
  },
  "status": true,
  "data": {
    "email": "user@example.com",
    "code_sent": true,
    "expires_in": "10 minutes"
  },
  "message": "Verification code sent to your email"
}
```

---

### 6. Resend Verification Code

**Endpoint:** `POST /api/dxl/v3?@=auth.resend_code`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "info": {
    "action_requested": "auth.resend_code",
    "response_module": "auth",
    "module_version": "1.0.0",
    "timestamp": "2024-01-15T10:45:00.000Z",
    "request_id": "req_1234567895",
    "execution_time_ms": 198
  },
  "status": true,
  "data": {
    "email": "user@example.com",
    "code_sent": true,
    "expires_in": "10 minutes"
  },
  "message": "New verification code sent to your email"
}
```

---

## Complete Registration Flow

### Option 1: Verify Immediately at Signup

```typescript
// Step 1: Check email availability
const emailCheck = await fetch('/api/dxl/v3?@=auth.check.email&email=user@example.com');
const emailData = await emailCheck.json();
if (!emailData.data.available) {
  alert('Email already taken');
  return;
}

// Step 2: Check username availability (optional)
const usernameCheck = await fetch('/api/dxl/v3?@=auth.check.username&username=johndoe');
const usernameData = await usernameCheck.json();
if (!usernameData.data.available) {
  alert('Username already taken');
  return;
}

// Step 3: Register
const register = await fetch('/api/dxl/v3?@=auth.register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    firstname: 'John',
    lastname: 'Doe',
    username: 'johndoe'
  })
});
const regData = await register.json();
// Verification code automatically sent

// Step 4: Verify email with code
const code = prompt('Enter the 6-digit code from your email');
const verify = await fetch('/api/dxl/v3?@=auth.verify_email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    code: code
  })
});
const verifyData = await verify.json();
if (verifyData.status) {
  alert('Email verified! You can now login.');
}
```

### Option 2: Verify Later

```typescript
// Step 1-3: Same as Option 1 (Check + Register)

// User can close the page and verify later

// Later, on verification page:
const verify = await fetch('/api/dxl/v3?@=auth.verify_email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    code: '123456'
  })
});
```

### Option 3: Resend Code

```typescript
// If code expired or lost
const resend = await fetch('/api/dxl/v3?@=auth.resend_code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});
const resendData = await resend.json();
alert('New code sent!');
```

---

## Using the DxlApiClient

```typescript
import { DxlApiClient } from '@/lib/dxl-api-client';

const client = new DxlApiClient({
  baseUrl: '/api/dxl/v3'
});

// Check email
const emailCheck = await client.checkEmailAvailability('user@example.com');
console.log(emailCheck.data.available);

// Check username
const usernameCheck = await client.checkUsernameAvailability('johndoe');
console.log(usernameCheck.data.available);

// Register
const register = await client.register({
  email: 'user@example.com',
  password: 'SecurePass123!',
  firstname: 'John',
  lastname: 'Doe',
  username: 'johndoe'
});

// Verify email
const verify = await client.verifyEmail('user@example.com', '123456');

// Resend code
const resend = await client.resendVerificationCode('user@example.com');
```

---

## React Component Example

```typescript
"use client";

import { useState } from 'react';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const checkEmail = async () => {
    const res = await fetch(`/api/dxl/v3?@=auth.check.email&email=${email}`);
    const data = await res.json();
    setEmailAvailable(data.data?.available ?? null);
  };

  const checkUsername = async () => {
    const res = await fetch(`/api/dxl/v3?@=auth.check.username&username=${username}`);
    const data = await res.json();
    setUsernameAvailable(data.data?.available ?? null);
  };

  const handleRegister = async () => {
    const res = await fetch('/api/dxl/v3?@=auth.register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'password',
        firstname: 'John',
        lastname: 'Doe',
        username
      })
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={checkEmail}
      />
      {emailAvailable !== null && (
        <span>{emailAvailable ? '✓ Available' : '✗ Taken'}</span>
      )}

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onBlur={checkUsername}
      />
      {usernameAvailable !== null && (
        <span>{usernameAvailable ? '✓ Available' : '✗ Taken'}</span>
      )}

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
```

---

## Error Responses

### Email Already Taken
```json
{
  "status": false,
  "message": "Email is already registered",
  "error_details": {
    "code": 422,
    "type": "ValidationError",
    "details": { "field": "email" }
  }
}
```

### Username Already Taken
```json
{
  "status": false,
  "message": "Username is already taken",
  "error_details": {
    "code": 422,
    "type": "ValidationError",
    "details": { "field": "username" }
  }
}
```

### Invalid Username Format
```json
{
  "status": false,
  "message": "Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens",
  "error_details": {
    "code": 422,
    "type": "ValidationError",
    "details": { "field": "username" }
  }
}
```

### Invalid Verification Code
```json
{
  "status": false,
  "message": "Invalid or expired verification code",
  "error_details": {
    "code": 422,
    "type": "ValidationError",
    "details": { "field": "code" }
  }
}
```

---

## Database Schema

### user table (Better Auth)
- `id` - User ID
- `email` - Email address (unique, lowercase)
- `name` - Full name (firstname + lastname)
- `emailVerified` - Boolean (null/false = not verified)
- `password` - Hashed password
- `role` - User role (default: "user")
- `banned` - Boolean

### user_profiles table (Extended)
- `id` - Profile ID
- `userId` - References user.id (unique)
- `username` - Unique username (optional)
- `firstname` - First name
- `lastname` - Last name
- `bio` - User bio
- `language` - Preferred language (default: "en")
- `platform` - Platform type (web/mobile/desktop)
- `socials` - JSON (instagram, twitter, tiktok links)
- `preferences` - JSON (user settings)
- `metadata` - JSON (additional data)

### verification table (Better Auth)
- `id` - Verification ID
- `identifier` - Email address
- `value` - 6-digit PIN code
- `expiresAt` - Expiration timestamp (10 minutes)
- `type` - "verification" or "reset"

---

## Testing

Visit the demo page: **http://localhost:3000/auth-demo**

The demo page allows you to:
1. Check email availability in real-time
2. Check username availability with format validation
3. Register with firstname, lastname, and optional username
4. Verify email with 6-digit code
5. Resend verification codes

---

## Security Notes

- **Email**: Stored lowercase, unique constraint
- **Username**: Case-insensitive check, stored as provided
- **Password**: Hashed by Better Auth (bcrypt)
- **PIN Code**: 6 digits, 10-minute expiry, one-time use
- **Rate Limiting**: Consider implementing on production
- **HTTPS**: Always use HTTPS in production

---

## Next Steps

1. Apply database migration: `pnpm db:push`
2. Test endpoints on `/auth-demo` page
3. Update registration form to use new endpoints
4. Implement real-time availability checks
5. Add verification flow to your UI

---

## Support

For questions or issues:
- Check the demo page: `/auth-demo`
- Review the DXL API v3 README
- Test endpoints with Postman/Thunder Client

---

**DXL Music HUB Auth API v1.0.0**  
*Powered by iMediaPORT Limited*
