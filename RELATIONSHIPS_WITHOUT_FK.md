# Relationships Without Foreign Key Constraints

Complete guide for building and querying relationships in Drizzle ORM without database-level foreign key constraints.

---

## ✅ Why No FK Constraints?

### **Benefits**
- ✅ **Flexibility** - Insert data in any order
- ✅ **Performance** - No DB constraint checks on every insert
- ✅ **Scalability** - Easier to shard or denormalize
- ✅ **Application Control** - Manage integrity at code level
- ✅ **Testing** - Easier to create test data

### **Tradeoffs**
- ⚠️ No automatic cascading deletes
- ⚠️ Must manage referential integrity in code
- ⚠️ Orphaned records possible if not careful

---

## 📐 Schema Definition

### **Without FK Constraints**
```typescript
export const songs = table("songs", {
  id: varchar("id", { length: 100 }).primaryKey(),
  userId: varchar("user_id", { length: 100 }).notNull(),      // Just store ID
  artistId: varchar("artist_id", { length: 100 }).notNull(),  // Just store ID
  // ... other fields
});

export const tracks = table("tracks", {
  id: varchar("id", { length: 100 }).primaryKey(),
  songId: varchar("song_id", { length: 100 }).notNull(),      // Just store ID
  // ... other fields
});
```

### **Define Relations for Queries**
```typescript
import { relations } from 'drizzle-orm';

// Songs can have many tracks
export const songsRelations = relations(songs, ({ many }) => ({
  tracks: many(tracks),
}));

// Each track belongs to one song
export const tracksRelations = relations(tracks, ({ one }) => ({
  song: one(songs, {
    fields: [tracks.songId],
    references: [songs.id],
  }),
}));
```

---

## 🔍 Query Examples

### **Get Song with All Tracks**
```typescript
import { db } from '@/db';
import { songs, tracks } from '@/db/schema';

const songWithTracks = await db.query.songs.findFirst({
  where: eq(songs.id, songId),
  with: {
    tracks: true,  // Joins tracks automatically
  },
});

// Result:
// {
//   id: "song-123",
//   title: "My Song",
//   userId: "user-456",
//   artistId: "artist-789",
//   tracks: [
//     { id: "track-1", songId: "song-123", title: "Version A", mp3: "..." },
//     { id: "track-2", songId: "song-123", title: "Version B", mp3: "..." }
//   ]
// }
```

### **Get Track with Parent Song**
```typescript
const trackWithSong = await db.query.tracks.findFirst({
  where: eq(tracks.id, trackId),
  with: {
    song: true,  // Joins parent song
  },
});

// Result:
// {
//   id: "track-1",
//   songId: "song-123",
//   title: "Track Title",
//   mp3: "...",
//   song: {
//     id: "song-123",
//     title: "My Song",
//     userId: "user-456",
//     artistId: "artist-789",
//     ...
//   }
// }
```

### **Get All Songs for a User**
```typescript
const userSongs = await db.query.songs.findMany({
  where: eq(songs.userId, userId),
  with: {
    tracks: true,  // Include tracks for each song
  },
});
```

---

## ✍️ Insert Examples

### **Insert Song (No FK Check)**
```typescript
// ✅ Works even if user or artist don't exist
await db.insert(songs).values({
  id: randomUUID(),
  title: "My Song",
  userId: "any-user-id",        // No validation
  artistId: "any-artist-id",    // No validation
  artistName: "Artist Name",
  type: "single",
  cover: "http://...",
  // ... other fields
});
```

### **Insert Track (No FK Check)**
```typescript
// ✅ Works even if parent song doesn't exist
await db.insert(tracks).values({
  id: randomUUID(),
  songId: "any-song-id",         // No validation
  title: "Track Title",
  mp3: "http://...",
  explicit: "no",
});
```

---

## 🛡️ Validation at Application Level

Since we don't have DB constraints, validate in code:

### **Validate Before Insert**
```typescript
import { db } from '@/db';
import { songs, users, artists } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function createSongSafely(songData: NewSong) {
  // Validate user exists
  const user = await db.query.users.findFirst({
    where: eq(users.id, songData.userId),
  });
  if (!user) throw new Error('User not found');

  // Validate artist exists
  const artist = await db.query.artists.findFirst({
    where: eq(artists.id, songData.artistId),
  });
  if (!artist) throw new Error('Artist not found');

  // Safe to insert
  return db.insert(songs).values(songData);
}
```

