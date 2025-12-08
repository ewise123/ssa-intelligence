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
        children: [new TextRun("6. Peer Benchmarking")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 240 },
        children: [new TextRun(
          "This section benchmarks Parker-Hannifin against selected diversified industrial and aerospace peers to assess relative financial performance, operational efficiency, and market positioning. Peer selection criteria include: (1) Similar business models (motion control, aerospace systems, industrial distribution), (2) Comparable revenue scale ($15B-$50B), (3) Public financial disclosure, and (4) Overlapping end markets. All figures represent most recently reported fiscal year data (FY2024 or calendar 2024)."
        )]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("6.1 Peer Comparison Table")]
      }),

      new Table({
        columnWidths: [1700, 1300, 1300, 1300, 1300, 1300, 1960],
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 1700, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Company", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Revenue ($B)", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Op Margin", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "EBITDA Margin", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "ROE", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "FCF Margin", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1960, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Primary Focus", bold: true, color: "FFFFFF", size: 18 })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 1700, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Parker-Hannifin", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$19.9", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "24.9%", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "25.6%", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "23.9%", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "15.0%", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1960, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Motion control, aerospace", size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 1700, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Eaton", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$24.9", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "22.0%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~26%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~35%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~12%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1960, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Electrical power mgmt", size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 1700, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Honeywell", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$38.0", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~21%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~24%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~40%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~15%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1960, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Aerospace, automation", size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 1700, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Emerson Electric", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$18.0", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "20.1%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~23%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~25%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~14%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1960, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Process automation", size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 1700, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Moog", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$3.3", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~12%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~16%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~18%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~8%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1960, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Aerospace controls", size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 1700, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Donaldson", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$3.5", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "16.5%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~21%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~28%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~13%", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1960, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Filtration pure-play", size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 1700, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Peer Average", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$17.5", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "18.3%", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "22.0%", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "29.2%", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1300, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "12.4%", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1960, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "–", size: 17 })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 180, after: 240 },
        children: [new TextRun({
          text: "Note: Operating margin figures are adjusted to exclude one-time charges and acquisition-related amortization where disclosed. Peer average excludes Parker-Hannifin.",
          italics: true,
          size: 20
        })]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("6.2 Peer Benchmark Summary")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Operating Margin Leadership:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker's 24.9% adjusted segment operating margin significantly outperforms the peer average of 18.3% by 660 basis points, ranking first among selected peers. This leadership reflects: (1) Win Strategy operational excellence delivering 630 bps expansion since FY2019, (2) Favorable aerospace mix (27% of revenue at 20%+ margins), (3) Strong aftermarket content (45% of revenue) with inherently higher margins, (4) Successful Meggitt integration capturing $160M synergies, and (5) Scale advantages in distribution and manufacturing. Eaton approaches parity at 22.0% through electrical equipment focus, while Honeywell (~21%) and Emerson (20.1%) operate more diversified portfolios with dilutive software/services businesses. Smaller peers Moog (~12%) and Donaldson (16.5%) face scale disadvantages."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "EBITDA Margin Positioning:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker's 25.6% adjusted EBITDA margin exceeds peer average of 22.0% by 360 basis points, ranking second behind Eaton (~26%). This demonstrates strong earnings quality with lower depreciation/amortization burden than peers. Management's FY2029 target of 28% EBITDA margin would establish clear best-in-class positioning. Eaton's electrical infrastructure business benefits from lower CapEx intensity, while Honeywell's software/controls mix drives favorable EBITDA conversion."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Return on Equity Analysis:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker's 23.9% ROE trails peer average of 29.2%, primarily due to lower financial leverage (2.0x net debt/EBITDA) versus more leveraged competitors. Honeywell (40% ROE) and Eaton (35% ROE) employ higher leverage and aggressive share repurchases to boost returns. However, Parker's fortress balance sheet provides strategic flexibility for M&A (Filtration Group) and positions the company to navigate economic cycles. ROE improvement pathway: (1) Margin expansion to 27% target, (2) Strategic use of leverage for accretive acquisitions, (3) Continued share repurchases as cash flow inflects."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Free Cash Flow Conversion:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker's 15.0% free cash flow margin ranks second among peers, above the 12.4% average and trailing only Honeywell (~15%). This demonstrates strong working capital management (80 days inventory, 51 days DSO) and disciplined CapEx (2% of sales). FY2029 target of 17% FCF margin would generate $3.3-3.5B annually, supporting $35B cumulative capital deployment. Eaton's lower FCF margin (~12%) reflects higher CapEx needs for electrical manufacturing expansion. Smaller peers Moog (8%) and Donaldson (13%) face working capital challenges from aerospace production ramps."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Growth Profile Comparison:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker's 4-6% organic growth CAGR target through FY2029 aligns with peer expectations. Eaton guides 6.5-8.5% driven by electrical infrastructure mega-trends (data centers, EVs, grid modernization). Honeywell targets 4-6% with aerospace recovery and automation strength. Emerson projects mid-single-digit growth in process automation. Parker's balanced portfolio provides resilience: aerospace tailwinds offset near-term industrial softness, with diversification across end markets (no customer >4% revenue) mitigating cyclical risk."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Valuation Context (As of December 2024):",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker trades at approximately 32-35x forward P/E, a premium to industrials average of 20-22x but in line with high-quality peers. Eaton trades at 30-32x on electrical infrastructure enthusiasm. Honeywell at 26-28x reflects portfolio complexity and planned spin-offs. Emerson at 24-26x reflects lower growth profile. Premium valuation justified by: (1) Best-in-class margins with visible expansion pathway, (2) Aerospace exposure (33% revenue) at inflection point, (3) Proven M&A execution and integration capabilities, (4) Strong FCF generation funding both growth and returns, and (5) Track record of meeting/exceeding targets. Risk to multiple: Industrial cycle downturn, Meggitt/Filtration integration stumbles, or aerospace production delays."
        )]
      }),

      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "Competitive Positioning Synthesis:",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker-Hannifin has transformed into a top-quartile diversified industrial through disciplined execution of The Win Strategy and strategic portfolio optimization. Operating margin leadership (24.9% vs. 18.3% peer avg) provides significant competitive advantage, enabling R&D investment, aftermarket expansion, and pricing flexibility. The company's systems integration capabilities (two-thirds of customers buy 4+ Parker technologies) create switching costs that pure-play competitors cannot match. Post-Meggitt, Parker has established critical mass in aerospace (27% revenue) while maintaining industrial leadership, positioning the company to capitalize on both secular growth trends simultaneously."
        )]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Key differentiators versus peers: (1) Broadest technology portfolio (hydraulics, pneumatics, electromechanical, filtration, materials, climate control), (2) Largest industrial distribution network (~17,100 partners), (3) Best-in-class operational system (Win Strategy) with proven margin expansion track record, (4) Balanced end-market exposure mitigating cyclical volatility, and (5) Strong balance sheet (2.0x leverage) enabling strategic M&A."
        )]
      }),
      new Paragraph({
        children: [new TextRun(
          "Primary competitive risks: Eaton's electrical infrastructure positioning could drive superior growth if mega-trends accelerate; Honeywell's avionics/software capabilities provide defensibility in aerospace; and Emerson's process automation leadership in energy transition applications. However, none of these competitors matches Parker's breadth, operational excellence, or margin profile, validating the company's best-in-class positioning within diversified industrials."
        )]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/6_Peer_Benchmarking.docx", buffer);
  console.log("Peer Benchmarking created successfully");
});
