-- Add normalized fields with safe backfill, ensure uniqueness, and create Feedback table

-- Add columns (nullable while we backfill)
ALTER TABLE "ResearchJob" ADD COLUMN IF NOT EXISTS "normalizedCompany" TEXT;
ALTER TABLE "ResearchJob" ADD COLUMN IF NOT EXISTS "normalizedGeography" TEXT;
ALTER TABLE "ResearchJob" ADD COLUMN IF NOT EXISTS "normalizedIndustry" TEXT;

-- Backfill normalized fields from existing data
UPDATE "ResearchJob"
SET "normalizedCompany" = lower("companyName")
WHERE "normalizedCompany" IS NULL;

UPDATE "ResearchJob"
SET "normalizedGeography" = lower("geography")
WHERE "normalizedGeography" IS NULL;

UPDATE "ResearchJob"
SET "normalizedIndustry" = CASE
  WHEN "industry" IS NULL THEN NULL
  ELSE lower("industry")
END
WHERE "normalizedIndustry" IS NULL;

-- Ensure no duplicate normalized combos exist before adding unique index
DO $$
DECLARE
  conflict_count integer;
BEGIN
  SELECT COUNT(*) INTO conflict_count FROM (
    SELECT "userId",
           lower("companyName") AS company_norm,
           lower("geography") AS geography_norm,
           lower(COALESCE("industry", '')) AS industry_norm,
           COUNT(*) AS cnt
    FROM "ResearchJob"
    GROUP BY 1,2,3,4
    HAVING COUNT(*) > 1
  ) AS duplicates;

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'Cannot add unique constraint on ResearchJob normalized fields: % duplicate rows exist. Please resolve duplicates before applying this migration.', conflict_count;
  END IF;
END $$;

-- Enforce NOT NULL on normalized company/geography
ALTER TABLE "ResearchJob" ALTER COLUMN "normalizedCompany" SET NOT NULL;
ALTER TABLE "ResearchJob" ALTER COLUMN "normalizedGeography" SET NOT NULL;

-- Add unique index on normalized fields per user
CREATE UNIQUE INDEX IF NOT EXISTS "ResearchJob_userId_normalizedCompany_normalizedGeography_normalizedIndustry_key"
ON "ResearchJob" ("userId", "normalizedCompany", "normalizedGeography", "normalizedIndustry");

-- Create Feedback table if it does not exist
CREATE TABLE IF NOT EXISTS "Feedback" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "message" TEXT NOT NULL,
  "pagePath" TEXT,
  "reportId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Feedback_createdAt_idx" ON "Feedback"("createdAt");
