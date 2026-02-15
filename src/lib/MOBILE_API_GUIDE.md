# Mobile API Client Guide

Complete guide for using the SingFT Mobile API Client in React, Next.js, and React Native applications.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Basic Usage](#basic-usage)
3. [React Hooks](#react-hooks)
4. [React Native Integration](#react-native-integration)
5. [API Endpoints](#api-endpoints)
6. [Authentication](#authentication)
7. [Error Handling](#error-handling)
8. [Advanced Features](#advanced-features)
9. [Examples](#examples)

## Installation & Setup

### 1. **Import the Client**

```typescript
import { mobileApi, MobileApiClient } from '@/lib/mobile-api-client';
import { initializeApiClient, loadSession } from '@/lib/api-client-utils';
```

### 2. **Initialize in Your App**

#### Next.js (pages/\_app.tsx or app/layout.tsx)

```typescript
'use client';

import { useEffect } from 'react';
import { initializeApiClient } from '@/lib/api-client-utils';

export default function RootLayout({ children }) {
  useEffect(() => {
    initializeApiClient();
  }, []);

  return <>{children}</>;
}
```

#### React App (main.tsx or index.tsx)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeApiClient } from '@/lib/api-client-utils';

initializeApiClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### React Native (App.tsx or index.js)

```typescript
import { initializeApiClient } from '@/lib/api-client-utils';

initializeApiClient('https://api.singft.com'); // Use your actual API URL

export default function App() {
  return {/* Your app code */};
}
```

## Basic Usage

### Using the Singleton Instance

```typescript
import { mobileApi } from '@/lib/mobile-api-client';

// Get user profile
const response = await mobileApi.profile.getProfile();
if (response.success) {
  console.log('Profile:', response.data);
} else {
  console.error('Error:', response.error);
}
```

### Creating a Custom Instance

```typescript
import { MobileApiClient } from '@/lib/mobile-api-client';

const api = new MobileApiClient('https://api.example.com');
api.setTimeout(45000); // 45 seconds
api.setRetries(5);

const result = await api.artists.getMyArtists();
```

## React Hooks

### useAuth - Authentication

```typescript
import { useAuth } from '@/hooks/useMobileApi';

export function LoginComponent() {
  const { signIn, signUp, signOut, isAuthenticated, loading } = useAuth();

  // Sign in
  const handleSignIn = async () => {
    try {
      const result = await signIn.execute({
        email: 'user@example.com',
        password: 'password',
      });
      console.log('Signed in:', result);
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  if (loading) return <div>Checking auth...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
    </div>
  );
}
```

### useProfile - User Profile

```typescript
import { useProfile } from '@/hooks/useMobileApi';

export function ProfileComponent() {
  const {
    profile,
    loading,
    error,
    refetch,
    updateProfile,
    submitVerification,
  } = useProfile();

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleUpdate = async () => {
    try {
      const result = await updateProfile.execute({
        name: 'New Name',
        phone: '+1234567890',
      });
      console.log('Updated:', result);
      refetch(); // Refresh profile data
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div>
      <h1>{profile?.name}</h1>
      <p>{profile?.email}</p>
      <button onClick={handleUpdate} disabled={updateProfile.loading}>
        {updateProfile.loading ? 'Updating...' : 'Update Profile'}
      </button>
    </div>
  );
}
```

### useArtists - Artist Management

```typescript
import { useArtists } from '@/hooks/useMobileApi';

export function ArtistsComponent() {
  const {
    artists,
    loading,
    error,
    createArtist,
    updateArtist,
    deleteArtist,
    setSelectedArtist,
  } = useArtists();

  const handleCreateArtist = async () => {
    try {
      const result = await createArtist.execute({
        name: 'My Artist',
        bio: 'Artist bio',
        genres: ['Pop', 'Rock'],
      });
      console.log('Artist created:', result);
    } catch (error) {
      console.error('Creation failed:', error);
    }
  };

  if (loading) return <div>Loading artists...</div>;

  return (
    <div>
      <h2>My Artists</h2>
      {artists?.map((artist) => (
        <div key={artist.id}>
          <h3>{artist.name}</h3>
          <button
            onClick={() => setSelectedArtist.execute(artist.id)}
            disabled={setSelectedArtist.loading}
          >
            Select
          </button>
        </div>
      ))}
      <button onClick={handleCreateArtist} disabled={createArtist.loading}>
        Create Artist
      </button>
    </div>
  );
}
```

### useSongs - Song Management

```typescript
import { useSongs } from '@/hooks/useMobileApi';

export function SongsComponent() {
  const {
    songs,
    total,
    loading,
    createSong,
    updateSong,
    deleteSong,
    submitForReview,
  } = useSongs(undefined, 1, 10);

  const handleCreateSong = async () => {
    try {
      const result = await createSong.execute({
        title: 'Song Title',
        artistId: 'artist-id',
        genre: 'Pop',
      });
      console.log('Song created:', result);
    } catch (error) {
      console.error('Creation failed:', error);
    }
  };

  if (loading) return <div>Loading songs...</div>;

  return (
    <div>
      <h2>My Songs ({total})</h2>
      {songs.map((song) => (
        <div key={song.id}>
          <h3>{song.title}</h3>
          <p>Status: {song.status}</p>
          <button
            onClick={() =>
              submitForReview.execute(song.id)
            }
            disabled={submitForReview.loading}
          >
            Submit for Review
          </button>
        </div>
      ))}
    </div>
  );
}
```

### useUpload - File Upload

```typescript
import { useUpload } from '@/hooks/useMobileApi';

export function UploadComponent() {
  const { uploadFile, progress, isUploading } = useUpload();

  const handleFileSelect = async (file: File) => {
    try {
      const result = await uploadFile.execute({
        file,
        fileType: 'audio', // or 'cover', 'document'
      });
      console.log('Upload complete:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
        disabled={isUploading}
      />
      {isUploading && <div>Upload progress: {progress.toFixed(2)}%</div>}
    </div>
  );
}
```

### useAdmin - Admin Operations

```typescript
import { useAdmin } from '@/hooks/useMobileApi';

export function AdminComponent() {
  const { getUsers, updateUser, suspendUser } = useAdmin();

  const handleGetUsers = async () => {
    try {
      const result = await getUsers.execute({ page: 1, pageSize: 20 });
      console.log('Users:', result);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const result = await suspendUser.execute({
        id: userId,
        reason: 'Violation of terms',
      });
      console.log('User suspended:', result);
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  return (
    <div>
      <button onClick={handleGetUsers} disabled={getUsers.loading}>
        Load Users
      </button>
      {getUsers.isExecuting && <div>Loading...</div>}
    </div>
  );
}
```

## React Native Integration

### Setup for React Native

```typescript
// app/api/config.ts or similar
import { initializeApiClient } from '@/lib/api-client-utils';

const API_URL = __DEV__ ? 'http://localhost:3000' : 'https://api.singft.com';

export const api = await initializeApiClient(API_URL);
```

### Using in React Native Component

```typescript
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { mobileApi } from '@/lib/mobile-api-client';

export function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await mobileApi.profile.getProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>{profile?.name}</Text>
      <Text>{profile?.email}</Text>
      <TouchableOpacity onPress={loadProfile}>
        <Text>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### React Native with AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mobileApi } from '@/lib/mobile-api-client';
import { saveSession, loadSession } from '@/lib/api-client-utils';

// In your app initialization
export async function initAuth() {
  // Load existing session
  const token = await loadSession();

  if (!token) {
    // Sign in
    const response = await mobileApi.auth.signIn(
      'user@example.com',
      'password'
    );

    if (response.success) {
      await saveSession(response.data.token, 86400); // 24 hours
    }
  }
}
```

## API Endpoints

### Authentication

```typescript
// Sign in
mobileApi.auth.signIn(email, password)

// Sign up
mobileApi.auth.signUp(email, password, name)

// Sign out
mobileApi.auth.signOut()

// Get session
mobileApi.auth.getSession()

// Forgot password
mobileApi.auth.forgotPassword(email)

// Reset password
mobileApi.auth.resetPassword(pin, password)
```

### Profile

```typescript
// Get profile
mobileApi.profile.getProfile()

// Update profile
mobileApi.profile.updateProfile({ name, email, phone, ... })

// Submit verification
mobileApi.profile.submitVerification({
  governmentIdUrl,
  signatureUrl,
  completionPercentage,
})

// Get verification status
mobileApi.profile.getVerificationStatus()
```

### Artists

```typescript
// Get my artists
mobileApi.artists.getMyArtists()

// Get artist by ID
mobileApi.artists.getArtistById(id)

// Get selected artist
mobileApi.artists.getSelectedArtist()

// Create artist
mobileApi.artists.createArtist({ name, bio, genres, ... })

// Update artist
mobileApi.artists.updateArtist(id, { name, bio, ... })

// Delete artist
mobileApi.artists.deleteArtist(id)

// Set selected artist
mobileApi.artists.setSelectedArtist(id)

// Search artists
mobileApi.artists.searchArtists(query, page)

// Get artist by slug
mobileApi.artists.getArtistBySlug(slug)
```

### Songs

```typescript
// Get user songs
mobileApi.songs.getUserSongs(search, page, pageSize)

// Create song
mobileApi.songs.createSong({ title, artistId, genre, ... })

// Get song by ID
mobileApi.songs.getSongById(id)

// Update song
mobileApi.songs.updateSong(id, { title, genre, ... })

// Delete song
mobileApi.songs.deleteSong(id)

// Submit for review
mobileApi.songs.submitSongForReview(id, data)

// Get song tracks
mobileApi.songs.getSongTracks(id)

// Search songs
mobileApi.songs.searchSongs(query, page)

// Get public songs
mobileApi.songs.getPublicSongs(page, pageSize)

// Get artist songs
mobileApi.songs.getArtistSongs(artistId)
```

### Uploads

```typescript
// Upload file
mobileApi.uploads.uploadFile(file, fileType, onProgress)

// Save upload job
mobileApi.uploads.saveUploadJob(data)

// Publish song
mobileApi.uploads.publishSong(data)

// Extract metadata
mobileApi.uploads.extractMetadata(file, fileType)
```

### Admin

```typescript
// Get users
mobileApi.admin.getUsers(page, pageSize)

// Get user by ID
mobileApi.admin.getUserById(id)

// Update user
mobileApi.admin.updateUser(id, data)

// Bulk update users
mobileApi.admin.bulkUpdateUsers(updates)

// Get user verification
mobileApi.admin.getUserVerification(userId)

// Update user verification
mobileApi.admin.updateUserVerification(userId, data)

// Suspend user
mobileApi.admin.suspendUser(id, reason)

// Unsuspend user
mobileApi.admin.unsuspendUser(id)
```

## Authentication

### Session Management

```typescript
import { saveSession, loadSession, clearSession } from '@/lib/api-client-utils';

// After successful login
await saveSession(token, expiresIn);

// On app start
const token = await loadSession();

// On logout
await clearSession();
```

### Setting Auth Token

```typescript
import { mobileApi } from '@/lib/mobile-api-client';

// After login
mobileApi.setSessionToken(token);

// Check if authenticated
if (mobileApi.isAuthenticated()) {
  // Make authenticated request
}
```

## Error Handling

### Using Error Handler

```typescript
import { handleApiError } from '@/lib/api-client-utils';

try {
  const result = await mobileApi.songs.getUserSongs();
  if (!result.success) {
    const errorMsg = handleApiError(new Error(result.error));
    showErrorToast(errorMsg);
  }
} catch (error) {
  const errorMsg = handleApiError(error);
  console.error(errorMsg);
}
```

### Custom Error Handling

```typescript
const response = await mobileApi.profile.getProfile();

switch (response.status) {
  case 401:
    // Clear session and redirect to login
    clearSession();
    navigateToLogin();
    break;
  case 403:
    // Show permission denied message
    showErrorDialog('You do not have permission');
    break;
  case 500:
    // Show server error message
    showErrorDialog('Server error. Please try again later.');
    break;
}
```

## Advanced Features

### Request Interceptors

```typescript
import { interceptors } from '@/lib/api-client-utils';

// Add auth header to all requests
interceptors.use({
  onRequest: async (config) => {
    const token = await loadSession();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },

  onError: async (error) => {
    if (error.status === 401) {
      // Handle unauthorized
      await clearSession();
    }
    return error;
  },
});
```

### Batch Requests

```typescript
import { batchRequests } from '@/lib/api-client-utils';

const results = await batchRequests(
  [
    () => mobileApi.profile.getProfile(),
    () => mobileApi.artists.getMyArtists(),
    () => mobileApi.songs.getUserSongs(),
  ],
  3 // concurrency
);
```

### Polling

```typescript
import { pollUntil } from '@/lib/api-client-utils';

const result = await pollUntil(
  () => mobileApi.songs.getSongById(songId),
  (song) => song.status === 'published',
  {
    interval: 2000, // 2 seconds
    maxAttempts: 30,
  }
);
```

## Examples

### Complete Login Flow

```typescript
import { useAuth } from '@/hooks/useMobileApi';
import { saveSession } from '@/lib/api-client-utils';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const result = await signIn.execute({ email, password });
      if (result?.token) {
        await saveSession(result.token);
        navigateToHome();
      }
    } catch (error) {
      showErrorDialog('Login failed. Please try again.');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={signIn.loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={signIn.loading}
      />
    </View>
  );
}
```

### Complete Upload Flow

```typescript
export function UploadScreen() {
  const { uploadFile, progress, isUploading } = useUpload();
  const { submitForReview } = useSongs();

  const handleSelectAndUpload = async (file: File) => {
    try {
      // Upload file
      const uploadResult = await uploadFile.execute({
        file,
        fileType: 'audio',
      });

      if (uploadResult) {
        // Create song with uploaded file
        const songResult = await createSong.execute({
          title: 'New Song',
          artistId: selectedArtistId,
          audioUrl: uploadResult.url,
        });

        // Submit for review
        await submitForReview.execute(songResult.id);

        showSuccess('Song uploaded and submitted!');
      }
    } catch (error) {
      showError('Upload failed: ' + error.message);
    }
  };

  return (
    <View>
      <Text>Upload Progress: {progress.toFixed(2)}%</Text>
      <FileUploadInput onSelect={handleSelectAndUpload} />
    </View>
  );
}
```

---

**Last Updated:** February 2024
**Version:** 1.0.0
**Compatibility:** React 16.8+, React Native 0.60+, Next.js 13+
