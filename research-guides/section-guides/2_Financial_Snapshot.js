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
        children: [new TextRun("2. Financial Snapshot")]
      }),
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Data Source: ",
          bold: true
        }), new TextRun("Parker-Hannifin 10-K FY2024 (filed August 22, 2024), FY2024 Q4 earnings release, investor presentations")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Currency: ",
          bold: true
        }), new TextRun("All figures in USD millions unless otherwise noted")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun({
          text: "Reporting Period: ",
          bold: true
        }), new TextRun("Fiscal Year Ended June 30, 2024 (FY2024)")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("2.1 Income Statement Summary")]
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
                children: [new Paragraph({ children: [new TextRun({ text: "Net Sales", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$19,930")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$19,065")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+4.5%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Gross Profit")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$7,128")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$6,422")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+11.0%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Gross Profit Margin")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("35.8%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("33.7%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+210 bps")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Operating Income (Reported)")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$3,069")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$2,482")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+23.6%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Segment Operating Margin (Reported)", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "21.5%", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("18.7%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "+280 bps", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Adj. Segment Operating Margin", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "24.9%", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("22.9%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "+200 bps", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("EBITDA Margin (Reported)")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("25.2%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("23.0%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+220 bps")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Adj. EBITDA Margin")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("25.6%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("23.6%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+200 bps")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Net Income (Reported)")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$2,844")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$2,083")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+36.5%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Adjusted Net Income")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$3,320")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$2,809")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+18.2%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "EPS (Reported)", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$21.84", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$16.04")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "+36.2%", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Adjusted EPS", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$25.44", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$21.62")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "+17.7%", bold: true })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 180, after: 120 },
        children: [new TextRun({
          text: "Note: ",
          bold: true,
          italics: true
        }), new TextRun({
          text: "Adjusted figures exclude business realignment costs, acquisition integration expenses, and one-time items.",
          italics: true
        })]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("2.2 Cash Flow & Balance Sheet Metrics")]
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
                children: [new Paragraph({ children: [new TextRun({ text: "Cash from Operations", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$3,384", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$2,980")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "+13.6%", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Cash from Operations (% Sales)")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("17.0%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("15.6%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+140 bps")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Capital Expenditures")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$400")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$381")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+5.0%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Free Cash Flow", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$2,984", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$2,599")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "+14.8%", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Free Cash Flow (% Sales)")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("15.0%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("13.6%")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+140 bps")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Working Capital (Days)")] })]
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
                children: [new Paragraph({ children: [new TextRun("Days Sales Outstanding")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("51")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("51")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("Flat")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Days Inventory on Hand")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("80")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("85")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("-5 days")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Total Debt")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$10,215")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$12,609")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("-$2,394")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Net Debt to Adj. EBITDA", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "2.0x", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("2.8x")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "-0.8x", bold: true })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Shareholders' Equity")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$12,837")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$10,645")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+20.6%")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 3120, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Return on Equity (ROE)")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("23.9%*")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("21.0%*")] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 1870, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("+290 bps")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 180, after: 240 },
        children: [new TextRun({
          text: "*Calculated as Net Income divided by average Shareholders' Equity",
          italics: true,
          size: 20
        })]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("2.3 Key Performance Indicators & Ratios")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Five-Year Performance Trajectory (FY2019-FY2024):",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Revenue CAGR: +7% ($14.3B to $19.9B)")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Adjusted Segment Operating Margin: +630 bps expansion (18.6% to 24.9%)")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Adjusted EPS CAGR: +14% ($13.10 to $25.44)")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("• Free Cash Flow: Doubled from $1.5B to $3.0B")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Capital Deployment Priorities:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Dividends: 68 consecutive years of annual increases (top 5 in S&P 500)")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Share Repurchases: $200M in FY2024 to offset dilution")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Debt Reduction: $2.0B paid down in FY2024, achieving 2.0x leverage target")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("• Strategic Acquisitions: Disciplined approach focused on margin-accretive, technology-enhancing deals")]
      }),

      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "Analysis",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker's FY2024 financial performance demonstrates the successful execution of its transformation strategy. The 200-basis-point expansion in adjusted segment operating margin to a record 24.9% validates management's ability to drive operational excellence through The Win Strategy while integrating the largest acquisition in company history. Strong cash generation, with operating cash flow reaching 17.0% of sales, enabled aggressive debt paydown while maintaining capital investments and shareholder returns."
        )]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "The balance sheet is now in fortress position with net leverage at 2.0x, providing significant capacity for capital deployment. Working capital management remains disciplined with inventory days improving by five days year-over-year despite aerospace supply chain complexities. The company's 68-year dividend growth streak and top-quartile cash conversion (15% free cash flow margin) underscore financial resilience and shareholder-friendly capital allocation."
        )]
      }),
      new Paragraph({
        children: [new TextRun(
          "Looking ahead to FY2029 targets, Parker has established a clear roadmap to 27% segment operating margins and 17% free cash flow margins, which would generate approximately $35 billion in cumulative capital deployment capacity. The FY2024 results provide strong evidence that these ambitious targets are achievable through continued Win Strategy application, aerospace aftermarket leverage, and industrial market recovery."
        )]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/2_Financial_Snapshot.docx", buffer);
  console.log("Financial Snapshot created successfully");
});
