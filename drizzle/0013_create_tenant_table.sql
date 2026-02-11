-- Create tenant table for multitenancy
CREATE TABLE IF NOT EXISTS tenant (
  id SERIAL PRIMARY KEY,
  tenant_name VARCHAR(64) NOT NULL UNIQUE,
  api_key VARCHAR(128),
  email VARCHAR(128),
  url VARCHAR(256),
  contact VARCHAR(128),
  name VARCHAR(128),
  short_name VARCHAR(32),
  branding_json JSONB,
  contacts_json JSONB,
  about_us_json JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_name ON tenant(tenant_name);
