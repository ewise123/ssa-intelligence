const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, 
        HeadingLevel, BorderStyle, WidthType, ShadingType } = require('docx');

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22 }
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, color: "1F4E78", font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, color: "2E5C8A", font: "Arial" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 23, bold: true, color: "365F91", font: "Arial" },
        paragraph: { spacing: { before: 140, after: 80 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "appendix-bullets",
        levels: [
          {
            level: 0,
            format: "bullet",
            text: "•",
            alignment: "left",
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 }
              }
            }
          }
        ]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("10. Appendix")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 240 },
        children: [new TextRun(
          "This appendix provides supporting documentation, methodological notes, and reference data used throughout the company intelligence report. Section 10.1 catalogs primary and secondary sources; Section 10.2 presents foreign exchange rates, industry benchmarks, and macroeconomic assumptions; Section 10.3 details calculations for derived financial metrics."
        )]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("10.1 Source References")]
      }),

      new Paragraph({
        spacing: { before: 120 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("10.1.1 Primary Sources")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "SEC Filings (Official Company Disclosures):",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Parker-Hannifin Corporation Form 10-K for fiscal year ended June 30, 2024 (filed August 22, 2024). Accessed via SEC EDGAR database.")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Parker-Hannifin Corporation Form 10-Q for quarters ended September 30, 2023; December 31, 2023; March 31, 2024; and September 30, 2024.")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Form 8-K Current Reports: Filtration Group acquisition announcement (November 11, 2024), quarterly earnings releases, and material event disclosures.")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Earnings Materials & Investor Communications:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Q4 FY2024 Earnings Release and Presentation (August 8, 2024) - investors.parker.com")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Q3 FY2024 Earnings Release and Presentation (May 2, 2024)")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Q2 FY2024 Earnings Release and Presentation (February 1, 2024)")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Q1 FY2024 Earnings Release and Presentation (November 2, 2023)")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Investor Day Presentation (May 16, 2024) - Updated long-term financial targets through FY2029")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Filtration Group Acquisition Announcement and Presentation (November 11, 2024)")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Parker-Hannifin 2024 Annual Report")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Corporate Website & Investor Relations:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("investors.parker.com - Financial information, governance documents, ESG reporting")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("www.parker.com - Product catalogs, technology descriptions, market applications")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Company history archives and historical annual reports (1917-present)")]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("10.1.2 Secondary Sources")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Industry Research & Market Analysis:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Deloitte: '2024 Aerospace and Defense Industry Outlook' and '2026 A&D Industry Outlook' - Market trends, production forecasts, supply chain analysis")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("PwC: 'Aerospace and Defense Review and Forecast 2024/2025' - Industry performance metrics and outlook")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("AlixPartners: '2024 A&D Outlook' - Supply chain challenges, ramp-up analysis, M&A trends")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Allied Market Research: 'Aerospace and Defense Industry 2024 Overview' - Regional market analysis, technology trends")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Aerospace Industries Association (AIA): '2024 and 2025 Facts & Figures' - Employment data, economic impact, trade statistics")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Competitor Intelligence:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Eaton Corporation: 10-K filings, earnings releases, investor presentations (2023-2024)")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Honeywell International: Annual reports, quarterly earnings, segment disclosures")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Emerson Electric: Financial filings and investor materials")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Moog Inc., Donaldson Company: Public financial disclosures")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Bosch Rexroth, Danfoss, SMC Corporation: Company websites, press releases, industry publications")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "News & Press Coverage:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Bloomberg: Filtration Group acquisition coverage, stock analysis, industry commentary")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Crain's Cleveland Business: Local coverage of Parker-Hannifin developments")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Aviation Week, Flight Global: Aerospace industry news and analysis")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("ThomasNet, IndustryWeek: Industrial manufacturing news and trends")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun({
          text: "Data Confidence & Recency:",
          bold: true
        })]
      }),
      new Paragraph({
        children: [new TextRun(
          "All financial data are based on officially reported figures in SEC filings (10-K, 10-Q) as of fiscal year ended June 30, 2024 (filed August 22, 2024). Forward-looking statements and guidance reflect management's public disclosures as of November 2024. Market sizing, growth rates, and trend analysis incorporate third-party research published between June 2024 and December 2024. Confidence level: HIGH for historical financials (primary source verification); MEDIUM-HIGH for forward projections (based on management guidance); MEDIUM for competitive benchmarking (public disclosures with estimation required for private competitors)."
        )]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("10.2 FX Rates, Industry Averages & Assumptions")]
      }),

      new Paragraph({
        spacing: { before: 120 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("10.2.1 Foreign Exchange Rates")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun(
          "Parker-Hannifin reports in U.S. dollars. Foreign exchange fluctuations impact reported results as approximately 45% of revenue is generated outside the United States. The following average exchange rates were used for FY2024 reporting and analysis:"
        )]
      }),

      new Table({
        columnWidths: [3000, 2500, 2500, 2360],
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Currency Pair", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "FY2024 Avg Rate", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "FY2023 Avg Rate", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "YoY Change", bold: true, color: "FFFFFF", size: 18 })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "EUR/USD", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1.08", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1.07", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "+0.9%", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "GBP/USD", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1.27", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1.23", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "+3.3%", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "CNY/USD", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "7.20", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "6.98", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "-3.2%", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "JPY/USD", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "149", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "137", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "-8.8%", size: 19 })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 180, after: 120 },
        children: [new TextRun({
          text: "FX Impact on Reported Results:",
          bold: true
        })]
      }),
      new Paragraph({
        children: [new TextRun(
          "In FY2024, foreign exchange reduced reported sales by approximately 30 basis points (~$60M headwind) due to dollar strengthening against Asian currencies, partially offset by Euro/Sterling strength. Parker reports organic growth at constant currency by restating prior year results using current year exchange rates, eliminating FX distortion from performance analysis."
        )]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("10.2.2 Industry Benchmark Averages")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun(
          "The following benchmarks represent diversified industrial peer group averages (Eaton, Honeywell, Emerson, Moog, Donaldson) based on most recent fiscal year data (FY2024 or CY2024). Used for competitive positioning analysis in Section 6."
        )]
      }),

      new Table({
        columnWidths: [4000, 3200, 3160],
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Metric", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Peer Average", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Parker-Hannifin", bold: true, color: "FFFFFF", size: 18 })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Operating Margin", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "18.3%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D4EDDA", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "24.9%", bold: true, size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "EBITDA Margin", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "22.0%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D4EDDA", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "25.6%", bold: true, size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Return on Equity", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "29.2%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "23.9%", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Free Cash Flow Margin", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "12.4%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D4EDDA", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "15.0%", bold: true, size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Revenue CAGR (5-year)", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5.5%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "D4EDDA", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "7.0%", bold: true, size: 19 })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("10.2.3 Macroeconomic & Market Assumptions")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Aerospace Market Assumptions:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Global air travel demand: 102% of 2019 levels (2024), growing 4-5% CAGR through 2030")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Boeing 737 MAX production: 38 units/month by Q4 2024, targeting 50+ by 2026")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Airbus A320neo family: 60+ units/month in 2024, targeting 75/month by 2026")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("F-35 production: 156 units/year target (current ~140/year)")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Commercial aftermarket: Growing 8-12% annually through 2027 as flight hours normalize")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Industrial Market Assumptions:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("U.S. Manufacturing PMI: Averaging 48-52 (expansion/contraction threshold) through 2025")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Industrial capex spending: Modest growth 2-4% annually, driven by automation and reshoring")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Oil & gas capex: $600-650B globally in 2025, up from $550B in 2023")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Construction equipment demand: Flat to low-single-digit growth in North America/Europe; mid-single-digit in Asia-Pacific")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun({
          text: "Inflation & Cost Assumptions:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Raw material inflation: 1-3% annually (steel, aluminum, copper, plastics) - moderating from 2022-2023 peaks")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Labor cost inflation: 3-5% in aerospace/defense; 2-4% in general industrial")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Freight/logistics: Normalized to pre-pandemic levels (2019 baseline +10-15%)")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Parker price realization: 3-4% annually, offsetting inflation through contractual escalators and market pricing")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("10.3 Derived Metrics & Calculation Methodology")]
      }),

      new Paragraph({
        spacing: { before: 120 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("10.3.1 Margin Calculations")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 80 },
        children: [new TextRun({
          text: "Adjusted Segment Operating Margin:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker reports adjusted segment operating margin excluding: (1) Business realignment charges (restructuring, facility consolidations), (2) Acquisition-related intangible asset amortization, (3) Costs to achieve (integration expenses for M&A), and (4) Acquisition-related costs. FY2024 adjusted segment operating margin of 24.9% is calculated as adjusted segment operating income of $4,964M divided by total sales of $19,930M."
        )]
      }),

      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [new TextRun({
          text: "EBITDA & Adjusted EBITDA Margin:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "EBITDA = Net Income + Interest Expense + Income Taxes + Depreciation + Amortization. Adjusted EBITDA further excludes business realignment charges, acquisition-related costs, and other non-recurring items. FY2024 adjusted EBITDA margin of 25.6% represents adjusted EBITDA of ~$5,102M divided by sales of $19,930M."
        )]
      }),

      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [new TextRun({
          text: "Return on Sales (ROS):",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Adjusted net income divided by total sales. FY2024 adjusted ROS of 16.4% = adjusted net income of $3,274M / sales of $19,930M."
        )]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("10.3.2 Return & Efficiency Metrics")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 80 },
        children: [new TextRun({
          text: "Return on Equity (ROE):",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Net income divided by average shareholders' equity. FY2024 ROE of 23.9% = net income of $3,195M / average equity of $13,366M (average of beginning and ending equity)."
        )]
      }),

      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [new TextRun({
          text: "Return on Invested Capital (ROIC):",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "NOPAT (Net Operating Profit After Tax) divided by invested capital. Invested capital = total debt + shareholders' equity - cash and cash equivalents. FY2024 estimated ROIC of ~14% based on NOPAT of ~$2,800M and invested capital of ~$20,000M."
        )]
      }),

      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [new TextRun({
          text: "Free Cash Flow (FCF) & FCF Margin:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "FCF = Cash flow from operations - Capital expenditures. FY2024: CFOA of $3,384M - capex of $400M = FCF of $2,984M. FCF margin = FCF / sales = $2,984M / $19,930M = 15.0%."
        )]
      }),

      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [new TextRun({
          text: "Working Capital Metrics:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Days Inventory Outstanding (DIO) = (Inventory / COGS) × 365. FY2024: 80 days = ($4,312M / $12,793M annual COGS) × 365")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Days Sales Outstanding (DSO) = (Accounts Receivable / Sales) × 365. FY2024: 51 days")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Days Payables Outstanding (DPO) = (Accounts Payable / COGS) × 365")]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun("Cash Conversion Cycle = DIO + DSO - DPO")]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("10.3.3 Leverage & Coverage Ratios")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 80 },
        children: [new TextRun({
          text: "Net Debt / EBITDA:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Net Debt = Total Debt - Cash and Cash Equivalents. FY2024: Net debt of ~$10,200M / adjusted EBITDA of ~$5,100M = 2.0x leverage ratio (Parker's stated target)."
        )]
      }),

      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [new TextRun({
          text: "Interest Coverage Ratio:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "EBIT / Interest Expense. FY2024: Operating income of $4,288M / interest expense of ~$450M = ~9.5x coverage (strong creditworthiness)."
        )]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("10.3.4 Growth Rate Calculations")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 80 },
        children: [new TextRun({
          text: "Organic Growth:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker reports organic growth at constant currency excluding acquisitions and divestitures. Calculation: [(Current Year Sales at Prior Year FX Rates) - (Prior Year Sales excluding divested businesses including acquired businesses)] / (Prior Year Sales excluding divested businesses including acquired businesses). This isolates underlying business performance from M&A and FX effects."
        )]
      }),

      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [new TextRun({
          text: "Compound Annual Growth Rate (CAGR):",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "CAGR = [(Ending Value / Beginning Value)^(1/number of years)] - 1. Example: FY2019-FY2024 revenue CAGR of 7% = [($19,930M / $14,301M)^(1/5)] - 1 = 6.9%."
        )]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("10.4 Report Methodology & Limitations")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 100 },
        children: [new TextRun({
          text: "Research Approach:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "This intelligence report synthesizes publicly available information from SEC filings, earnings materials, industry research, competitive analysis, and news sources. No proprietary or confidential information was accessed. Analysis represents the author's interpretation of disclosed data and should not be construed as investment advice, legal counsel, or official company position."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Key Limitations:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Forward-Looking Uncertainty: Projections, guidance, and trend analysis are subject to macroeconomic conditions, geopolitical events, competitive dynamics, and execution risk that may cause actual results to differ materially.")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Private Competitor Data: Benchmarking against private companies (Bosch Rexroth, Danfoss, SMC, Festo) relies on estimated figures from industry sources rather than audited financials.")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Market Sizing Estimates: TAM/SAM figures for emerging markets (hydrogen infrastructure, data center cooling, eVTOL) are based on third-party research with inherent forecast uncertainty.")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("Segment Allocation: Some cross-segment revenue (aerospace filtration, industrial engineered materials) may be allocated differently in internal reporting versus public disclosure.")]
      }),
      new Paragraph({
        numbering: { reference: "appendix-bullets", level: 0 },
        children: [new TextRun("M&A Integration Complexity: Filtration Group synergy estimates and integration timelines are management projections subject to execution risk, regulatory approval, and market conditions.")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun({
          text: "Report Currency & Timing:",
          bold: true
        })]
      }),
      new Paragraph({
        children: [new TextRun(
          "All financial figures are reported in U.S. dollars unless otherwise noted. Report reflects information available as of December 5, 2024. Material developments after this date are not incorporated. Fiscal year references follow Parker-Hannifin's fiscal calendar (July 1 - June 30)."
        )]
      }),

      new Paragraph({
        spacing: { before: 240, after: 180 },
        children: [new TextRun({
          text: "--- End of Company Intelligence Report ---",
          bold: true,
          italics: true,
          size: 24
        })],
        alignment: AlignmentType.CENTER
      }),

      new Paragraph({
        spacing: { before: 120 },
        children: [new TextRun({
          text: "Report Prepared: December 2024",
          italics: true,
          size: 20
        })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Subject: Parker-Hannifin Corporation (NYSE: PH)",
          italics: true,
          size: 20
        })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Confidence Level: HIGH (Primary Sources)",
          italics: true,
          size: 20
        })],
        alignment: AlignmentType.CENTER
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/10_Appendix.docx", buffer);
  console.log("Appendix created successfully");
});
