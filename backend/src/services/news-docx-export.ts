/**
 * News DOCX Export Service
 * Generates branded DOCX digests of news articles with SSA branding.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Header,
  ImageRun,
  ExternalHyperlink,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  Table,
  VerticalAlignSection,
  LineRuleType,
} from 'docx';
import { prisma } from '../lib/prisma.js';
import {
  BRAND_BLUE,
  BRAND_DK2,
  BODY_COLOR,
  PAGE_SIZE,
  PAGE_MARGINS,
  DOCUMENT_STYLES,
  loadAsset,
  buildHeader,
  buildFooter,
  buildCoverLogo,
  postProcessDocx,
} from './docx-shared.js';

interface ExportOptions {
  userId?: string;
  articleIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  articles?: import('./pdf-export.js').ExportArticle[];
  userName?: string;
}

export async function generateNewsDigestDocx(options: ExportOptions): Promise<Buffer> {
  const { userId, articleIds, dateFrom, dateTo } = options;

  let userName = options.userName || 'User';

  // If pre-loaded articles provided, use them directly (no DB access)
  let articles;
  if (options.articles) {
    articles = options.articles;
  } else {
    if (userId && !options.userName) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');
      userName = user.name || user.email;
    }

    // Fetch articles — by IDs or by user (all non-archived)
    if (articleIds && articleIds.length > 0) {
      articles = await prisma.newsArticle.findMany({
        where: { id: { in: articleIds } },
        include: { company: true, person: true, tag: true },
        orderBy: [{ publishedAt: 'desc' }],
      });
    } else if (userId) {
      const where: any = {
        articleUsers: { some: { userId } },
        isArchived: false,
      };
      if (dateFrom || dateTo) {
        where.publishedAt = {};
        if (dateFrom) where.publishedAt.gte = dateFrom;
        if (dateTo) where.publishedAt.lte = dateTo;
      }
      articles = await prisma.newsArticle.findMany({
        where,
        include: { company: true, person: true, tag: true },
        orderBy: [{ publishedAt: 'desc' }],
      });
    } else {
      throw new Error('Either userId, articleIds, or articles must be provided');
    }
  }

  // Group articles by company
  const grouped: Record<string, typeof articles> = {};
  for (const article of articles) {
    const companyName = article.company?.name || 'Other';
    if (!grouped[companyName]) grouped[companyName] = [];
    grouped[companyName].push(article);
  }

  const companyNames = Object.keys(grouped).sort((a, b) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── Cover page ──
  const coverChildren: Paragraph[] = [];

  // SAMI mascot above SSA logo
  try {
    const samiData = loadAsset('SAMI_News.png');
    coverChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new ImageRun({
            type: 'png',
            data: samiData,
            transformation: { width: 250, height: 333 },
            altText: {
              title: 'SAMI',
              description: 'SAMI mascot',
              name: 'SAMI',
            },
          }),
        ],
      }),
    );
  } catch {
    // SAMI image not available — skip
  }

  const coverLogo = buildCoverLogo(450);
  if (coverLogo) coverChildren.push(coverLogo);

  coverChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'SSAMI News Digest' })],
      spacing: { before: 0, after: 120 },
    }),
  );

  const metaLines = [
    `Prepared for: ${userName}`,
    dateStr,
    `${articles.length} article${articles.length !== 1 ? 's' : ''}`,
  ];
  for (const line of metaLines) {
    coverChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: line,
            font: 'Avenir Next LT Pro',
            size: 20,
            color: '6B7280',
          }),
        ],
        spacing: { after: 40 },
      }),
    );
  }

  // ── Body content ──
  const bodyChildren: (Paragraph | Table)[] = [];

  for (const companyName of companyNames) {
    const companyArticles = grouped[companyName];

    // Spacer before company heading
    bodyChildren.push(
      new Paragraph({ children: [], spacing: { after: 120 } }),
    );

    // Company heading — blue shaded paragraph, full width
    bodyChildren.push(
      new Paragraph({
        shading: {
          type: ShadingType.CLEAR,
          color: 'auto',
          fill: BRAND_BLUE,
        },
        spacing: { before: 0, after: 0, line: 320, lineRule: LineRuleType.EXACT },
        children: [
          new TextRun({
            text: companyName.toUpperCase(),
            font: 'Avenir Next LT Pro',
            size: 20,
            bold: true,
            color: 'FFFFFF',
          }),
        ],
      }),
    );

    // Spacer after blue bar to prevent overlap with tag/headline
    bodyChildren.push(
      new Paragraph({ children: [], spacing: { before: 0, after: 160 } }),
    );

    for (let i = 0; i < companyArticles.length; i++) {
      const article = companyArticles[i];

      // Tag badge
      if (article.tag?.name) {
        bodyChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: article.tag.name.toUpperCase(),
                font: 'Avenir Next LT Pro',
                size: 14, // 7pt
                bold: true,
                color: BRAND_DK2,
              }),
            ],
            spacing: { before: 80, after: 40 },
          }),
        );
      }

      // Headline
      bodyChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: article.headline })],
          spacing: { before: 100, after: 60 },
        }),
      );

      // Summary (longSummary → shortSummary → summary fallback)
      const summaryText = article.longSummary || article.shortSummary || article.summary;
      if (summaryText) {
        bodyChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: summaryText,
                font: 'Avenir Next LT Pro',
                size: 22,
                color: BODY_COLOR,
              }),
            ],
            spacing: { after: 60 },
          }),
        );
      }

      // Why It Matters
      if (article.whyItMatters) {
        bodyChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Why It Matters: ',
                font: 'Avenir Next LT Pro',
                size: 22,
                italics: true,
                bold: true,
                color: BRAND_BLUE,
              }),
              new TextRun({
                text: article.whyItMatters,
                font: 'Avenir Next LT Pro',
                size: 22,
                italics: true,
                color: BRAND_BLUE,
              }),
            ],
            spacing: { after: 60 },
          }),
        );
      }

      // Source line
      const pubDate = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })
        : 'Unknown date';
      const sourceText = `${article.sourceName || 'Unknown source'}  |  ${pubDate}`;

      const sourceChildren: (TextRun | ExternalHyperlink)[] = [
        new TextRun({
          text: sourceText,
          font: 'Avenir Next LT Pro',
          size: 18,
          color: '6B7280',
        }),
      ];

      if (article.sourceUrl) {
        sourceChildren.push(
          new TextRun({
            text: '  |  ',
            font: 'Avenir Next LT Pro',
            size: 18,
            color: '6B7280',
          }),
          new ExternalHyperlink({
            link: article.sourceUrl,
            children: [
              new TextRun({
                text: 'Link to Article',
                style: 'Hyperlink',
                font: 'Avenir Next LT Pro',
                size: 18,
              }),
            ],
          }),
        );
      }

      bodyChildren.push(
        new Paragraph({
          children: sourceChildren,
          spacing: { after: 80 },
        }),
      );

      // Thin separator between articles (not after last)
      if (i < companyArticles.length - 1) {
        bodyChildren.push(
          new Paragraph({
            children: [],
            spacing: { before: 40, after: 40 },
            border: {
              bottom: {
                color: 'CBD5E1',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 4,
              },
            },
          }),
        );
      }
    }
  }

  const header = buildHeader();
  const footer = buildFooter();

  const doc = new Document({
    creator: 'SSA & Company',
    title: `SSAMI News Digest - ${userName}`,
    description: `News digest for ${userName}`,
    styles: DOCUMENT_STYLES,
    sections: [
      // Section 1: Cover page
      {
        properties: {
          titlePage: true,
          page: {
            size: PAGE_SIZE,
            margin: PAGE_MARGINS,
            pageNumbers: { start: 1 },
          },
          column: { separate: true, space: 720 },
          verticalAlign: VerticalAlignSection.CENTER,
        },
        headers: {
          default: header,
          first: new Header({ children: [new Paragraph({ children: [] })] }),
        },
        footers: { default: footer, first: footer },
        children: coverChildren,
      },
      // Section 2: Body content
      {
        properties: {
          page: {
            size: PAGE_SIZE,
            margin: PAGE_MARGINS,
          },
          column: { separate: true, space: 720 },
        },
        headers: { default: header },
        footers: { default: footer },
        children: bodyChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return postProcessDocx(Buffer.from(buffer));
}
