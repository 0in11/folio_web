-- =============================================================================
-- RLS Verification Script
-- =============================================================================
-- Run this in the Supabase SQL Editor after running rls-setup.sql.
-- It checks two things:
--   1. Which tables have RLS enabled (all should be true)
--   2. What policies exist on each table
-- =============================================================================

-- 1. RLS status for all tables in the public schema
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. All RLS policies on public-schema tables
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Quick summary: tables WITHOUT RLS (should return 0 rows after setup)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;
