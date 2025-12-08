const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, 
        HeadingLevel, BorderStyle, WidthType, ShadingType } = require('docx');

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
        children: [new TextRun("1. Executive Summary")]
      }),
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Company: ",
          bold: true
        }), new TextRun("Parker-Hannifin Corporation")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Report Date: ",
          bold: true
        }), new TextRun("December 5, 2024")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Geography Focus: ",
          bold: true
        }), new TextRun("Global (All Operations)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Confidence Level: ",
          bold: true
        }), new TextRun("HIGH - Multiple primary sources including 10-K filings, earnings transcripts, and investor presentations from FY2024")]
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "Company Overview",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker-Hannifin Corporation (NYSE: PH) is a Fortune 250 global leader in motion and control technologies. Founded in 1938 and headquartered in Cleveland, Ohio, Parker has transformed into a $19.9 billion revenue enterprise serving aerospace and defense, in-plant and industrial equipment, transportation, off-highway, energy, and HVAC and refrigeration markets. The company employs approximately 61,120 team members globally with operations in 43 countries across 335 manufacturing plants."
        )]
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "Strategic Position",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker's competitive advantage stems from its unique portfolio of interconnected technologies spanning hydraulics, pneumatics, electromechanical systems, filtration, fluid and gas handling, process control, engineered materials, and climate control. Approximately two-thirds of revenue comes from customers purchasing four or more Parker technologies, demonstrating deep systems integration. Following the transformative $8.3 billion acquisition of Meggitt plc in September 2022, aerospace and defense now represents 33% of revenue, positioning Parker as a significant player across nearly every leading aircraft platform."
        )]
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "FY2024 Financial Performance Highlights",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Revenue reached a record $19.9 billion, up 5% from $19.1 billion in FY2023")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Adjusted segment operating margin expanded 200 basis points to a record 24.9%")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Adjusted earnings per share increased 18% to a record $25.44")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Cash flow from operations grew 14% to a record $3.4 billion (17.0% of sales)")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Free cash flow reached $3.0 billion, doubling from FY2019")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("• Net debt to adjusted EBITDA improved to 2.0x target, with $2 billion in debt reduction")]
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "Segment Performance",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Diversified Industrial Segment (73% of revenue):",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Sales of $14.5 billion, down 1.7% organically due to industrial market softness")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Operating margin improved to 22.0% from 20.9%, driven by price realization and operational efficiencies")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("• North America businesses showed resilience with 22.3% margins; International businesses maintained 21.4% margins")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Aerospace Systems Segment (27% of revenue):",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Record sales of $5.5 billion, up 25.5% with 17% organic growth")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Operating margin expanded dramatically to 20.3% from 12.9%")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("• Strong performance across commercial aftermarket, OEM platforms, and defense programs")]
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "Strategic Secular Growth Drivers",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "1. Aerospace & Defense Expansion:",
          bold: true
        }), new TextRun(" Commercial air travel recovery to pre-COVID levels drives aircraft deliveries and aftermarket demand. Increased global defense spending supports long-term growth. Parker is positioned on nearly all major platforms with content valued at 1.5-2x for more-electric aircraft applications.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "2. Industrial Digitalization & CapEx Wave:",
          bold: true
        }), new TextRun(" Global investments in factory automation, semiconductor manufacturing, clean energy infrastructure, and supply chain near-shoring create sustained demand. Parker's technologies are critical for semiconductor fabrication, lithium extraction, 5G infrastructure, and data center cooling.")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "3. Clean Technology & Electrification:",
          bold: true
        }), new TextRun(" Two-thirds of Parker's product portfolio enables clean technology solutions. Electrification trends in transportation and off-highway equipment increase Parker's bill-of-materials by 1.5-2x versus traditional combustion engines. Strong positioning in hydrogen, alternative fuels, and battery systems.")]
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "The Win Strategy™ Business System",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker's operational excellence framework, The Win Strategy 3.0, drives continuous improvement through four goals: Engaged People, Customer Experience, Profitable Growth, and Financial Performance. Over 89% of team members participate in High Performance Teams (HPTs) that apply lean principles, Kaizen events, and problem-solving methodologies. This system has delivered 630 basis points of adjusted segment operating margin expansion over five years while maintaining a top-quartile safety record with a 45% reduction in recordable incident rates."
        )]
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "FY2029 Financial Targets (Announced May 2024)",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Organic sales growth: 4-6% CAGR")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Adjusted segment operating margin: 27% (+200 bps from previous target)")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Adjusted EBITDA margin: 28% (+300 bps from previous target)")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Free cash flow margin: 17% (+100 bps from previous target)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("• Adjusted EPS growth: 10%+ CAGR")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "These targets represent $35 billion in cumulative potential capital deployment through FY2029, enabling continued dividend growth, strategic acquisitions, and shareholder returns."
        )]
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "Key Investment Thesis",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker-Hannifin has transformed into a best-in-class industrial with a balanced, resilient portfolio weighted toward longer-cycle, higher-growth markets. The company's unique systems integration capabilities, proven operational excellence, and exposure to multiple secular growth trends position it for sustained margin expansion and cash generation. Management's track record of executing on ambitious targets, combined with disciplined capital deployment and a fortress balance sheet (2.0x leverage), provides confidence in achieving FY2029 objectives. The completion of Meggitt integration ahead of schedule demonstrates execution capabilities, while the aerospace aftermarket exposure provides a durable earnings stream with significant upside as commercial aviation continues recovery."
        )]
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "Key Risks",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Industrial market cyclicality and extended softness in short-cycle businesses")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Commercial aerospace supply chain disruptions impacting OEM production rates")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Raw material and freight cost inflation pressures on margins")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Foreign currency headwinds given 36% non-U.S. sales exposure")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Execution risks on achieving aggressive FY2029 margin targets")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("• Geopolitical tensions impacting China operations and global supply chains")]
      }),
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "Conclusion",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        children: [new TextRun(
          "Parker-Hannifin represents a compelling industrial growth story underpinned by portfolio transformation, operational excellence, and exposure to favorable secular trends. The FY2024 results validate the company's strategy, with record margins, cash generation, and successful Meggitt integration. As aerospace continues its multi-year recovery and industrial markets stabilize, Parker is well-positioned to deliver on its ambitious five-year targets while returning significant capital to shareholders."
        )]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/1_Executive_Summary.docx", buffer);
  console.log("Executive Summary created successfully");
});