### **Validate Before Delete**
```typescript
async function deleteSongSafely(songId: string) {
  // Delete all tracks first (cascade manually)
  await db.delete(tracks).where(eq(tracks.songId, songId));

  // Then delete song
  return db.delete(songs).where(eq(songs.id, songId));
}
```

---

## 📝 Best Practices

### **1. Always Validate Related Data**
```typescript
// ❌ Bad - assumes artist exists
await db.insert(songs).values({
  artistId: artistId,  // What if artistId is invalid?
});

// ✅ Good - validates first
const artist = await getArtist(artistId);
if (!artist) throw new Error('Artist not found');

await db.insert(songs).values({
  artistId: artistId,  // Now safe
});
```

### **2. Cascade Deletes Manually**
```typescript
// ❌ Bad - orphaned tracks
await db.delete(songs).where(eq(songs.id, songId));

// ✅ Good - clean up related data
await db.delete(tracks).where(eq(tracks.songId, songId));
await db.delete(songs).where(eq(songs.id, songId));
```

### **3. Use Transactions for Consistency**
```typescript
import { db } from '@/db';

// Ensure both succeed or both fail
await db.transaction(async (tx) => {
  await tx.insert(songs).values(songData);
  await tx.insert(tracks).values(trackData);
});
```

### **4. Use Relations in Queries**
```typescript
// ✅ Efficient - single query with join
const result = await db.query.songs.findFirst({
  where: eq(songs.id, songId),
  with: {
    tracks: true,
  },
});

// ❌ Inefficient - multiple queries
const song = await db.query.songs.findFirst({
  where: eq(songs.id, songId),
});
const songTracks = await db.query.tracks.findMany({
  where: eq(tracks.songId, songId),
});
```

---

## 🔄 Common Operations

### **Update Song with Validation**
```typescript
async function updateSong(songId: string, updates: Partial<NewSong>) {
  // If changing userId, validate new user exists
  if (updates.userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, updates.userId),
    });
    if (!user) throw new Error('User not found');
  }

  // If changing artistId, validate new artist exists
  if (updates.artistId) {
    const artist = await db.query.artists.findFirst({
      where: eq(artists.id, updates.artistId),
    });
    if (!artist) throw new Error('Artist not found');
  }

  return db.update(songs)
    .set(updates)
    .where(eq(songs.id, songId));
}
```

### **Copy Song with All Tracks**
```typescript
async function copySong(originalSongId: string, newUserId: string) {
  // Get original song with tracks
  const original = await db.query.songs.findFirst({
    where: eq(songs.id, originalSongId),
    with: {
      tracks: true,
    },
  });

  if (!original) throw new Error('Song not found');

  // Create new song
  const newSongId = randomUUID();
  await db.insert(songs).values({
    ...original,
    id: newSongId,
    userId: newUserId,
    createdAt: new Date(),
  });

  // Copy all tracks
  for (const track of original.tracks) {
    await db.insert(tracks).values({
      ...track,
      id: randomUUID(),
      songId: newSongId,
      createdAt: new Date(),
    });
  }

  return newSongId;
}
```

---

## ✅ Verification Queries

### **Find Orphaned Tracks**
```typescript
// Tracks whose songs don't exist
const orphans = await db.execute(sql`
  SELECT t.* FROM tracks t
  LEFT JOIN songs s ON t.song_id = s.id
  WHERE s.id IS NULL
`);
```

### **Find Incomplete Songs**
```typescript
// Songs with no tracks
const incomplete = await db.execute(sql`
  SELECT s.* FROM songs s
  LEFT JOIN tracks t ON s.id = t.song_id
  WHERE t.id IS NULL
`);
```

### **Count Relationships**
```typescript
// Songs per user
const counts = await db.execute(sql`
  SELECT user_id, COUNT(*) as song_count
  FROM songs
  GROUP BY user_id
`);
```

---

## 🎯 Summary

| Feature | With FK Constraints | Without FK Constraints |
|---------|-------------------|----------------------|
| Insert order | Strict | Flexible ✅ |
| Performance | Slower | Faster ✅ |
| Orphaned records | Prevented | Possible |
| Cascading deletes | Automatic | Manual |
| Validation | DB level | App level ✅ |
| Flexibility | Limited | High ✅ |

**Use relationships without FK constraints when:**
- ✅ You need insert flexibility
- ✅ Performance is critical
- ✅ You want application-level control
- ✅ You're building distributed systems

**Use FK constraints when:**
- ✅ Data integrity is critical
- ✅ Multiple applications access the DB
- ✅ You need automatic cascading
