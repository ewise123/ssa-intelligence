-- Remove priority-related indexes
DROP INDEX IF EXISTS "news_articles_priority_idx";
DROP INDEX IF EXISTS "news_articles_priority_score_idx";

-- Remove priority columns from news_articles table
ALTER TABLE "news_articles" DROP COLUMN IF EXISTS "priority";
ALTER TABLE "news_articles" DROP COLUMN IF EXISTS "priority_score";

-- Drop the ArticlePriority enum
DROP TYPE IF EXISTS "ArticlePriority";
