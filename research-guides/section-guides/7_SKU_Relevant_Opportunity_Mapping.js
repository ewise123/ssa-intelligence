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
        reference: "opportunity-bullets",
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
        children: [new TextRun("7. SKU-Relevant Opportunity Mapping")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 240 },
        children: [new TextRun(
          "This section maps Parker-Hannifin's core technology platforms and product SKUs to high-growth market opportunities, identifying where the company's existing capabilities align with secular demand drivers. Each opportunity is assessed on market size, growth trajectory, Parker's current positioning, competitive intensity, and strategic fit. The analysis focuses on opportunities where Parker can leverage existing technologies with minimal R&D investment or where strategic adjacencies justify capability development."
        )]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("7.1 Opportunity Assessment Framework")]
      }),

      new Table({
        columnWidths: [2200, 1800, 1600, 1600, 1800, 1360],
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
                  children: [new TextRun({ text: "Opportunity Area", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Market Size & Growth", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Parker Position", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Relevant SKUs", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Strategic Fit", bold: true, color: "FFFFFF", size: 18 })]
                })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "1F4E78", type: ShadingType.CLEAR },
                children: [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "Priority", bold: true, color: "FFFFFF", size: 18 })]
                })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Electric Aircraft Thermal Mgmt", bold: true, size: 18 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "$8B by 2030; 18% CAGR", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Strong incumbent", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Heat exchangers, cold plates, pumps", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Excellent", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "HIGH", bold: true, size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Data Center Liquid Cooling", size: 18 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "$12B by 2030; 25% CAGR", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Emerging player", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Quick disconnects, manifolds, coolant dist", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Very Strong", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "HIGH", bold: true, size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "EV Battery Thermal Systems", bold: true, size: 18 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "$18B by 2030; 22% CAGR", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Strong player", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Coolant loops, couplings, filtration", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Excellent", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "HIGH", bold: true, size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Hydrogen Infrastructure", size: 18 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "$25B by 2030; 30% CAGR", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Technology leader", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "HP valves, regulators, fittings, seals", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Excellent", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "HIGH", bold: true, size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Semiconductor Manuf. Equipment", bold: true, size: 18 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "$120B by 2030; 8% CAGR", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Established player", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Ultra-pure fittings, valves, motion", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Strong", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "HIGH", bold: true, size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Sustainable Aviation Fuel (SAF) Production", size: 18 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "$15B by 2030; 56% CAGR", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Process expertise", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Filtration, valves, instrumentation", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Very Strong", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MEDIUM", bold: true, size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Factory Automation & Robotics", bold: true, size: 18 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "$80B by 2030; 10% CAGR", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Strong incumbent", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Pneumatics, actuators, sensors", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Excellent", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MEDIUM", bold: true, size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Defense Unmanned Systems", size: 18 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "$35B by 2030; 12% CAGR", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Growing presence", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Flight controls, hydraulics, fuel", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Strong", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MEDIUM", bold: true, size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Life Sciences Process Equipment", bold: true, size: 18 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "$22B by 2030; 9% CAGR", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Via Filtration Group", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Sterile filtration, single-use", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Very Strong", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MEDIUM", bold: true, size: 17 })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Offshore Wind Energy", size: 18 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "$40B by 2030; 15% CAGR", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Niche player", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Hydraulics, pitch control, filtration", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ children: [new TextRun({ text: "Moderate", size: 17 })] })]
              }),
              new TableCell({
                borders: cellBorders,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "LOW", bold: true, size: 17 })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("7.2 High-Priority Opportunity Deep Dives")]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("7.2.1 Electric & Hybrid Aircraft Thermal Management")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Market Overview:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "More-electric aircraft architectures increasing electrical power generation from ~100kW (traditional) to 1MW+ (Boeing 787, Airbus A350) and targeting 2-5MW for next-generation single-aisle aircraft. Higher electrical loads generate significant heat requiring advanced thermal management. Market projected at $8B by 2030 (18% CAGR) driven by: (1) Commercial OEM production ramps (737 MAX, A320neo families contain 30-40% more electrical content than predecessors), (2) All-electric regional aircraft development (Eviation Alice, Heart Aerospace ES-30), (3) Urban air mobility/eVTOL certification (Joby Aviation, Archer, Volocopter), and (4) Defense electrification (F-35 Block 4 upgrades, next-gen fighter programs)."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Parker's Positioning & Relevant SKUs:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Liquid cooling systems: Plate-fin heat exchangers, cold plates, coolant pumps, and reservoir assemblies already certified on Boeing 787, A350, F-35")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Thermal interface materials: Gap fillers and thermal pads for power electronics (inverters, converters, motor controllers)")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Fluid systems: Quick disconnects, flexible hoses, and manifolds for coolant distribution—leveraging existing aerospace fluid handling expertise")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Environmental control: Cabin air conditioning packs adapted for battery/electronics cooling on hybrid-electric aircraft")]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Parker's Meggitt acquisition strengthened fire protection capabilities (critical for battery/electronics enclosures), while legacy hydraulics expertise translates to liquid cooling loop design. Content per aircraft increasing 1.5-2x on more-electric platforms versus traditional hydraulic-centric architectures."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Strategic Fit & Execution Pathway:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Excellent fit leveraging existing relationships with Boeing, Airbus, Lockheed Martin, and emerging OEMs. Certification expertise (DO-160, DO-178) provides 3-5 year competitive moat. Key initiatives: (1) Design-in partnerships with eVTOL manufacturers during aircraft development phase, (2) Cross-selling thermal management to existing hydraulics/fuel systems customers, (3) R&D investment in high-power-density heat exchangers for next-gen platforms, (4) Aftermarket positioning as thermal systems require periodic overhauls. Risk: Electrification pace slower than projected; hydraulics displacement exceeds thermal opportunity gains."
        )]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("7.2.2 Data Center Liquid Cooling Infrastructure")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Market Overview:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "AI workloads (ChatGPT, large language models, autonomous driving training) driving exponential compute density growth. NVIDIA H100/H200 GPUs consume 700W per chip with racks reaching 100kW+ (versus 5-10kW traditional IT racks), exceeding air cooling capabilities. Liquid cooling adoption accelerating: 15% of hyperscale data centers in 2024 to 50%+ by 2030. Total addressable market projected at $12B by 2030 (25% CAGR). Technologies include direct-to-chip cold plates, rear-door heat exchangers, and immersion cooling. Major deployments underway at Microsoft, Meta, Google, AWS."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Parker's Positioning & Relevant SKUs:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Quick disconnect couplings: Blind-mate, zero-spill designs enabling hot-swap of servers without downtime—Parker's CPC (Colder Products Company) subsidiary is market leader")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Coolant distribution units (CDUs): Pumps, manifolds, filters, and control valves managing facility-level cooling loops")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Cold plates & heat exchangers: Custom-designed for GPU thermal requirements; can leverage aerospace thermal management IP")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Flexible hosing & fittings: Routing coolant within tight server chassis constraints; adapting aerospace fluid handling tech")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Filtration: Preventing particulate contamination in closed-loop systems—critical for reliability")]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Emerging player status reflects recent focus versus specialized competitors (Boyd Corporation, Motivair), but Parker's breadth (couplings + heat exchangers + fluid handling + filtration) enables full-system solutions that competitors cannot match."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Strategic Fit & Execution Pathway:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Very strong fit with existing technology portfolio requiring minimal new capability development. Execution levers: (1) Leverage CPC's data center relationships (already supplies air cooling quick disconnects), (2) Partner with liquid cooling OEMs (Asetek, CoolIT) to become preferred components supplier, (3) Direct engagement with hyperscalers via key account management, (4) Adapt aerospace thermal designs for IT applications (significant engineering cost savings), (5) Aftermarket MRO contracts for coolant loop maintenance. Investment requirements modest ($50-100M over 3 years) with attractive ROIC given existing manufacturing footprint. Primary risk: Air cooling technology improvements (e.g., enhanced immersion oils) delaying liquid adoption curve."
        )]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("7.2.3 EV Battery Thermal Management Systems")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Market Overview:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Electric vehicle adoption reaching inflection point with 18% global market share in 2024 (up from 9% in 2021) and targeting 30-35% by 2030. Battery thermal management critical for safety (preventing thermal runaway), performance (optimizing charge/discharge efficiency), and longevity (maintaining capacity over 10+ year lifecycles). Systems evolve from passive air cooling (early Nissan Leaf) to liquid cooling (Tesla, GM Ultium, Ford Mach-E) to refrigerant-based cooling (BMW iX). Market size projected $18B by 2030 (22% CAGR). Beyond passenger vehicles, commercial trucks (Daimler eCascadia, Volvo VNR Electric), construction equipment (Caterpillar electric excavators), and marine propulsion adopting liquid cooling."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Parker's Positioning & Relevant SKUs:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Coolant loops & thermal plates: Aluminum cold plates integrated into battery modules; already supplying GM, Ford, and European OEMs")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Quick couplings: Enabling battery pack assembly/disassembly during manufacturing and service; zero-leak requirements")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Coolant pumps & valves: Managing flow rates and temperature zones across battery pack; leveraging automotive HVAC expertise")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Refrigerant components: Expansion valves, accumulators, and hoses if OEM adopts refrigerant-based systems (Parker LORD acquisition)")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Filtration: Preventing particulate contamination in coolant loops—extending system life")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("High-voltage connectors: Power distribution from battery to inverters (Parker Chomerics division); shielding to prevent EMI")]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Parker already recognized supplier but opportunity scaling rapidly. Off-highway electrification (construction, agriculture) provides adjacency where Parker has dominant hydraulics presence—thermal systems become bundled offering."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Strategic Fit & Execution Pathway:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Excellent strategic fit aligning with transportation electrification megatrend and leveraging thermal management core competency. Three-pronged approach: (1) Light-duty passenger vehicles: Tier 1 component supplier to OEMs, prioritizing long-term platform wins (8-10 year production lifecycles), (2) Commercial vehicles & off-highway: System integrator bundling thermal with hydraulic/pneumatic solutions, (3) Aftermarket: Replacement pumps, valves, and coolant filters as vehicles age. Competitive advantages include global manufacturing footprint (local-for-local production reduces logistics costs), materials science expertise (specialized elastomers for coolant compatibility), and existing OEM relationships. Primary challenges: Intense price competition from Asian suppliers; standardization pressures (OEMs pushing commodity thermal plates); Tesla vertical integration reducing outsourcing. Mitigation: Focus on performance-differentiated applications (high-voltage fast charging thermal load, commercial vehicle duty cycles, extreme climate operation)."
        )]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("7.2.4 Hydrogen Infrastructure & Fuel Cell Systems")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Market Overview:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Hydrogen emerging as decarbonization solution for hard-to-electrify sectors: long-haul trucking, aviation (Airbus ZEROe concept), maritime shipping, and industrial processes (steel, chemicals). Infrastructure buildout accelerating with $100B+ government incentives (U.S. Inflation Reduction Act, EU Green Deal). Applications span production (electrolysis plants), storage & transport (700-bar compressed, cryogenic liquid, ammonia carriers), refueling stations (automotive, aerospace), and end-use (fuel cells, combustion). Total hydrogen equipment market projected $25B by 2030 (30% CAGR). Key drivers: Heavy-duty trucks (Hyundai XCIENT, Nikola Tre), refueling infrastructure (Shell, Air Liquide), and aerospace auxiliary power units."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Parker's Positioning & Relevant SKUs:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("High-pressure valves & regulators: 350-bar and 700-bar systems for vehicle refueling; pressure reduction stages from storage to dispenser")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Tube fittings & instrumentation: Swagelok-style fittings rated for hydrogen service; preventing leaks critical given hydrogen's small molecule size")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Sealing technology: Specialized elastomers and O-rings resistant to hydrogen embrittlement (Parker Seals division)")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Quick disconnect couplings: Enabling safe hydrogen transfer during refueling operations (CPC division)")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Fuel cell components: Humidification systems, air delivery, coolant loops for PEMFC stacks (proton-exchange membrane fuel cells)")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Filtration: Removing contaminants from hydrogen gas streams—critical for fuel cell membrane longevity")]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Parker recognized technology leader with 20+ years hydrogen experience; early mover supplying NASA space shuttle program and industrial gas customers. Differentiation through materials science (hydrogen-compatible elastomers) and safety certification (ISO 19880, SAE J2601 standards)."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Strategic Fit & Execution Pathway:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Excellent fit as hydrogen infrastructure directly leverages Parker's core fluid handling competencies with premium pricing justified by safety criticality. Segmented approach: (1) Production: Supplying electrolysis plant OEMs (Nel Hydrogen, ITM Power) with instrumentation and fluid systems, (2) Refueling infrastructure: Partnering with station builders (Air Liquide, Linde) and dispenser manufacturers (Gilbarco Veeder-Root, Dover Fueling Solutions), (3) Vehicle integration: Tier 1 supplier to fuel cell OEMs (Ballard Power, Plug Power) and truck manufacturers (Daimler, Volvo), (4) Aerospace: Hydrogen-powered aircraft APUs and propulsion systems. Competitive positioning requires: Early design-in partnerships during technology development phase (10+ year design cycles), Standards leadership to establish Parker solutions as de facto specifications, Global service network for maintenance/replacement given 24/7 uptime requirements. Risks include: Technology uncertainty (battery-electric may dominate versus fuel cells in certain applications), Slow infrastructure rollout delaying demand, Commodity pricing pressure as market matures. However, Parker's incumbent position and safety-critical nature of applications provide strong competitive moat."
        )]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("7.2.5 Semiconductor Manufacturing Equipment")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Market Overview:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Global semiconductor manufacturing capacity expansion driven by geopolitical reshoring initiatives (U.S. CHIPS Act $52B, EU Chips Act $47B, Japan/Taiwan investments) and insatiable demand for logic (AI chips, CPUs, GPUs) and memory (data centers, smartphones). Wafer fabrication equipment (WFE) spending projected $120B by 2030 (8% CAGR) with concentration among ASML (lithography), Applied Materials, Lam Research, and Tokyo Electron. Each fab generation (7nm, 5nm, 3nm, 2nm nodes) requires more sophisticated process equipment with tighter contamination control and precision motion specifications."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Parker's Positioning & Relevant SKUs:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Ultra-high-purity (UHP) gas delivery: Fittings, valves, regulators, and flexible hoses for process gases (silane, ammonia, nitrogen trifluoride)—zero particle contamination")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Chemical handling systems: Wetted materials compatible with corrosive etchants and photoresists (hydrofluoric acid, sulfuric acid)")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Motion control: Linear actuators, air bearings, and precision positioners for wafer handling robots and lithography steppers—sub-micron accuracy")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Vacuum components: Seals, O-rings, and elastomers maintaining high-vacuum environments (10^-9 Torr) during deposition and etching")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Filtration: Point-of-use filters removing sub-micron particles from ultrapure water (18 megohm-cm resistivity)")]
      }),
      new Paragraph({
        numbering: { reference: "opportunity-bullets", level: 0 },
        children: [new TextRun("Thermal management: Cooling systems for plasma sources and RF generators—preventing equipment downtime")]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Established player with long-standing relationships with equipment OEMs. Material certifications (SEMI standards) and contamination control expertise create switching costs. Parker's Balston Filters and Hannifin Instrumentation divisions are market leaders."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Strategic Fit & Execution Pathway:",
          bold: true
        })]
      }),
      new Paragraph({
        children: [new TextRun(
          "Strong fit leveraging precision engineering and clean-room manufacturing capabilities. Opportunity scaling comes from: (1) Increased content per tool as process complexity grows (EUV lithography requires 3-5x more fluid/gas systems than DUV), (2) Fab expansions creating aftermarket consumables demand (filters, seals require periodic replacement), (3) Geographic diversification as fabs build in U.S./Europe (local sourcing preferences). Execution priorities: Maintain technology leadership in UHP fittings and vacuum sealing (R&D investment $10-20M annually), Capacity expansion in clean-room assembly facilities to support fab buildouts, Lifecycle services model providing predictive maintenance and rapid consumable delivery (24-hour AOG commitments). Competitive dynamics: Entegris and Swagelok are strong rivals in gas delivery; SMC and CKD dominate pneumatics. Parker's differentiation comes from system integration (gas delivery + motion + filtration bundled solutions) and global service network. Primary risk is cyclical semiconductor capital spending, though long-term secular growth remains intact."
        )]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/7_SKU_Relevant_Opportunity_Mapping.docx", buffer);
  console.log("SKU-Relevant Opportunity Mapping created successfully");
});
