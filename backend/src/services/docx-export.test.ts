import { describe, it, expect, beforeAll } from 'vitest';
import JSZip from 'jszip';
import { generateResearchDocx } from './docx-export.js';
import type { ExportSection } from './export-utils.js';

/** Helper: unzip a DOCX buffer and return a map of path → XML string for all XML parts */
async function unzipXmlParts(buf: Buffer): Promise<Map<string, string>> {
  const zip = await JSZip.loadAsync(buf);
  const parts = new Map<string, string>();
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    if (path.endsWith('.xml') || path.endsWith('.rels')) {
      parts.set(path, await entry.async('string'));
    }
  }
  return parts;
}

describe('docx-export', () => {
  const baseJob = {
    companyName: 'Acme Corp',
    geography: 'North America',
    industry: 'Technology',
    status: 'completed',
    createdAt: new Date('2025-01-15'),
  };

  it('returns a valid DOCX buffer (PK magic bytes)', async () => {
    const sections: ExportSection[] = [
      {
        id: 'exec_summary',
        title: 'Executive Summary',
        status: 'completed',
        data: { bullet_points: [{ bullet: 'Test insight', sources: ['S1'] }] },
      },
    ];

    const buffer = await generateResearchDocx({ job: baseJob, exportSections: sections });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    // DOCX files are ZIP archives — first two bytes are PK (0x50, 0x4B)
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });

  it('handles empty sections without crashing', async () => {
    const buffer = await generateResearchDocx({ job: baseJob, exportSections: [] });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer[0]).toBe(0x50);
    expect(buffer[1]).toBe(0x4b);
  });

  it('handles sections with null data gracefully', async () => {
    const sections: ExportSection[] = [
      { id: 'financial_snapshot', title: 'Financial Snapshot', status: 'completed', data: null },
      { id: 'unknown_section', title: 'Unknown', status: 'completed', data: {} },
    ];

    const buffer = await generateResearchDocx({ job: baseJob, exportSections: sections });

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('generates larger buffer when multiple sections have data', async () => {
    const smallSections: ExportSection[] = [
      {
        id: 'exec_summary',
        title: 'Executive Summary',
        status: 'completed',
        data: { bullet_points: [{ bullet: 'One item' }] },
      },
    ];

    const largeSections: ExportSection[] = [
      ...smallSections,
      {
        id: 'financial_snapshot',
        title: 'Financial Snapshot',
        status: 'completed',
        data: {
          summary: 'Financial overview text',
          kpi_table: {
            metrics: [
              { metric: 'Revenue', company: '$100M', industry_avg: '$80M', source: 'S1' },
              { metric: 'EBITDA Margin', company: '25%', industry_avg: '20%', source: 'S2' },
            ],
          },
        },
      },
      {
        id: 'company_overview',
        title: 'Company Overview',
        status: 'completed',
        data: {
          business_description: { overview: 'A technology company.' },
        },
      },
    ];

    const smallBuffer = await generateResearchDocx({ job: baseJob, exportSections: smallSections });
    const largeBuffer = await generateResearchDocx({ job: baseJob, exportSections: largeSections });

    expect(largeBuffer.length).toBeGreaterThan(smallBuffer.length);
  });

  describe('OOXML schema compliance', () => {
    // Generate once, share across validation tests
    let parts: Map<string, string>;

    const richSections: ExportSection[] = [
      {
        id: 'exec_summary',
        title: 'Executive Summary',
        status: 'completed',
        data: { bullet_points: [{ bullet: 'Test insight', sources: ['S1'] }] },
      },
      {
        id: 'financial_snapshot',
        title: 'Financial Snapshot',
        status: 'completed',
        data: {
          summary: 'Financial overview',
          kpi_table: {
            metrics: [
              { metric: 'Revenue', company: '$100M', industry_avg: '$80M', source: 'S1' },
            ],
          },
        },
      },
    ];

    // eslint-disable-next-line vitest/no-hooks
    beforeAll(async () => {
      const buffer = await generateResearchDocx({ job: baseJob, exportSections: richSections });
      parts = await unzipXmlParts(buffer);
    });

    it('all XML parts are well-formed (no unclosed tags / parse errors)', () => {
      for (const [path, xml] of parts) {
        // Basic well-formedness: every opening tag should have a corresponding close
        // and the XML declaration (if present) should be valid.
        // A lightweight check: no stray `<` that isn't part of a tag
        expect(xml, `${path} should start with < or BOM`).toMatch(/^(\uFEFF)?<[\s\S]*>$/);

        // Check that it doesn't contain obviously broken XML like `<<` or unclosed CDATA
        expect(xml, `${path} has broken XML markers`).not.toMatch(/<<|<!\[CDATA\[(?![\s\S]*\]\]>)/);
      }
    });

    it('no duplicate <w:rPr> inside <w:pPr> in footer XML', () => {
      for (const [path, xml] of parts) {
        if (!path.includes('footer')) continue;

        // Extract all <w:pPr>...</w:pPr> blocks and check each has at most one <w:rPr>
        const pPrBlocks = xml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/g) ?? [];
        for (const block of pPrBlocks) {
          const rPrCount = (block.match(/<w:rPr>/g) ?? []).length;
          expect(rPrCount, `${path}: w:pPr should have at most one w:rPr child`).toBeLessThanOrEqual(1);
        }
      }
    });

    it('w:sep attributes use "0" or "1", never "true"/"false"', () => {
      const docXml = parts.get('word/document.xml');
      expect(docXml).toBeDefined();

      // Should not contain w:sep="true" or w:sep="false"
      expect(docXml).not.toMatch(/w:sep="true"/);
      expect(docXml).not.toMatch(/w:sep="false"/);

      // All w:sep values should be "0" or "1"
      const sepMatches = docXml!.match(/w:sep="([^"]*)"/g) ?? [];
      for (const m of sepMatches) {
        expect(m).toMatch(/w:sep="[01]"/);
      }
    });

    it('no w:orient="portrait" in section properties', () => {
      const docXml = parts.get('word/document.xml');
      expect(docXml).toBeDefined();
      expect(docXml).not.toMatch(/w:orient="portrait"/);
    });

    it('all relationship IDs use sequential rId{N} format (no rId0, no random strings)', () => {
      for (const [path, xml] of parts) {
        if (!path.endsWith('.rels')) continue;
        const ids = [...xml.matchAll(/Id="([^"]*)"/g)].map((m) => m[1]);
        for (const id of ids) {
          expect(id, `${path} has non-standard ID "${id}"`).toMatch(/^rId[1-9]\d*$/);
        }
      }
    });

    it('all footer/header r:embed references have matching .rels entries', () => {
      for (const [path, xml] of parts) {
        if (!/^word\/(footer|header)\d+\.xml$/.test(path)) continue;

        // Find all r:embed="rIdN" references
        const embedRefs = xml.match(/r:embed="(rId\d+)"/g) ?? [];
        if (embedRefs.length === 0) continue;

        // Check that corresponding .rels file exists and contains those IDs
        const relsPath = path.replace('word/', 'word/_rels/') + '.rels';
        const relsXml = parts.get(relsPath);
        expect(relsXml, `${relsPath} should exist for ${path}`).toBeDefined();

        for (const ref of embedRefs) {
          const id = ref.match(/r:embed="(rId\d+)"/)?.[1];
          expect(relsXml, `${relsPath} should contain ${id}`).toContain(`Id="${id}"`);
        }
      }
    });

    it('[Content_Types].xml references all XML parts in the ZIP', () => {
      const contentTypes = parts.get('[Content_Types].xml');
      expect(contentTypes).toBeDefined();

      // Every word/*.xml part should have a corresponding Override or Default entry
      for (const path of parts.keys()) {
        if (path === '[Content_Types].xml') continue;
        if (!path.endsWith('.xml')) continue;

        // Content types can reference via Override (specific path) or Default (extension)
        const hasOverride = contentTypes!.includes(`PartName="/${path}"`);
        const hasDefault = contentTypes!.includes('Extension="xml"');
        expect(
          hasOverride || hasDefault,
          `[Content_Types].xml should reference ${path}`,
        ).toBe(true);
      }
    });

    it('all sections have w:code attribute on w:pgSz', () => {
      const docXml = parts.get('word/document.xml')!;
      const pgSzTags = docXml.match(/<w:pgSz[^/]*\/>/g) ?? [];

      // The document has 2 sections (cover + body)
      expect(pgSzTags.length).toBeGreaterThanOrEqual(2);

      for (const tag of pgSzTags) {
        expect(tag, 'Every w:pgSz should have w:code attribute').toMatch(/w:code="/);
      }
    });

    it('table widths use numeric fiftieths-of-percent, not "N%"', () => {
      const docXml = parts.get('word/document.xml')!;
      // Should not contain w:w="100%" or similar percentage strings
      expect(docXml).not.toMatch(/w:type="pct"\s+w:w="\d+%"/);
    });
  });
});
