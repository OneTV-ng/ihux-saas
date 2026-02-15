# SingFT Database Relationships - Complete Reference

## Overview

This document shows the complete relationship structure for songs, users, and artists in the SingFT platform.

---

## Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USERS TABLE                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ id (PK)         │ UUID-36                            │   │
│  │ email           │ Unique email address               │   │
│  │ name            │ User full name                     │   │
│  │ role            │ admin, artist, user                │   │
│  │ phone, address  │ Profile info                       │   │
│  │ ...             │ Other user fields                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ▲                                   │
│          ┌────────────────┼────────────────┐                 │
│          │                │                │                 │
│         (1)              (1)              (1)                │
│          │                │                │                 │
│          │                │                │                 │
│         (M)              (M)              (M)                │
│          │                │                │                 │
│    ┌─────▼──────────┐ ┌──▼────────────┐ ┌─▼──────────────┐  │
│    │                │ │               │ │                │  │
└────┤   ARTISTS      │ │    SONGS      │ │    TRACKS      │──┘
     │                │ │               │ │                │
     │ ┌────────────┐ │ │ ┌───────────┐ │ │ ┌────────────┐ │
     │ │ id (PK)    │ │ │ │ id (PK)   │ │ │ │ id (PK)    │ │
     │ │ user_id FK ├─┼─┤ │ user_id FK├─┼─┤ │ song_id FK │ │
     │ │ name       │ │ │ │ artist_id ├─┘ │ │ title      │ │
     │ │ slug       │ │ │ │ FK ──────┤ │ │ │ mp3_url    │ │
     │ │ bio        │ │ │ │ title     │ │ │ │ lyrics     │ │
     │ │ genre      │ │ │ │ type      │ │ │ │ duration   │ │
     │ │ is_active  │ │ │ │ genre     │ │ │ │ ...        │ │
     │ │            │ │ │ │ status    │ │ │ │            │ │
     │ │ created_at │ │ │ │ cover_url │ │ │ │ created_at │ │
     │ │ updated_at │ │ │ │ plays     │ │ │ │ updated_at │ │
     │ │            │ │ │ │ created_at│ │ │ │            │ │
     │ └────────────┘ │ │ │ updated_at│ │ │ └────────────┘ │
     │                │ │ │           │ │ │                │
     │                │ │ └───────────┘ │ │                │
     │                │ │               │ │                │
     └────────────────┴─┴───────────────┴─┴────────────────┘
```

---

## Detailed Relationships

### 1. USERS → ARTISTS (One-to-Many)
```
One user can have MANY artists

SQL:
  artists.user_id FK → users.id
  ON DELETE CASCADE

Example:
  User "John" has artists:
  - Artist: "Solo John"
  - Artist: "John & Band"
  - Artist: "Remix John"
```

### 2. USERS → SONGS (One-to-Many)
```
One user can have MANY songs (direct ownership)

SQL:
  songs.user_id FK → users.id
  ON DELETE CASCADE

Example:
  User "John" owns all songs published
  across all his artists
```

### 3. ARTISTS → SONGS (One-to-Many)
```
One artist can have MANY songs

SQL:
  songs.artist_id FK → artists.id
  ON DELETE CASCADE

Example:
  Artist "Solo John" publishes:
  - Song: "Midnight Dreams"
  - Song: "Summer Vibes"
  - Song: "Electric Heart"
```

### 4. SONGS → TRACKS (One-to-Many)
```
One song can have MANY tracks

SQL:
  tracks.song_id FK → songs.id
  ON DELETE CASCADE

Example:
  Song "Album Name" has tracks:
  - Track 1: "Intro"
  - Track 2: "Main Song"
  - Track 3: "Bridge"
  - Track 4: "Outro"
```

---

## Key Constraints

### Foreign Key Constraints
```sql
-- User → Artist relationship
CONSTRAINT artists_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE

-- User → Song relationship
CONSTRAINT songs_user_id_users_id_fk
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE

-- Artist → Song relationship
CONSTRAINT songs_artist_id_artists_id_fk
  FOREIGN KEY (artist_id) REFERENCES artists(id)
  ON DELETE CASCADE

-- Song → Track relationship
CONSTRAINT tracks_song_id_songs_id_fk
  FOREIGN KEY (song_id) REFERENCES songs(id)
  ON DELETE CASCADE
