-- Migration: Add missing columns to songs table for Phase 2 features
-- This migration adds publishing-related columns that are expected by the Drizzle ORM schema

SET FOREIGN_KEY_CHECKS=0;

-- Add missing columns to songs table
ALTER TABLE `songs`
  ADD COLUMN `product_code` varchar(50) UNIQUE AFTER `approved_at`,
  ADD COLUMN `published_by` varchar(100) AFTER `product_code`,
  ADD COLUMN `published_at` timestamp AFTER `published_by`,
  ADD COLUMN `processing_started_at` timestamp AFTER `published_at`,
  ADD INDEX `songs_product_code_idx` (`product_code`),
  ADD INDEX `songs_published_by_idx` (`published_by`);

SET FOREIGN_KEY_CHECKS=1;

-- Verify columns were added
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'songs'
  AND COLUMN_NAME IN ('product_code', 'published_by', 'published_at', 'processing_started_at')
ORDER BY ORDINAL_POSITION;
