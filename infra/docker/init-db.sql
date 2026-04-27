-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create the super_admin_role that bypasses RLS
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'super_admin_role') THEN
    CREATE ROLE super_admin_role NOLOGIN;
  END IF;
END
$$;

-- Grant super_admin_role bypass on RLS
ALTER ROLE super_admin_role SET row_security TO off;
