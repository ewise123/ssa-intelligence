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
        children: [new TextRun("3. Company Overview")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.1 Company Profile")]
      }),

      new Table({
        columnWidths: [2800, 6560],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Legal Name", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 6560, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Parker-Hannifin Corporation")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Founded", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 6560, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("March 13, 1917 (as Parker Appliance Company)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Founder", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 6560, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Arthur LaRue Parker")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Headquarters", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 6560, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("6035 Parkland Boulevard, Cleveland, Ohio 44124")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Stock Exchange", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 6560, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("NYSE: PH (listed since December 9, 1964)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "CEO", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 6560, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Jennifer A. Parmentier (Chairman & CEO since January 2023)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Employees", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 6560, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Approximately 61,120 globally (as of June 30, 2024)")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Global Footprint", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 6560, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("43 countries, 335 manufacturing plants, ~17,100 distributors")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "FY2024 Revenue", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 6560, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("$19.9 billion")] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2800, type: WidthType.DXA },
                shading: { fill: "E7E6E6", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Fortune Ranking", bold: true })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 6560, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Fortune 250 (Ranked #216 in 2024)")] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.2 Historical Evolution")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Founding Era (1917-1945): From Pneumatic Brakes to Aerospace Pioneer",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Arthur LaRue Parker, a Case Institute of Technology electrical engineering graduate, founded Parker Appliance Company on March 13, 1917, in a modest loft on Cleveland's West Side with partner Carl Klamm. The initial venture focused on pneumatic brake boosters for trucks and buses. A dramatic setback occurred in 1919 when Parker's promotional truck slid off a Pennsylvania cliff, destroying the company's entire inventory and forcing closure. Undeterred, Parker worked as an engineer at the Nickel Plate Railroad, saving capital to restart the business in 1924 with flared-tube fittings for hydraulic systems."
        )]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "By 1927, Parker had expanded into aviation components, capitalizing on the growing aerospace industry. The company achieved $2 million in sales by 1934 despite the Great Depression. In 1935, Parker acquired the 450,000-square-foot building at 17325 Euclid Avenue from the bankrupt Hupp Motor Car Corporation, establishing a permanent Cleveland manufacturing base. A prescient 1938 tour of German aircraft factories convinced Arthur and Helen Parker that war was imminent, prompting strategic licensing of military aircraft component patents."
        )]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun(
          "World War II transformed Parker into a critical defense supplier. By 1941, Parker held patents setting industry standards for hydraulic tube couplings, fuel system valves, and pumps used across military aircraft. Employment surged to 5,000 workers by 1943. Arthur Parker's death in 1945, combined with the sudden end of wartime demand, brought the company to the brink of bankruptcy."
        )]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Helen Parker's Turnaround & Hannifin Merger (1945-1970)",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Rather than liquidate, Helen Parker invested her husband's $1 million life insurance proceeds into the company and recruited professional management to pivot back to civilian markets. This bold decision proved transformational. Under new leadership, Parker focused on product innovation, market diversification, and strategic acquisitions of fluid power businesses. Sales reached $12.2 million by 1951."
        )]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "The defining acquisition came in 1957 when Parker purchased Hannifin Corporation of Illinois, a leading manufacturer of hydraulic cylinders, valves, and presses founded by Arthur Hannifin in 1917. This merger created Parker-Hannifin Corporation and accelerated the company's evolution into a comprehensive fluid power systems provider. The company went public on December 9, 1964, listing on the New York Stock Exchange with 4,400 employees."
        )]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun(
          "International expansion began in earnest during the 1960s with acquisitions in Canada, Italy, France, and South Africa. The standardized component strategy enabled global scalability. Sales reached $152 million by 1967. In 1968, Patrick Parker (Arthur's son) succeeded Robert Cornell as president. Parker components were integral to NASA's 1969 moon landing, cementing aerospace credentials."
        )]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Diversification & Global Expansion (1970-2000)",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "The 1970-1971 recession prompted strategic diversification beyond hydraulics. Parker implemented cycle forecasting methodologies to anticipate economic downturns and adjust operations accordingly. The company entered refrigeration and filtration markets while expanding its automotive aftermarket presence through acquisitions like Plews Manufacturing (quick-disconnect couplings), Robert Company (windshield wipers), and EIS Automotive."
        )]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "The 1980s recession tested Parker's resilience, but portfolio diversification mitigated impacts. By 1988, the company's 70th anniversary, sales exceeded $2 billion with over 100 acquisitions completed. The 1990s accelerated globalization: Asia Pacific Group headquarters opened in Hong Kong, manufacturing facilities launched in Shanghai, and the first ParkerStore retail location opened in Cleveland in 1993."
        )]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun(
          "Parker achieved record FY1995 performance with $3.21 billion in sales and $218.2 million net income. The 1996 VOAC Hydraulics acquisition strengthened mobile equipment capabilities. In 1997, Parker moved to its current headquarters at 6035 Parkland Boulevard in Mayfield Heights. Sales reached $5 billion by 1999. The 2000 acquisition of Commercial Intertech Corporation ($366 million plus $107 million debt assumption) significantly expanded filtration and fluid power offerings."
        )]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Win Strategy Era & Portfolio Transformation (2000-Present)",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Don Washkewicz became CEO in 2001 and introduced lean principles that reduced quote times by 60% and accelerated product development. The Win Strategy business system, first introduced in the early 2000s, became the foundation for operational excellence. Strategic acquisitions continued: CLARCOR ($4.3 billion, 2017) added premier filtration capabilities, and LORD Corporation ($3.7 billion, 2019) brought advanced engineered materials and aerospace technologies."
        )]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Thomas Williams served as CEO from 2015-2022, driving aggressive portfolio reshaping and margin expansion. Lee Banks joined as President and COO in 2015, co-creating an updated Win Strategy that accelerated transformation. Jenny Parmentier became COO in 2021, CEO in January 2023, and Chairman in January 2024, becoming the first woman to lead Parker-Hannifin."
        )]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "The transformative Meggitt plc acquisition closed September 12, 2022, for $8.3 billion (£6.3 billion), marking Parker's largest deal. Meggitt brought complementary aerospace systems capabilities, doubling aerospace segment size and establishing Parker on nearly every major aircraft platform. Integration completed ahead of schedule by FY2024. In May 2022, Parker divested the aircraft wheel and brake business to Kaman Corporation for $440 million, focusing the portfolio on core motion and control technologies."
        )]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun(
          "In November 2024, Parker announced the $9.25 billion acquisition of Filtration Group Corporation, creating one of the world's largest industrial filtration businesses. This strategic move further strengthens Parker's position in high-growth filtration markets serving life sciences, semiconductor manufacturing, and clean energy applications."
        )]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.3 Business Model & Value Proposition")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Core Technologies Portfolio:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Hydraulics: Pumps, motors, valves, cylinders, accumulators, and integrated systems")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Pneumatics: Air preparation, valves, actuators, and motion control")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Electromechanical: Drives, controllers, actuators, and motion systems")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Filtration: Engine, industrial, aerospace, and process filtration solutions")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Fluid & Gas Handling: Fittings, hoses, valves, regulators, and connectors")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Process Control: Instrumentation, sensors, diagnostics, and control systems")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Engineered Materials: Seals, O-rings, vibration control, adhesives, coatings")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("• Climate Control: HVAC/R controls, refrigeration components, thermal management")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Systems Integration Advantage:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker's competitive moat derives from its ability to integrate multiple technologies into complete motion and control systems. Approximately two-thirds of revenue comes from customers purchasing four or more Parker technologies, demonstrating deep systems-level integration that competitors cannot easily replicate. This interconnected approach reduces customer total cost of ownership through optimized system performance, single-source supply chain simplification, and comprehensive aftermarket support."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Revenue Model:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• OEM New Equipment: ~55% of revenue from components and systems for new machinery and aircraft")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Aftermarket/MRO: ~45% of revenue from replacement parts, maintenance, and repairs")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("• Aerospace aftermarket provides particularly high-margin, multi-decade revenue streams due to installed base and airworthiness requirements")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Go-to-Market Strategy:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Direct Sales: Field sales engineers work with OEMs on design-in opportunities and specifications")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Distribution Network: ~17,100 independent distributors provide local presence and aftermarket reach")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• ParkerStores: Company-owned retail locations offer immediate access to products and application expertise")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("• Digital Platforms: E-commerce, configurators, and digital catalogs enhance customer experience")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.4 Market Verticals")]
      }),

      new Table({
        columnWidths: [2340, 2340, 2340, 2340],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Market Vertical", bold: true, color: "FFFFFF", size: 20 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "% Revenue", bold: true, color: "FFFFFF", size: 20 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Growth Drivers", bold: true, color: "FFFFFF", size: 20 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Key Products", bold: true, color: "FFFFFF", size: 20 })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Aerospace & Defense", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "33%", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Commercial aviation recovery, defense spending, aftermarket MRO", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Flight controls, hydraulics, fuel systems, bleed air valves, wheels & brakes", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "In-Plant & Industrial Equipment", bold: true, size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "20%", size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Factory automation, semiconductor manufacturing, warehouse logistics", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Pneumatics, filtration, motion control, process instrumentation", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Transportation", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "15%", size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Electrification, emissions standards, autonomous vehicles", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Filtration, thermal management, battery cooling, hydraulic brakes", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Off-Highway", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "15%", size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Construction activity, mining demand, agricultural equipment electrification", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Hydraulic systems, electrohydraulic controls, filtration, seals", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Energy", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8%", size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Renewable energy, hydrogen infrastructure, oil & gas efficiency", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "High-pressure valves, instrumentation, hydrogen handling, gas filtration", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "HVAC/R", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4%", size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Energy efficiency standards, refrigerant transitions, cold chain growth", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Refrigeration controls, expansion valves, thermal management systems", size: 19 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Other", bold: true, size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5%", size: 20 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Life sciences, semiconductor, water treatment, marine", size: 19 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                width: { size: 2340, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Process filtration, precision instrumentation, fluid handling", size: 19 })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.5 Organizational Structure & Culture")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Decentralized Operating Model:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker operates through a decentralized divisional structure that empowers local decision-making while maintaining corporate oversight of strategy, capital allocation, and financial controls. This model enables divisions to maintain close customer relationships, respond quickly to market dynamics, and foster entrepreneurial cultures. Each division operates as a business unit with P&L responsibility, measured on sales growth, operating margins, cash flow, and customer satisfaction metrics."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Executive Leadership (as of FY2024):",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Jennifer A. Parmentier: Chairman & CEO (first woman in role; joined 2012, CEO since 2023)")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Andrew D. Ross: President & COO (joined 2012, elevated 2023)")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Todd M. Leombruno: Executive VP & CFO (joined 2012, CFO since 2021)")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("• Mark J. Hart: Executive VP – Human Resources & External Affairs")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "The Win Strategy™ 3.0:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker's proprietary business system drives alignment across 60,000+ team members through four overarching goals: (1) Engaged People, (2) Customer Experience, (3) Profitable Growth, and (4) Financial Performance. Supported by shared values of Winning Culture, Passionate People, Valued Customers, and Engaged Leadership, The Win Strategy provides a comprehensive toolkit including lean manufacturing principles, High Performance Teams (HPTs), Kaizen events, and cycle forecasting methodologies."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Safety & Engagement Excellence:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Recordable incident rate of 0.31 per 100 employees (FY2024), a 45% reduction over five years")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Top quartile safety performance among industrial peers")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Goal: Zero recordable incidents by 2030")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• 89% of team members participate in High Performance Teams")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• 73% overall engagement score with 91% response rate (FY2024 survey)")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [new TextRun("• Over 6,000 active HPTs globally driving continuous improvement")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "Sustainability & ESG Commitments:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Carbon neutrality target for own operations by 2040")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Two-thirds of product portfolio enables clean technology solutions")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• Diversity, Equity & Inclusion initiatives including Business Resource Groups")]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [new TextRun("• 68 consecutive years of annual dividend increases (top 5 in S&P 500)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun("• Purpose: Enabling Engineering Breakthroughs that Lead to a Better Tomorrow")]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/3_Company_Overview.docx", buffer);
  console.log("Company Overview created successfully");
});
