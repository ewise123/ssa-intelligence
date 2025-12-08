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
        run: { size: 24, bold: true, color: "44546A", font: "Arial" },
        paragraph: { spacing: { before: 140, after: 80 }, outlineLevel: 2 }
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
        children: [new TextRun("4. Segment Analysis")]
      }),
      new Paragraph({
        spacing: { before: 120, after: 240 },
        children: [new TextRun(
          "Parker-Hannifin operates through two primary reportable segments that serve distinct end markets with complementary technology portfolios. The Diversified Industrial Segment (73% of FY2024 revenue) provides motion and control solutions across industrial, mobile, and commercial markets globally. The Aerospace Systems Segment (27% of FY2024 revenue) supplies highly engineered components and systems for commercial and defense aircraft platforms with significant aftermarket content."
        )]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.1 Diversified Industrial Segment")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [new TextRun({
          text: "4.1.1 Financial Snapshot",
          bold: true,
          size: 24
        })]
      }),

      new Table({
        columnWidths: [3120, 1870, 1870, 1870],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Metric", bold: true, color: "FFFFFF", size: 22 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "FY2024", bold: true, color: "FFFFFF", size: 22 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "FY2023", bold: true, color: "FFFFFF", size: 22 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "YoY Change", bold: true, color: "FFFFFF", size: 22 })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Total Segment Sales", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$14,457M", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$14,706M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("-1.7%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("North America Sales")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$8,800M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$8,916M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("-1.3%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("International Sales")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$5,657M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$5,789M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("-2.3%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Segment Operating Income", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$3,176M", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$3,071M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "+3.4%", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Segment Operating Margin", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "22.0%", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("20.9%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "+110 bps", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("North America Margin")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("22.3%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("20.8%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+150 bps")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("International Margin")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("21.4%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("21.0%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+40 bps")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Segment Backlog")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$4,182M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$4,786M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("-12.6%")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "4.1.2 Performance Analysis",
          bold: true,
          size: 24
        })]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Revenue Dynamics:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "The Diversified Industrial Segment experienced a 1.7% organic decline in FY2024, reflecting broad-based industrial market softness across short-cycle businesses. Excluding acquisitions ($115M contribution from Meggitt integration), divestitures ($23M negative), and foreign exchange headwinds ($30M negative), organic sales declined $312M. The decline was concentrated in HVAC/R, transportation, off-highway, and in-plant industrial equipment markets, partially offset by strength in aerospace & defense and energy verticals within the industrial segment."
        )]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "North America businesses declined 2.2% organically with particular weakness in automotive, commercial HVAC, and general industrial machinery. International businesses decreased 2.0% organically with Europe experiencing the most significant headwinds from weak manufacturing activity and elevated inventory levels. Asia Pacific showed mixed performance with China softness offset by strength in India and Southeast Asia. Latin America posted modest growth driven by infrastructure investments."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Margin Expansion Despite Revenue Headwinds:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Operating margin improved 110 basis points to 22.0% despite lower volumes, demonstrating The Win Strategy's effectiveness. Margin drivers included: (1) Price realization of 3-4% offsetting cost inflation, (2) Favorable product mix toward higher-margin engineered materials and filtration products, (3) Material and freight cost moderation providing tailwinds, (4) Operational efficiencies from lean initiatives and Kaizen events, and (5) Benefits from prior-year restructuring actions. North America margins expanded 150 bps to 22.3% while International margins improved 40 bps to 21.4%."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Strategic Initiatives & Management Commentary:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Simplification program consolidating operating groups and reducing organizational complexity")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Continued Meggitt integration synergy capture in shared industrial products")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Inventory reduction initiatives improving cash conversion (80 days inventory vs. 85 prior year)")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Digital transformation investments in configurators, e-commerce platforms, and IoT-enabled products")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("• Filtration Group acquisition announcement ($9.25B, November 2024) to significantly expand filtration capabilities")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Order Trends & Forward Outlook:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Order rates showed sequential improvement through FY2024, particularly in Q4, signaling potential stabilization. Management guidance for FY2025 anticipated neutral to low-single-digit organic growth in the first half with acceleration in the second half as destocking completes and industrial capital spending recovers. Aerospace & defense content within the industrial segment continues showing double-digit growth. The $4.2B backlog, while down 12.6%, remains healthy at 3.5 months of revenue coverage."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "4.1.3 Competitive Landscape",
          bold: true,
          size: 24
        })]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Primary Competitors by Product Category:",
          bold: true
        })]
      }),

      new Table({
        columnWidths: [2800, 3280, 3280],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Competitor", bold: true, color: "FFFFFF", size: 20 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Product Overlap", bold: true, color: "FFFFFF", size: 20 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Competitive Position", bold: true, color: "FFFFFF", size: 20 })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Bosch Rexroth (Germany)", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Hydraulics, pneumatics, electric drives, motion control", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Strong in factory automation and mobile hydraulics; limited North America distribution", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Eaton Corporation", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Hydraulics, filtration, electrical systems, vehicle components", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Broader diversification into electrical; strong mobile hydraulics presence", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Danfoss (Denmark)", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Hydraulics, drives, controls, refrigeration components", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Market leader in HVAC/R controls; strong European industrial presence", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Donaldson Company", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Filtration (engine, industrial, aerospace)", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Pure-play filtration leader; narrower product scope than Parker", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "SMC Corporation (Japan)", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Pneumatic actuators, valves, air preparation equipment", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Dominant Asia pneumatics player; aggressive pricing but limited systems integration", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Festo (Germany)", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Pneumatic automation, process valves, industrial training", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Innovation leader in pneumatics and Industry 4.0; premium pricing", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Swagelok (US)", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Tube fittings, valves, regulators for fluid systems", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Premium brand in instrumentation fittings; narrower product range", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Emerson Electric", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Process automation, valves (ASCO), climate technologies", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Broader automation/software focus; strong process industries presence", size: 19 })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 180, after: 120 },
        children: [new TextRun({
          text: "Competitive Advantages:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Unmatched breadth: Only competitor offering integrated solutions across 8+ core technologies")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Distribution network: ~17,100 independent distributors plus ParkerStores provide unrivaled local presence")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Systems integration: Two-thirds of customers buy 4+ Parker technologies, creating high switching costs")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Aftermarket dominance: Installed base and standardized components generate recurring revenue streams")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Engineering expertise: 8,000+ engineers enabling design-in partnerships with OEMs")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("• Global manufacturing: 335 plants enable local-for-local production and rapid response")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Competitive Pressures:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Price competition from lower-cost Asian manufacturers in commoditized pneumatics and fittings")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Technology disruption from electrification reducing hydraulics content in mobile applications")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Digital transformation enabling competitors to offer IoT-connected products and predictive maintenance")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("• M&A consolidation intensifying as larger players (Eaton, Emerson, Schneider) pursue scale")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("4.2 Aerospace Systems Segment")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [new TextRun({
          text: "4.2.1 Financial Snapshot",
          bold: true,
          size: 24
        })]
      }),

      new Table({
        columnWidths: [3120, 1870, 1870, 1870],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Metric", bold: true, color: "FFFFFF", size: 22 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "FY2024", bold: true, color: "FFFFFF", size: 22 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "FY2023", bold: true, color: "FFFFFF", size: 22 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "YoY Change", bold: true, color: "FFFFFF", size: 22 })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Total Segment Sales", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$5,472M", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$4,360M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "+25.5%", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Organic Growth (ex-acquisitions/FX)")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("~17%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("–")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("–")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Segment Operating Income", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$1,111M", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$562M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "+97.7%", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Segment Operating Margin", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "20.3%", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("12.9%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "+740 bps", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Segment Backlog")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$6,680M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$6,201M")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+7.7%")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "4.2.2 Performance Analysis",
          bold: true,
          size: 24
        })]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Exceptional Growth Trajectory:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "The Aerospace Systems Segment delivered outstanding FY2024 performance with total sales growth of 25.5% and organic growth of approximately 17%. The Meggitt acquisition contributed $386M while favorable foreign exchange added $19M. Divestiture of the aircraft wheel and brake business to Kaman Corporation reduced sales by $40M. The segment has effectively doubled in size since FY2020 ($2.7B to $5.5B), establishing Parker as a top-tier aerospace systems supplier."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Revenue Mix by Market Platform:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Commercial OEM: Strong double-digit growth driven by Boeing 737 MAX ramp, Airbus A320neo family production increases, and wide-body recovery")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Commercial Aftermarket: High-teens growth as air travel reached 102% of pre-COVID levels; shop visits normalizing")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Defense OEM: Mid-single-digit growth on F-35, CH-47 Chinook, and various UAV programs")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Defense Aftermarket: Low-double-digit growth driven by readiness initiatives and aging fleet maintenance")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("• Business & Regional Aviation: Modest growth as business jet deliveries remained solid")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Dramatic Margin Expansion:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Operating margin expanded an impressive 740 basis points to 20.3%, driven by: (1) Volume leverage on fixed costs as production rates increased, (2) Favorable aftermarket mix (higher margin than OEM), (3) Meggitt synergy capture ahead of plan ($160M run-rate by FY2024 vs. $140M target), (4) Elimination of FY2023 Meggitt inventory step-up charges ($110M), (5) Reduced integration expenses ($55M savings YoY), and (6) Operational improvements through Win Strategy application. The segment exited FY2024 with quarterly margins exceeding 22%, demonstrating sustained performance."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Platform Positioning & Content Growth:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker maintains content on virtually all major commercial and military aircraft platforms globally. Key positions include primary flight control systems on Boeing 737 and 787, fuel systems on Airbus A320neo family, hydraulic power generation on F-35, and environmental control systems on CH-47. The company's bill of materials is expanding with more-electric aircraft architecture, as hydraulic, fuel, thermal management, and electrical power distribution systems become more integrated. Parker estimates 1.5-2x content increase on next-generation platforms compared to predecessor aircraft."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Meggitt Integration Success:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "The $8.3B Meggitt acquisition has proven highly successful with integration completing ahead of original timeline. Complementary product portfolios (Parker: hydraulics, fuel systems, flight controls; Meggitt: wheels & brakes, fire protection, sensing) created minimal overlap. Cultural alignment around engineering excellence and aftermarket service facilitated smooth integration. Synergies exceeded targets through procurement savings, manufacturing footprint optimization, and commercial cross-selling. The divestiture of Meggitt's wheels & brakes business (non-core) for $440M further streamlined the portfolio."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "4.2.3 Competitive Landscape",
          bold: true,
          size: 24
        })]
      }),

      new Table({
        columnWidths: [2800, 3280, 3280],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Competitor", bold: true, color: "FFFFFF", size: 20 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Product Overlap", bold: true, color: "FFFFFF", size: 20 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Competitive Position", bold: true, color: "FFFFFF", size: 20 })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Honeywell Aerospace", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Auxiliary power units, environmental controls, avionics, wheels & brakes", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Larger aerospace revenue ($15B); broader avionics/electronics capabilities", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Collins Aerospace (RTX)", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Actuation, landing systems, avionics, interiors, power & controls", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Vertically integrated; strongest in avionics and cabin systems", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Safran (France)", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Landing gear, brakes, fuel systems, nacelles, cabin equipment", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Strong European OEM relationships; joint ventures with GE on engines", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Moog Inc.", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Electro-hydraulic actuators, flight controls, thrust vector systems", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Smaller scale ($3.3B revenue); strong in defense and space applications", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Woodward Inc.", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Engine fuel systems, combustion controls, actuators", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Specialized in engine controls; strong industrial gas turbine business", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Triumph Group", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Hydraulic systems, actuation, structures, interiors", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Smaller competitor; portfolio rationalization ongoing", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Crane Aerospace", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Fuel pumps, valves, sensing equipment, fluid management", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 3280, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Niche player in fuel systems; limited scale ($800M revenue)", size: 19 })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 180, after: 120 },
        children: [new TextRun({
          text: "Competitive Advantages:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Platform ubiquity: Content on virtually every major commercial and military aircraft globally")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Complementary portfolio: Post-Meggitt, Parker offers integrated hydraulics, fuel, flight controls, thermal management, and fire protection")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Aftermarket installed base: 30+ year revenue streams from MRO requirements and airworthiness mandates")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Engineering depth: 3,000+ aerospace engineers enabling early design-in on next-gen platforms")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Certification expertise: Proven ability to meet stringent DO-160, DO-178, and military specifications")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("• Global support network: 24/7 AOG (aircraft on ground) support through ParkerStores and service centers")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Competitive Risks:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• OEM consolidation: Boeing 737 MAX and Airbus A320neo family concentration creates customer power")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Supply chain complexity: Dependence on sub-tier suppliers for raw materials (titanium, aluminum forgings)")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• More-electric aircraft: Shift toward electrical systems may reduce hydraulic content on future platforms")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Aerospace cycle risk: Commercial aviation remains cyclical with exposure to economic downturns")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("• Certification barriers declining: Advances in simulation and digital twins may ease competitive entry")]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/4_Segment_Analysis.docx", buffer);
  console.log("Segment Analysis created successfully");
});
