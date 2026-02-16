# Database Constraint Fixes

## Issues Fixed

### 1. **Non-existent Columns in Drizzle Schema**
**File**: `src/db/schema/song.schema.ts`

**Problem**: The schema defined `createdBy` and `managedBy` columns that don't exist in the actual database table. This caused "Unknown column" errors when the API tried to insert songs.

**Error**:
```
Unknown column 'created_by' in 'field list'
Unknown column 'managed_by' in 'field list'
```

**Fix**: Removed these two fields from the Drizzle schema (lines 44-45) since:
- They don't exist in the actual database
- They weren't being used by the API
- The schema now matches the actual table structure

### 2. **Incorrect Foreign Key Constraints**
**Files**:
- `src/db/drizzle/0012_cleanup_deprecated_columns_add_fk_constraints.sql`
- `src/db/drizzle/0013_fix_songs_artist_fk.sql`

**Problem**: The migrations were trying to add FK constraints on `songs.artist_id` and `songs.user_id`, which conflicts with the requirement to have NO FK constraints (relationships managed at application level).

**Error**:
```
Cannot add or update a child row: a foreign key constraint fails
(`dxl`.`songs`, CONSTRAINT `songs_artist_id_users_id_fk` FOREIGN KEY (`artist_id`) REFERENCES `users` (`id`) ON DELETE CASCADE)
```

**Fixes**:

#### Migration 0012:
- **Before**: Steps 4-5 added FK constraints for `user_id` and `artist_id`
- **After**: Now drops any incorrect FK constraints instead of adding them
- Keep Steps 1-3 (FK constraints for flagged_by and approved_by, artists.user_id, and artist_profiles.user_id)

#### Migration 0013:
- **Before**: Tried to add `songs_artist_id_artists_id_fk` constraint
- **After**: Drops any existing FK constraints on `artist_id` and `user_id`
- Aligns with application-level relationship management

### 3. **Drizzle Migration Conflict**
**File**: `src/db/drizzle/0011_update_all_ids_to_100.sql`

**Issue**: Migration trying to modify columns used in FK constraints before the constraints were updated properly.

**Resolution**: The corrected migrations (0012, 0013) now handle all constraint cleanup safely.

## Why These Fixes Matter

1. **Schema-Database Alignment**: The Drizzle schema now matches the actual database structure
2. **No Runtime Errors**: API won't try to insert non-existent columns
3. **Correct FK Policy**: FK constraints are removed as per requirements - relationships managed at application level only
4. **Clean Migrations**: Migrations are idempotent and safe to run

## How to Apply

### Option 1: Restart Dev Server (Automatic)
```bash
npm run dev
```
The dev server will attempt to apply pending migrations automatically.

### Option 2: Manual Migration
```bash
npm run drizzle:migrate
```

### Option 3: Direct Database Fix
If migrations have been partially applied:

```sql
SET FOREIGN_KEY_CHECKS=0;

-- Drop problematic columns from schema if they exist
ALTER TABLE songs DROP COLUMN IF EXISTS created_by;
ALTER TABLE songs DROP COLUMN IF EXISTS managed_by;

-- Drop incorrect FK constraints if they exist
ALTER TABLE songs DROP FOREIGN KEY IF EXISTS songs_artist_id_users_id_fk;
ALTER TABLE songs DROP FOREIGN KEY IF EXISTS songs_artist_id_artists_id_fk;
ALTER TABLE songs DROP FOREIGN KEY IF EXISTS songs_user_id_users_id_fk;

SET FOREIGN_KEY_CHECKS=1;
```

## Verification

After applying fixes, verify:

```sql
-- Check songs table structure
SHOW CREATE TABLE songs\G

-- Verify no FK constraints on artist_id or user_id
SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'songs'
  AND (COLUMN_NAME = 'artist_id' OR COLUMN_NAME = 'user_id')
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Should return: (empty result set)

-- Verify Drizzle schema matches
-- Should NOT have created_by or managed_by columns
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'songs' AND COLUMN_NAME IN ('created_by', 'managed_by');

-- Should return: (empty result set)
```

## Summary

| Issue | Status | Fix |
|-------|--------|-----|
| Non-existent columns in schema | ✅ Fixed | Removed `createdBy`, `managedBy` from schema |
| FK constraints on artist_id | ✅ Fixed | Migration 0013 drops incorrect constraints |
| FK constraints on user_id | ✅ Fixed | Migration 0012 drops incorrect constraints |
| Schema-DB mismatch | ✅ Fixed | Schema now reflects actual table structure |

## Testing

After applying these fixes, the song upload should work without errors:

1. Navigate to `/desk/artist/upload/single`
2. Upload cover and audio files
3. Submit the form
4. Should succeed without "Unknown column" or FK constraint errors

## Files Changed

- `src/db/schema/song.schema.ts` - Removed non-existent columns
- `src/db/drizzle/0012_cleanup_deprecated_columns_add_fk_constraints.sql` - Drops FK constraints instead of adding
- `src/db/drizzle/0013_fix_songs_artist_fk.sql` - Removes all artist_id and user_id FK constraints

## Notes

- These changes align with the architectural decision to manage relationships at the application level without database-level FK constraints
- This provides flexibility for scalability, testing, and distributed systems
- The API layer is responsible for validating referential integrity

---

**Status**: Ready to apply - all changes made, migrations updated, schema corrected.
