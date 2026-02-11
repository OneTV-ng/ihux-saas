-- Migration: Add missing columns to users table with defaults
ALTER TABLE users 
  ADD COLUMN provider VARCHAR(255) NOT NULL DEFAULT 'credentials',
  ADD COLUMN tenant VARCHAR(255) NOT NULL DEFAULT 'mstudios';