```

### Unique Constraints
```sql
-- Email must be unique per user
UNIQUE KEY users_email_idx (email)

-- Artist slug must be unique per user
UNIQUE KEY artists_slug_idx (slug)

-- User can select one default artist
-- (implicitly unique through applications logic)
```

### Indexes
```sql
-- Performance indexes
INDEX songs_user_idx ON songs(user_id)
INDEX songs_artist_idx ON songs(artist_id)
INDEX songs_status_idx ON songs(status)
INDEX tracks_song_idx ON tracks(song_id)
INDEX artists_user_idx ON artists(user_id)
```

---

## Cascade Delete Behavior

### When a User is Deleted
```
users.id = 'user123' → DELETE

Automatically deletes:
  ├── All artists owned by user
  │   └── Which deletes all songs by those artists
  │       └── Which deletes all tracks in those songs
  └── All songs directly owned by user
      └── Which deletes all tracks in those songs
```

### When an Artist is Deleted
```
artists.id = 'artist456' → DELETE

Automatically deletes:
  └── All songs published by that artist
      └── Which deletes all tracks in those songs
```

### When a Song is Deleted
```
songs.id = 'song789' → DELETE

Automatically deletes:
  └── All tracks in that song
```

---

## Query Examples

### Get All Songs by a User
```sql
SELECT
  s.id, s.title, s.artist_id,
  a.artist_name,
  COUNT(t.id) as track_count,
  s.status, s.created_at
FROM songs s
JOIN artists a ON s.artist_id = a.id
LEFT JOIN tracks t ON s.id = t.song_id
WHERE s.user_id = 'user123'
  AND s.deleted_at IS NULL
GROUP BY s.id
ORDER BY s.created_at DESC;
```

### Get All Artists and Their Songs for a User
```sql
SELECT
  a.id, a.artist_name, a.slug,
  COUNT(DISTINCT s.id) as song_count,
  SUM(s.plays) as total_plays
FROM artists a
LEFT JOIN songs s ON a.id = s.artist_id
WHERE a.user_id = 'user123'
  AND a.is_active = TRUE
GROUP BY a.id
ORDER BY a.artist_name;
```

### Get Complete Song with Tracks
```sql
SELECT
  s.id, s.title, s.type, s.genre,
  s.user_id, s.artist_id,
  a.artist_name,
  GROUP_CONCAT(
    JSON_OBJECT(
      'track_number', t.track_number,
      'title', t.title,
      'duration', t.duration
    )
  ) as tracks
FROM songs s
LEFT JOIN artists a ON s.artist_id = a.id
LEFT JOIN tracks t ON s.id = t.song_id
WHERE s.id = 'song123'
GROUP BY s.id;
```

### Get User's Published Songs
```sql
SELECT
  s.id, s.title, s.artist_id,
  a.artist_name, a.slug,
  s.status, s.plays, s.created_at
FROM songs s
JOIN artists a ON s.artist_id = a.id
WHERE s.user_id = 'user123'
  AND s.status = 'published'
  AND s.deleted_at IS NULL
ORDER BY s.created_at DESC
LIMIT 50;
```

---

## Data Integrity Rules

### Rules Enforced by Database

| Rule | Enforcement | Consequence |
|------|-------------|-------------|
| Song must have user_id | NOT NULL | Insert fails if not provided |
| Song must have artist_id | NOT NULL | Insert fails if not provided |
| user_id must exist in users | FK Constraint | Insert fails if user doesn't exist |
| artist_id must exist in artists | FK Constraint | Insert fails if artist doesn't exist |
| Artist's user_id must exist | FK Constraint | Artist creation fails if user invalid |
| Delete user → cascade deletes songs | ON DELETE CASCADE | User deletion removes all data |
| Delete artist → cascade deletes songs | ON DELETE CASCADE | Artist deletion removes songs |
| Delete song → cascade deletes tracks | ON DELETE CASCADE | Song deletion removes tracks |

### Rules Enforced by Application

| Rule | Validation | Location |
|------|-----------|----------|
| User can only access own songs | Session check | API middleware |
| User can only publish through owned artist | User/Artist ownership | /api/upload/publish |
| Artist slug must be unique per user | Database + app | /api/artist/create |
| Song title must not be empty | Length check | Song creation API |
| Artist must be active to publish | is_active check | /api/upload/publish |

---

## API Endpoints Using These Relationships

### User Songs
```
GET /api/songs
  Returns: All songs for authenticated user
  Query: SELECT * FROM songs WHERE user_id = ?

