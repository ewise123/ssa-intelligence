-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('universal', 'pe', 'industrials');

-- CreateEnum
CREATE TYPE "ArticlePriority" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('new', 'update');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('exact', 'contextual');

-- CreateEnum
CREATE TYPE "FetchLayer" AS ENUM ('layer1_rss', 'layer1_api', 'layer2_llm');

-- CreateTable
CREATE TABLE "revenue_owners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracked_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ticker" TEXT,
    "cik" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracked_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracked_people" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "company_affiliation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracked_people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TagCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_diet_companies" (
    "revenueOwnerId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "call_diet_companies_pkey" PRIMARY KEY ("revenueOwnerId","companyId")
);

-- CreateTable
CREATE TABLE "call_diet_people" (
    "revenueOwnerId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "call_diet_people_pkey" PRIMARY KEY ("revenueOwnerId","personId")
);

-- CreateTable
CREATE TABLE "call_diet_tags" (
    "revenueOwnerId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "call_diet_tags_pkey" PRIMARY KEY ("revenueOwnerId","tagId")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "short_summary" TEXT,
    "long_summary" TEXT,
    "summary" TEXT,
    "why_it_matters" TEXT,
    "published_at" TIMESTAMP(3),
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" "ArticlePriority",
    "priority_score" INTEGER,
    "status" "ArticleStatus",
    "match_type" "MatchType",
    "fetch_layer" "FetchLayer",
    "raw_content" TEXT,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "source_url" TEXT NOT NULL,
    "source_name" TEXT,
    "full_content" TEXT,
    "content_scraped" BOOLEAN NOT NULL DEFAULT false,
    "scraped_at" TIMESTAMP(3),
    "company_id" TEXT,
    "person_id" TEXT,
    "tag_id" TEXT,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_sources" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    "fetch_layer" "FetchLayer",
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_revenue_owners" (
    "article_id" TEXT NOT NULL,
    "revenue_owner_id" TEXT NOT NULL,

    CONSTRAINT "article_revenue_owners_pkey" PRIMARY KEY ("article_id","revenue_owner_id")
);

-- CreateTable
CREATE TABLE "seen_urls" (
    "url_hash" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "first_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seen_urls_pkey" PRIMARY KEY ("url_hash")
);

-- CreateTable
CREATE TABLE "news_config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "news_config_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_tags_name_key" ON "news_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_source_url_key" ON "news_articles"("source_url");

-- CreateIndex
CREATE INDEX "news_articles_published_at_idx" ON "news_articles"("published_at" DESC);

-- CreateIndex
CREATE INDEX "news_articles_priority_idx" ON "news_articles"("priority");

-- CreateIndex
CREATE INDEX "news_articles_priority_score_idx" ON "news_articles"("priority_score" DESC);

-- CreateIndex
CREATE INDEX "news_articles_company_id_idx" ON "news_articles"("company_id");

-- CreateIndex
CREATE INDEX "news_articles_tag_id_idx" ON "news_articles"("tag_id");

-- CreateIndex
CREATE INDEX "news_articles_is_sent_idx" ON "news_articles"("is_sent");

-- CreateIndex
CREATE INDEX "news_articles_is_archived_idx" ON "news_articles"("is_archived");

-- CreateIndex
CREATE INDEX "article_sources_article_id_idx" ON "article_sources"("article_id");

-- CreateIndex
CREATE UNIQUE INDEX "article_sources_article_id_source_url_key" ON "article_sources"("article_id", "source_url");

-- AddForeignKey
ALTER TABLE "call_diet_companies" ADD CONSTRAINT "call_diet_companies_revenueOwnerId_fkey" FOREIGN KEY ("revenueOwnerId") REFERENCES "revenue_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_diet_companies" ADD CONSTRAINT "call_diet_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "tracked_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_diet_people" ADD CONSTRAINT "call_diet_people_revenueOwnerId_fkey" FOREIGN KEY ("revenueOwnerId") REFERENCES "revenue_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_diet_people" ADD CONSTRAINT "call_diet_people_personId_fkey" FOREIGN KEY ("personId") REFERENCES "tracked_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_diet_tags" ADD CONSTRAINT "call_diet_tags_revenueOwnerId_fkey" FOREIGN KEY ("revenueOwnerId") REFERENCES "revenue_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_diet_tags" ADD CONSTRAINT "call_diet_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "news_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "tracked_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "tracked_people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "news_tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_sources" ADD CONSTRAINT "article_sources_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_revenue_owners" ADD CONSTRAINT "article_revenue_owners_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_revenue_owners" ADD CONSTRAINT "article_revenue_owners_revenue_owner_id_fkey" FOREIGN KEY ("revenue_owner_id") REFERENCES "revenue_owners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
