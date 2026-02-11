-- Add record_label field to artists table
ALTER TABLE "artists" ADD COLUMN "record_label" text;

-- Note: contact field structure is updated in schema to use mobile, whatsapp, address
-- Existing JSON data will be compatible
