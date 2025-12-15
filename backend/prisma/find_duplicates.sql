-- Find duplicate research jobs by normalized company/geography/industry per user
WITH dup_groups AS (
  SELECT "userId",
         lower("companyName") AS company_norm,
         lower("geography") AS geo_norm,
         lower(COALESCE("industry", '')) AS industry_norm,
         COUNT(*) AS cnt
  FROM "ResearchJob"
  GROUP BY 1,2,3,4
  HAVING COUNT(*) > 1
)
SELECT r.id,
       r."companyName",
       r.geography,
       r.industry,
       r.status,
       r."createdAt"
FROM "ResearchJob" r
JOIN dup_groups d
  ON r."userId" = d."userId"
 AND lower(r."companyName") = d.company_norm
 AND lower(r."geography") = d.geo_norm
 AND lower(COALESCE(r.industry, '')) = d.industry_norm
ORDER BY r."createdAt";
