-- Fix unique constraints to treat NULL reportType as equal (PostgreSQL 15+)
-- This prevents duplicate base prompts (where reportType IS NULL)

-- Drop existing constraints
ALTER TABLE "prompts"
  DROP CONSTRAINT IF EXISTS "prompts_sectionId_reportType_version_key";

ALTER TABLE "prompt_versions"
  DROP CONSTRAINT IF EXISTS "prompt_versions_sectionId_reportType_version_key";

-- Recreate with NULLS NOT DISTINCT
CREATE UNIQUE INDEX "prompts_sectionId_reportType_version_key"
  ON "prompts" ("sectionId", "reportType", "version")
  NULLS NOT DISTINCT;

CREATE UNIQUE INDEX "prompt_versions_sectionId_reportType_version_key"
  ON "prompt_versions" ("sectionId", "reportType", "version")
  NULLS NOT DISTINCT;
