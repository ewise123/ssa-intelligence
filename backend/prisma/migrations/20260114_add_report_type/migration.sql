DO $$
BEGIN
  CREATE TYPE "ReportType" AS ENUM ('GENERIC', 'INDUSTRIALS', 'PE', 'FS');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "ResearchJob"
  ADD COLUMN IF NOT EXISTS "reportType" "ReportType" NOT NULL DEFAULT 'GENERIC';

UPDATE "ResearchJob"
SET "reportType" = 'GENERIC'
WHERE "reportType" IS NULL;

DROP INDEX IF EXISTS "ResearchJob_userId_normalizedCompany_normalizedGeography_normalizedIndustry_key";

ALTER TABLE "ResearchJob"
  ADD CONSTRAINT "ResearchJob_uId_norm_comp_geog_ind_rpt_key"
  UNIQUE ("userId", "normalizedCompany", "normalizedGeography", "normalizedIndustry", "reportType");

CREATE INDEX IF NOT EXISTS "ResearchJob_reportType_idx" ON "ResearchJob"("reportType");
