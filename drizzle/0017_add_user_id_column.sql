-- Migration: Add id column to users table if missing
ALTER TABLE users ADD COLUMN id TEXT PRIMARY KEY;