GET /api/user-songs
  Returns: User's songs across all artists
  Query: SELECT * FROM songs WHERE user_id = ? AND status = 'approved'
```

### Artist Operations
```
GET /api/artist/default
  Returns: User's default selected artist
  Query: SELECT * FROM artists WHERE user_id = ? LIMIT 1

GET /api/artist-songs?artistId=X
  Returns: All songs for specific artist
  Query: SELECT * FROM songs WHERE artist_id = ? AND status = 'approved'
```

### Song Publishing
```
POST /api/songs/create
  Requires: user_id, artist_id
  Sets: songs.user_id = authenticated_user, songs.artist_id = provided_artist

POST /api/upload/publish
  Validates: user owns the artist
  Sets: both user_id and artist_id on creation
```

### Admin Operations
```
GET /api/admin/users
  Returns: All users and their metadata

GET /api/admin/users/[id]
  Returns: User details, including:
    - Associated artists
    - Published songs
    - Verification status
```

---

## Performance Considerations

### Indexed Fields (Fast Lookups)
- `users.id` (Primary key)
- `artists.id` (Primary key)
- `artists.user_id` (Foreign key)
- `songs.id` (Primary key)
- `songs.user_id` (Foreign key)
- `songs.artist_id` (Foreign key)
- `songs.status` (Status filter)
- `tracks.song_id` (Foreign key)

### Join Performance
```sql
-- FAST: Uses indexed user_id
SELECT * FROM songs WHERE user_id = 'X'

-- FAST: Uses indexed artist_id
SELECT * FROM songs WHERE artist_id = 'Y'

-- MEDIUM: Requires join but both sides indexed
SELECT * FROM songs s
JOIN artists a ON s.artist_id = a.id
WHERE a.user_id = 'Z'

-- SLOWER: Full table scan if not filtered
SELECT * FROM songs WHERE title LIKE '%query%'
-- Consider adding FULLTEXT index for search
```

---

## Migration Status

✅ **Schema Definition** - Complete in `src/db/schema/song.schema.ts`
✅ **Foreign Keys** - Defined with proper constraints
✅ **Cascade Deletes** - ON DELETE CASCADE configured
✅ **Indexes** - Performance indexes created
✅ **Migration SQL** - Available in `src/db/drizzle/0009_link_song_relations.sql`
✅ **API Updates** - All endpoints updated to use new schema
✅ **Documentation** - Complete reference and migration guide

### To Apply Migration

```bash
# Option 1: MySQL Client
mysql -u root -p database < src/db/drizzle/0009_link_song_relations.sql

# Option 2: See MIGRATION_GUIDE.md for other options
```

---

## Troubleshooting

### Foreign Key Error on Insert
**Problem:** "Cannot add or modify a child row"

**Solution:** Ensure the referenced record exists:
```sql
-- Check if artist exists
SELECT * FROM artists WHERE id = 'artist_id';

-- Check if user exists
SELECT * FROM users WHERE id = 'user_id';
```

### Orphaned Records
**Problem:** Songs without valid user_id or artist_id

**Detection:**
```sql
-- Find orphaned songs
SELECT COUNT(*) FROM songs
WHERE user_id NOT IN (SELECT id FROM users)
   OR artist_id NOT IN (SELECT id FROM artists);

-- Fix: Either delete or assign valid references
DELETE FROM songs WHERE artist_id NOT IN (SELECT id FROM artists);
```

### Cascade Delete Impact
**Before deleting a user, check:**
```sql
SELECT COUNT(*) as songs_to_delete FROM songs WHERE user_id = 'X';
SELECT COUNT(*) as artists_to_delete FROM artists WHERE user_id = 'X';
SELECT COUNT(*) as tracks_to_delete FROM tracks
WHERE song_id IN (SELECT id FROM songs WHERE user_id = 'X');
```

---

**Last Updated:** February 15, 2024
**Status:** Production Ready ✅
