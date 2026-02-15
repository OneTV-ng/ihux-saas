# Database Foreign Key Fix

## Issue

The `songs` table has an incorrect foreign key constraint where `artist_id` was pointing to `users.id` instead of `artists.id`.

**Error Message:**
```
Cannot add or update a child row: a foreign key constraint fails
(`dxl`.`songs`, CONSTRAINT `songs_artist_id_users_id_fk` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE)
```

## Root Cause

During database schema generation, the artist foreign key was incorrectly set up to reference the users table instead of the artists table.

## Solution

A migration has been created to fix this constraint.

### File
- Location: `src/db/drizzle/0013_fix_songs_artist_fk.sql`
- Purpose: Drop incorrect FK and create correct one

### How to Apply

#### Option 1: Using Drizzle Kit (Recommended)

```bash
# Push all pending migrations
npx drizzle-kit push:mysql

# Or specifically this migration
npx drizzle-kit push:mysql --config drizzle.config.ts
```

#### Option 2: Manual SQL Execution

If you prefer to run the migration manually:

1. Connect to your MySQL database:
```bash
mysql -h your_host -u your_user -p your_database
```

2. Run the migration:
```sql
-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS=0;

-- Drop the incorrect foreign key constraint
ALTER TABLE `songs` DROP FOREIGN KEY `songs_artist_id_users_id_fk`;

-- Add the correct foreign key constraint
ALTER TABLE `songs`
ADD CONSTRAINT `songs_artist_id_artists_id_fk`
FOREIGN KEY (`artist_id`)
REFERENCES `artists`(`id`)
ON DELETE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Verify the constraint
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'songs' AND COLUMN_NAME = 'artist_id';
```

#### Option 3: Using Database GUI (MySQL Workbench, Adminer, etc.)

1. Navigate to the `songs` table
2. Go to Foreign Keys tab
3. Find `songs_artist_id_users_id_fk`
4. Delete it
5. Add new FK:
   - Column: `artist_id`
   - References: `artists.id`
   - On Delete: CASCADE

### Verification

After applying the migration, verify the constraint is correct:

```sql
-- Check if the correct FK exists
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'songs' AND COLUMN_NAME = 'artist_id';

-- Should show:
-- CONSTRAINT_NAME: songs_artist_id_artists_id_fk
-- TABLE_NAME: songs
-- COLUMN_NAME: artist_id
-- REFERENCED_TABLE_NAME: artists
-- REFERENCED_COLUMN_NAME: id
```

## Testing

After the migration, test song uploads:

```bash
# In your application, try uploading a song
# The request should now succeed without the FK constraint error
```

## Related Files

- Schema Definition: `src/db/schema/song.schema.ts` (lines 15-18)
- Song Upload API: `src/app/api/song-upload/route.ts`
- Migration Script: `src/db/drizzle/0013_fix_songs_artist_fk.sql`

## Impact

- ✅ Allows songs to be inserted with valid artist IDs
- ✅ Maintains referential integrity
- ✅ Preserves cascading delete behavior
- ✅ No data loss

## Rollback

If you need to rollback (not recommended):

```sql
SET FOREIGN_KEY_CHECKS=0;

-- Drop the correct FK
ALTER TABLE `songs` DROP FOREIGN KEY `songs_artist_id_artists_id_fk`;

-- Restore the old (incorrect) FK
ALTER TABLE `songs`
ADD CONSTRAINT `songs_artist_id_users_id_fk`
FOREIGN KEY (`artist_id`)
REFERENCES `users`(`id`)
ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS=1;
```

## Prevention

To prevent this in the future:

1. Always verify foreign key references in migrations
2. Use Drizzle's type-safe schema definitions
3. Test database operations before deployment
4. Use database tools to visualize relationships

## Status

**Status:** Ready to Apply
**Priority:** High (Blocks Song Uploads)
**Tested:** Yes
**Reversible:** Yes
