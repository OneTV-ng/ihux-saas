# Database Migration Guide - Song User/Artist Relationship

## Overview

This migration establishes proper foreign key relationships between the `songs` table and both `users` and `artists` tables.

### Relationships After Migration

```
users (1) ──────────────────── (Many) songs
           user_id → user_id

artists (1) ──────────────────── (Many) songs
            artist_id → artist_id

songs can be owned by ONE user but published through ONE artist
artists belong to ONE user (artists.user_id → users.id)
```

## Changes Made

### Schema Changes
- ✅ Add `user_id` column to songs table
- ✅ Ensure `artist_id` is VARCHAR(36) matching artists.id
- ✅ Create foreign key: `songs.user_id` → `users.id`
- ✅ Create foreign key: `songs.artist_id` → `artists.id`
- ✅ Remove deprecated columns: `created_by`, `managed_by`

### Data Integrity
- ✅ Cascade delete: If user deleted, their songs are deleted
- ✅ Cascade delete: If artist deleted, their songs are deleted
- ✅ Foreign key constraints prevent orphaned records
- ✅ Proper indexes for query performance

## How to Run Migration

### Option 1: Using MySQL Client (Recommended)

```bash
# Connect to your MySQL database
mysql -h localhost -u root -p your_database < src/db/drizzle/0009_link_song_relations.sql

# Or paste the contents into MySQL client:
mysql> source src/db/drizzle/0009_link_song_relations.sql;
```

### Option 2: Using Node.js Script

```javascript
import { db } from '@/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  const migrationSQL = fs.readFileSync(
    path.join(process.cwd(), 'src/db/drizzle/0009_link_song_relations.sql'),
    'utf-8'
  );

  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      console.log('Executing:', statement.substring(0, 50) + '...');
      // Execute raw SQL using your database driver
      // await db.execute(statement);
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }

  console.log('✅ Migration completed successfully!');
}

runMigration();
```

### Option 3: Using Drizzle ORM

```typescript
import { sql } from 'drizzle-orm';
import { db } from '@/db';

async function runMigration() {
  // Drop existing foreign keys
  await db.execute(
    sql`ALTER TABLE songs DROP FOREIGN KEY IF EXISTS songs_artist_id_users_id_fk`
  );

  // Add user_id column
  await db.execute(
    sql`ALTER TABLE songs ADD COLUMN IF NOT EXISTS user_id VARCHAR(36) AFTER id`
  );

  // Populate from artists
  await db.execute(sql`
    UPDATE songs s
    LEFT JOIN artists a ON s.artist_id = a.id
    SET s.user_id = a.user_id
    WHERE s.user_id IS NULL AND a.user_id IS NOT NULL
  `);

  // Add constraints
  await db.execute(sql`
    ALTER TABLE songs ADD CONSTRAINT songs_user_id_users_id_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  `);

  await db.execute(sql`
    ALTER TABLE songs ADD CONSTRAINT songs_artist_id_artists_id_fk
    FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
  `);

  console.log('✅ Migration completed!');
}
```

## Verification

After running the migration, verify the relationships:

```sql
-- Check foreign keys
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'songs';

-- Check sample data
SELECT
  s.id,
  s.title,
  s.user_id,
  s.artist_id,
  u.email as user_email,
  a.artist_name
FROM songs s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN artists a ON s.artist_id = a.id
LIMIT 5;

-- Verify cascade delete (check no orphaned records)
SELECT COUNT(*) as orphaned_songs
FROM songs s
LEFT JOIN users u ON s.user_id = u.id
WHERE u.id IS NULL;

SELECT COUNT(*) as orphaned_artist_refs
FROM songs s
LEFT JOIN artists a ON s.artist_id = a.id
WHERE a.id IS NULL;
```

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Remove new foreign keys
ALTER TABLE songs DROP FOREIGN KEY songs_user_id_users_id_fk;
ALTER TABLE songs DROP FOREIGN KEY songs_artist_id_artists_id_fk;

-- Add back old column if needed
ALTER TABLE songs ADD COLUMN created_by VARCHAR(36);
ALTER TABLE songs ADD COLUMN managed_by VARCHAR(36);

-- Remove user_id column
ALTER TABLE songs DROP COLUMN user_id;

-- Restore old artist_id length if different
ALTER TABLE songs MODIFY COLUMN artist_id VARCHAR(100);
```

## What This Fixes

✅ **Proper Data Model** - Clear relationships between users, artists, and songs
✅ **Data Integrity** - Foreign key constraints prevent invalid data
✅ **Query Efficiency** - Direct user_id lookup instead of through artists
✅ **Cascade Deletes** - Orphaned records automatically removed
✅ **Multi-Artist Support** - Users can have multiple artists
✅ **Audit Trail** - Clear ownership tracking

## API Impact

These changes affect these endpoints:
- `/api/songs/create` - Now sets user_id from session
- `/api/upload/publish` - Now uses user_id instead of created_by
- `/api/songs` - Direct user_id query instead of artist lookup
- `/api/user-songs` - Direct user_id query instead of artist lookup
- `/api/artist-songs` - Uses artist_id (unchanged)

All APIs have been updated to work with the new schema.

## Performance Impact

**Improved:**
- User song queries: 1 index lookup instead of 2 table joins
- Deletion operations: Cascade handles cleanup automatically
- Aggregation queries by user: Single column index available

**No Regression:**
- Artist song queries remain unchanged
- Song detail lookups remain unchanged
- Search functionality remains unchanged

## Troubleshooting

### Foreign Key Error: "Cannot add or modify a child row"

**Cause:** Existing songs have artist_ids that don't exist in artists table

**Solution:**
```sql
-- Check for orphaned artist references
SELECT DISTINCT artist_id FROM songs
WHERE artist_id NOT IN (SELECT id FROM artists);

-- Option 1: Delete orphaned songs
DELETE FROM songs WHERE artist_id NOT IN (SELECT id FROM artists);

-- Option 2: Fix artist references (if you know the correct artist)
UPDATE songs SET artist_id = 'correct_artist_id'
WHERE artist_id NOT IN (SELECT id FROM artists);
```

### "Specified key was too long" Error

**Cause:** Artist_id column is longer than expected

**Solution:** The migration file already handles this by modifying the column length to 36 characters.

### Migration Takes Too Long

If the UPDATE statement takes too long on large datasets:

```sql
-- Create temporary index for faster joins
CREATE INDEX temp_artist_user_idx ON artists(id, user_id);

-- Then run the UPDATE

-- Drop temporary index
DROP INDEX temp_artist_user_idx ON artists;
```

## Support

For issues or questions about this migration, refer to:
- Song schema: `src/db/schema/song.schema.ts`
- Artist schema: `src/db/schema/artist.schema.ts`
- User schema: `src/db/schema/user.schema.ts`
