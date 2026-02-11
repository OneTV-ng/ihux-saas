-- Migration: Add missing columns to users table
ALTER TABLE users 
  ADD COLUMN provider VARCHAR(255) NULL,
  ADD COLUMN tenant VARCHAR(255) NULL;
