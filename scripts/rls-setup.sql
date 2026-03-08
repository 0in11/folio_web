-- =============================================================================
-- Row Level Security (RLS) Setup for Payload CMS Tables
-- =============================================================================
--
-- Run this script in the Supabase SQL Editor.
-- Payload CMS connects via service_role key, which bypasses RLS.
-- These policies are a defense-in-depth layer: if an anon/authenticated client
-- somehow reaches the database directly, RLS controls what it can access.
--
-- Policy strategy:
--   - Public data tables  → SELECT for everyone, full access for service_role
--   - Auth table (users)  → service_role only (no public read)
--   - Payload internals   → service_role only
--
-- This script is idempotent: safe to run multiple times.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Helper: drop a policy if it exists (Postgres has no DROP POLICY IF EXISTS
-- in older versions, but Supabase runs PG 15+ which supports it).
-- ---------------------------------------------------------------------------

-- ===========================
-- 1. PUBLIC DATA COLLECTIONS
-- ===========================
-- These tables hold portfolio content that is publicly readable.

-- ----- projects (main table) -----
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "projects";
CREATE POLICY "Allow public read" ON "projects" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "projects";
CREATE POLICY "Allow service_role write" ON "projects" FOR ALL USING (auth.role() = 'service_role');

-- ----- projects_technologies -----
ALTER TABLE "projects_technologies" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "projects_technologies";
CREATE POLICY "Allow public read" ON "projects_technologies" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "projects_technologies";
CREATE POLICY "Allow service_role write" ON "projects_technologies" FOR ALL USING (auth.role() = 'service_role');

-- ----- projects_detail_demo_images -----
ALTER TABLE "projects_detail_demo_images" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "projects_detail_demo_images";
CREATE POLICY "Allow public read" ON "projects_detail_demo_images" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "projects_detail_demo_images";
CREATE POLICY "Allow service_role write" ON "projects_detail_demo_images" FOR ALL USING (auth.role() = 'service_role');

-- ----- projects_detail_sections -----
ALTER TABLE "projects_detail_sections" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "projects_detail_sections";
CREATE POLICY "Allow public read" ON "projects_detail_sections" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "projects_detail_sections";
CREATE POLICY "Allow service_role write" ON "projects_detail_sections" FOR ALL USING (auth.role() = 'service_role');

-- ----- projects_detail_sections_subsections -----
ALTER TABLE "projects_detail_sections_subsections" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "projects_detail_sections_subsections";
CREATE POLICY "Allow public read" ON "projects_detail_sections_subsections" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "projects_detail_sections_subsections";
CREATE POLICY "Allow service_role write" ON "projects_detail_sections_subsections" FOR ALL USING (auth.role() = 'service_role');

-- ----- projects_detail_sections_table -----
ALTER TABLE "projects_detail_sections_table" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "projects_detail_sections_table";
CREATE POLICY "Allow public read" ON "projects_detail_sections_table" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "projects_detail_sections_table";
CREATE POLICY "Allow service_role write" ON "projects_detail_sections_table" FOR ALL USING (auth.role() = 'service_role');

-- ----- career -----
ALTER TABLE "career" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "career";
CREATE POLICY "Allow public read" ON "career" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "career";
CREATE POLICY "Allow service_role write" ON "career" FOR ALL USING (auth.role() = 'service_role');

-- ----- career_keywords -----
ALTER TABLE "career_keywords" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "career_keywords";
CREATE POLICY "Allow public read" ON "career_keywords" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "career_keywords";
CREATE POLICY "Allow service_role write" ON "career_keywords" FOR ALL USING (auth.role() = 'service_role');

-- ----- skills -----
ALTER TABLE "skills" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "skills";
CREATE POLICY "Allow public read" ON "skills" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "skills";
CREATE POLICY "Allow service_role write" ON "skills" FOR ALL USING (auth.role() = 'service_role');

-- ----- skills_items -----
ALTER TABLE "skills_items" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "skills_items";
CREATE POLICY "Allow public read" ON "skills_items" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "skills_items";
CREATE POLICY "Allow service_role write" ON "skills_items" FOR ALL USING (auth.role() = 'service_role');

-- ----- education -----
ALTER TABLE "education" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "education";
CREATE POLICY "Allow public read" ON "education" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "education";
CREATE POLICY "Allow service_role write" ON "education" FOR ALL USING (auth.role() = 'service_role');

-- ----- awards -----
ALTER TABLE "awards" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "awards";
CREATE POLICY "Allow public read" ON "awards" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "awards";
CREATE POLICY "Allow service_role write" ON "awards" FOR ALL USING (auth.role() = 'service_role');

-- ----- publications -----
ALTER TABLE "publications" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "publications";
CREATE POLICY "Allow public read" ON "publications" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "publications";
CREATE POLICY "Allow service_role write" ON "publications" FOR ALL USING (auth.role() = 'service_role');

-- ----- certifications -----
ALTER TABLE "certifications" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON "certifications";
CREATE POLICY "Allow public read" ON "certifications" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role write" ON "certifications";
CREATE POLICY "Allow service_role write" ON "certifications" FOR ALL USING (auth.role() = 'service_role');


-- ===========================
-- 2. AUTH TABLE (users)
-- ===========================
-- No public read access. Only service_role (Payload CMS) can operate.

-- ----- users -----
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service_role only" ON "users";
CREATE POLICY "Allow service_role only" ON "users" FOR ALL USING (auth.role() = 'service_role');

-- ----- users_sessions (Payload auth sessions) -----
ALTER TABLE "users_sessions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service_role only" ON "users_sessions";
CREATE POLICY "Allow service_role only" ON "users_sessions" FOR ALL USING (auth.role() = 'service_role');


-- ===========================
-- 3. PAYLOAD INTERNAL TABLES
-- ===========================
-- Migration tracking, admin preferences, document locking — service_role only.

-- ----- payload_migrations -----
ALTER TABLE "payload_migrations" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service_role only" ON "payload_migrations";
CREATE POLICY "Allow service_role only" ON "payload_migrations" FOR ALL USING (auth.role() = 'service_role');

-- ----- payload_preferences -----
ALTER TABLE "payload_preferences" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service_role only" ON "payload_preferences";
CREATE POLICY "Allow service_role only" ON "payload_preferences" FOR ALL USING (auth.role() = 'service_role');

-- ----- payload_preferences_rels -----
ALTER TABLE "payload_preferences_rels" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service_role only" ON "payload_preferences_rels";
CREATE POLICY "Allow service_role only" ON "payload_preferences_rels" FOR ALL USING (auth.role() = 'service_role');

-- ----- payload_locked_documents -----
ALTER TABLE "payload_locked_documents" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service_role only" ON "payload_locked_documents";
CREATE POLICY "Allow service_role only" ON "payload_locked_documents" FOR ALL USING (auth.role() = 'service_role');

-- ----- payload_locked_documents_rels -----
ALTER TABLE "payload_locked_documents_rels" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service_role only" ON "payload_locked_documents_rels";
CREATE POLICY "Allow service_role only" ON "payload_locked_documents_rels" FOR ALL USING (auth.role() = 'service_role');

-- ----- payload_kv -----
ALTER TABLE "payload_kv" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service_role only" ON "payload_kv";
CREATE POLICY "Allow service_role only" ON "payload_kv" FOR ALL USING (auth.role() = 'service_role');


COMMIT;

-- =============================================================================
-- Done. Run scripts/rls-verify.sql to confirm all policies are in place.
-- =============================================================================
