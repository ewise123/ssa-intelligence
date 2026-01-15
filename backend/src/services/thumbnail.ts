import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';
import { marked } from 'marked';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { formatSectionContent } from './section-formatter.js';

type S3Config = {
  bucket?: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicBaseUrl?: string;
};

const getS3Config = (): S3Config => ({
  bucket: process.env.THUMBNAIL_S3_BUCKET,
  region: process.env.THUMBNAIL_S3_REGION,
  endpoint: process.env.THUMBNAIL_S3_ENDPOINT,
  accessKeyId: process.env.THUMBNAIL_S3_KEY,
  secretAccessKey: process.env.THUMBNAIL_S3_SECRET,
  publicBaseUrl: process.env.THUMBNAIL_S3_PUBLIC_BASE
});

const buildS3Client = (cfg: S3Config) => {
  if (!cfg.bucket || !cfg.accessKeyId || !cfg.secretAccessKey || !cfg.region) return null;
  try {
    return new S3Client({
      region: cfg.region,
      endpoint: cfg.endpoint,
      forcePathStyle: Boolean(cfg.endpoint),
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey
      }
    });
  } catch (err) {
    console.error('Failed to initialize S3 client for thumbnails:', err);
    return null;
  }
};

const toPublicUrl = (cfg: S3Config, key: string) => {
  if (cfg.publicBaseUrl) {
    return `${cfg.publicBaseUrl.replace(/\/$/, '')}/${key}`;
  }
  if (cfg.endpoint) {
    return `${cfg.endpoint.replace(/\/$/, '')}/${cfg.bucket}/${key}`;
  }
  return `https://${cfg.bucket}.s3.${cfg.region}.amazonaws.com/${key}`;
};

const renderExecSummaryHtml = (title: string, geography: string | null, industry: string | null, markdown: string) => {
  const body = marked.parse(markdown || '') as string;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { margin: 0; padding: 0; background: #f3f4f6; font-family: "Inter", "Helvetica Neue", Arial, sans-serif; }
    .page {
      width: 900px;
      min-height: 1200px;
      margin: 0 auto;
      background: white;
      padding: 32px;
      box-sizing: border-box;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
    }
    h1 { margin: 0 0 8px 0; font-size: 28px; color: #0f172a; }
    .meta { color: #475569; font-size: 13px; margin: 0 0 14px 0; }
    h2 { font-size: 18px; margin: 20px 0 10px 0; color: #111827; }
    p, li { font-size: 13px; line-height: 1.5; color: #1f2937; }
    ul { padding-left: 18px; margin: 0; }
    strong { color: #0f172a; }
  </style>
</head>
<body>
  <div class="page">
    <h1>${title}</h1>
    <div class="meta">Geography: ${geography || 'N/A'} · Industry: ${industry || 'N/A'}</div>
    <h2>Executive Summary</h2>
    <div>${body}</div>
  </div>
</body>
</html>
`;
};

export async function generateThumbnailForJob(prisma: PrismaClient, jobId: string) {
  try {
    const cfg = getS3Config();
    const s3 = buildS3Client(cfg);
    if (!s3 || !cfg.bucket) {
      return; // No storage configured; skip quietly
    }

    const job = await prisma.researchJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        companyName: true,
        geography: true,
        industry: true,
        execSummary: true,
        status: true,
        thumbnailUrl: true
      }
    });

    if (!job || job.status !== 'completed') return;
    if (job.thumbnailUrl) return;

    const markdown = formatSectionContent('exec_summary', job.execSummary);
    if (!markdown || !markdown.trim()) return;

    const html = renderExecSummaryHtml(job.companyName, job.geography, job.industry || null, markdown);

    let browser;
    try {
      browser = await chromium.launch({ headless: true });
    } catch (err) {
      console.error('Playwright launch failed for thumbnail:', err);
      return;
    }

    const page = await browser.newPage({
      viewport: { width: 900, height: 1200 }
    });
    await page.setContent(html, { waitUntil: 'networkidle' });
    const buffer = await page.screenshot({ type: 'png', fullPage: true });
    await browser.close();

    const key = `thumbnails/${job.id}.png`;
    await s3.send(new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: buffer,
      ContentType: 'image/png'
    }));
    const url = toPublicUrl(cfg, key);

    await prisma.researchJob.update({
      where: { id: job.id },
      data: { thumbnailUrl: url }
    });
  } catch (err) {
    console.error(`Failed to generate thumbnail for job ${jobId}:`, err);
  }
}
