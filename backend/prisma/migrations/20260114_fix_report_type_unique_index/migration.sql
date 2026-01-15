ALTER TABLE "ResearchJob"
  DROP CONSTRAINT IF EXISTS "ResearchJob_uId_norm_comp_geog_ind_rpt_key";

ALTER TABLE "ResearchJob"
  ADD CONSTRAINT "ResearchJob_uId_norm_comp_geog_ind_rpt_key"
  UNIQUE ("userId", "normalizedCompany", "normalizedGeography", "normalizedIndustry", "reportType");
