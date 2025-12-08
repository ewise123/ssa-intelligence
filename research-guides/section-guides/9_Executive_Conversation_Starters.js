const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

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
        reference: "conversation-bullets",
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
        children: [new TextRun("9. Executive Conversation Starters")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 240 },
        children: [new TextRun(
          "This section provides research-backed conversation topics designed for substantive engagement with Parker-Hannifin executives. Each theme combines strategic insight with tactical questioning to demonstrate industry knowledge, uncover proprietary perspectives, and build meaningful dialogue. Conversation starters are organized by executive function and topic area."
        )]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("9.1 Strategic & Portfolio Topics")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [new TextRun({
          text: "Theme: Filtration Group Integration & Portfolio Architecture",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "The $9.25B Filtration Group acquisition (announced November 2024) represents Parker's second-largest deal ever and creates one of the world's largest industrial filtration businesses. With 85% aftermarket revenue, the target aligns with Parker's strategic pivot toward recurring revenue streams. Integration complexity following the successful Meggitt execution (synergies exceeded $160M target) provides natural discussion point."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Your Meggitt integration delivered $160M synergies ahead of schedule. How are you applying those learnings to the Filtration Group playbook? Are there specific integration sequencing decisions—procurement, footprint, go-to-market—where you're accelerating versus the Meggitt timeline?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Filtration Group brings deep life sciences expertise, particularly in bioprocessing and single-use systems—areas where Parker historically had limited presence. How do you envision the commercial synergies? Will you cross-sell Filtration Group's sterile filtration into Parker's existing pharma accounts, or is this more about accessing new customer segments?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Post-Filtration Group, your portfolio will have aerospace at 33% revenue, filtration in high teens. How do you think about optimal portfolio balance? Are you comfortable with aerospace concentration, or would you look to rebalance through divestitures or further industrial M&A?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"The 85% aftermarket mix at Filtration Group is compelling. Beyond the obvious margin benefits, how does this change Parker's strategic positioning? Does it give you more confidence to take share in cyclical OEM markets knowing you'll capture the aftermarket tail?\"")]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Theme: Margin Expansion Pathway to 27% Target",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker raised FY2029 adjusted segment operating margin target to 27% (from 25% prior), implying 200 bps expansion from current 24.9%. The company has demonstrated consistent execution, delivering 630 bps expansion since FY2019 through Win Strategy, M&A integration, and mix shift. Understanding the bridge to 27% reveals management's conviction and execution priorities."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"You've guided to 27% segment operating margin by FY2029—best-in-class for diversified industrials. Can you walk through the bridge? How much comes from aerospace mix shift, how much from Win Strategy operational improvements, and how much from M&A margin accretion like Filtration Group?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Diversified Industrial currently runs 22% margins. What's the pathway to closing the gap with Aerospace Systems (20%+ margins)? Is it primarily about shifting mix toward higher-margin products like engineered materials and filtration, or are there step-function operational improvements available?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"You've achieved remarkable margin expansion despite industrial volume headwinds—200 bps in FY2024 on low-single-digit growth. How sustainable is this in a recovery scenario? What incremental margins should we expect when industrial volumes inflect?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Win Strategy 3.0 emphasizes High Performance Teams—now 89% participation with 6,000+ active teams. How do you quantify the margin contribution from HPTs? What's the incremental opportunity as you approach 100% participation?\"")]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Theme: Electrification—Threat or Opportunity?",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Common investor concern: electrification in aerospace (more-electric aircraft) and mobile equipment (EVs, electric construction equipment) will displace Parker's hydraulics business. However, Parker positions electrification as net positive, citing 1.5-2x content increase on electric platforms through thermal management, connectors, and fluid handling. Two-thirds of Parker's portfolio enables clean technology."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Let's pressure-test the electrification thesis. On more-electric aircraft like the 787 and A350, you're gaining thermal management content but losing some hydraulic actuation. Can you quantify the net content per aircraft? Is it truly 1.5-2x higher, and does that hold for next-gen single-aisle aircraft?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"In construction equipment electrification—Caterpillar, Komatsu launching electric excavators—how is your positioning different from automotive? In automotive EVs, you're primarily a Tier 2 component supplier. Can you be a Tier 1 system integrator in off-highway, bundling thermal with your dominant hydraulics presence?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Data center liquid cooling represents a greenfield opportunity as AI workloads drive 100kW+ racks. Your quick disconnect couplings (CPC division) are already specified. How big could this market be for Parker by 2030? Are you targeting $500M, $1B+ in annual revenue?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Hydrogen infrastructure—fuel cells, refueling stations, storage—leverages your high-pressure valves and sealing expertise. You've been supplying this market for 20+ years. What's the inflection point for meaningful revenue contribution? Is it 2027, 2030, or later?\"")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("9.2 Operational Excellence & Win Strategy")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [new TextRun({
          text: "Theme: Scaling Win Strategy Through Acquisitions",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Win Strategy—Parker's proprietary business system encompassing lean manufacturing, High Performance Teams, safety excellence, and customer experience—has driven 630 bps margin expansion since FY2019. A critical test: can this system be successfully transferred to acquired companies like Meggitt (9,000+ employees) and Filtration Group (7,500 employees) to deliver synergies?"
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Meggitt came from a private equity ownership structure with its own operational system. What surprised you most about deploying Win Strategy at Meggitt? Were there cultural resistance points, and how did you overcome them?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"You've structured Win Strategy around four goals: Engaged People, Customer Experience, Profitable Growth, and Financial Performance. In acquired businesses, which goal drives the fastest value creation? Is it immediately attacking cost structure (Financial Performance), or do you start with culture and engagement?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"High Performance Teams are now at 89% participation. What's the practical ceiling—can you reach 95-100%, or are there certain functions (R&D, sales) where HPTs are less applicable? And what's the marginal value of the last 10% participation?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Your safety performance—0.31 recordable incident rate, targeting zero by 2030—is industry-leading. How do you balance aggressive safety targets with production efficiency during aerospace ramp-ups? Have there been trade-offs, or is it purely complementary?\"")]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Theme: Simplification & Organizational Structure",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker operates a highly decentralized structure with historically 60+ operating groups, each with P&L responsibility. The company announced a simplification program consolidating groups within Diversified Industrial to reduce complexity, share best practices, and accelerate decision-making. This organizational redesign complements Win Strategy."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"You've initiated a simplification program consolidating operating groups. Can you quantify the savings opportunity? Beyond direct cost reduction, what are the intangible benefits—faster innovation cycles, better talent mobility, procurement leverage?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Parker's decentralization has been a competitive advantage—local entrepreneurship, customer proximity, rapid decision-making. As you simplify, how do you preserve those benefits while capturing scale advantages? What's the right balance?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Post-Meggitt and pending Filtration Group, you'll have integrated three large acquisitions in five years. Does this change your view on organizational structure? Are you moving toward a more centralized model to manage complexity?\"")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("9.3 Market & Competitive Dynamics")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [new TextRun({
          text: "Theme: Aerospace Production Rate Realities",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Boeing and Airbus face historic backlogs (15,000+ aircraft) but production constrained by supply chain issues, labor shortages, and quality problems. Boeing 737 MAX ramp delayed; Pratt & Whitney GTF engine reliability grounding hundreds of aircraft. Parker benefits from long production cycles but must manage working capital and capacity investments amid OEM uncertainty."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Boeing is targeting 38 737 MAX per month, but consistently missing rate plans due to Spirit AeroSystems quality issues and internal manufacturing challenges. How do you manage production planning and inventory when OEM schedules keep shifting? Are you building buffer stock or running just-in-time?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"The GTF engine situation—thousands of aircraft grounded or delayed for inspections—is creating near-term aftermarket opportunities but limiting OEM deliveries. On balance, is this net positive or negative for Parker's aerospace business through 2026?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Defense aerospace is seeing strong demand—F-35 ramp, NGAD next-gen fighter, CH-47 upgrades—but also faces supply chain constraints. Your defense backlog is strong. Can you actually ship to demand, or are you component-constrained on items like titanium forgings or specialized electronics?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Commercial aftermarket grew 26% in recent quarters—exceptionally strong. Flight hours are already at 102% of pre-COVID. What inning are we in for MRO recovery? Is there a multi-year tailwind from deferred maintenance, or should growth moderate toward low-double-digits?\"")]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Theme: Industrial Demand Inflection Timing",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Diversified Industrial organic sales declined low-single-digits in recent quarters due to distributor destocking, HVAC/R weakness, and cautious capex spending. Management guides to sequential improvement through FY2025 with H2 recovery. Order rates and leading indicators will signal timing."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Your Diversified Industrial orders—measured on 3-month rolling average—have shown sequential improvement in recent quarters. Are you seeing broad-based stabilization across end markets, or is it concentrated in specific verticals like energy or life sciences?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Industrial distributors went through aggressive inventory reductions in 2024. Do you have visibility into their current stock levels? Are they still under-stocked, neutral, or starting to rebuild?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"North America industrial showing weakness while Europe and Asia also soft—it's quite synchronized. What's the catalyst for recovery? Is it interest rate cuts stimulating capex, manufacturing PMI crossing 50, or something else?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Your aftermarket mix in Diversified Industrial—roughly 45% of revenue—provides resilience. Are you seeing any weakness in aftermarket, or is it holding up as expected? This would be an early warning signal if aftermarket softens.\"")]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Theme: Competitive Positioning in Key Markets",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker competes against diversified industrial giants (Eaton, Emerson, Honeywell), specialized players (Moog, Donaldson, Bosch Rexroth), and regional competitors (SMC in Asia, Festo in Europe). Post-Meggitt and Filtration Group, Parker's scale and breadth create differentiation, but maintaining technology leadership requires continuous R&D investment."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Eaton is trading at 30-32x P/E on electrical infrastructure enthusiasm—data centers, EVs, grid modernization. Their growth algorithm looks compelling. How do you differentiate Parker's equity story? Is it the superior margin profile, the aerospace exposure, or the combination?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"In filtration, you're now competing head-to-head with Donaldson—a pure-play with 16.5% operating margins and strong ROIC. Post-Filtration Group, will Parker be the scale leader with 20%+ margins? What's the competitive moat—proprietary media, brand equity, distribution?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Asian competitors like SMC (pneumatics) and CKD are gaining share in North America through aggressive pricing. Are you losing share in commodity products, or are you successfully moving upmarket toward higher-value IoT-enabled products and custom solutions?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Two-thirds of your customers buy 4+ Parker technologies. This systems integration advantage creates switching costs. Can you quantify the economic value? How much pricing power does it provide versus single-product competitors?\"")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("9.4 Capital Allocation & Financial Strategy")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [new TextRun({
          text: "Theme: $35 Billion Capital Deployment Capacity",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Management projects $35 billion cumulative capital deployment capacity through FY2029 based on 17% free cash flow margin target (~$3.3-3.5B annually). With Filtration Group consuming $9.25B, Parker still has substantial capacity for M&A, share repurchases, and dividend growth. Capital allocation decisions reveal management priorities and shareholder return philosophy."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"You've deployed $9.25B on Filtration Group from your $35B five-year capacity. Should we expect another large acquisition—$5-10B range—or will the focus shift to bolt-on deals and share repurchases? How are you thinking about the remaining $25B+?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Your M&A criteria emphasize accretive to growth, margins, cash flow, and EPS. How do you weigh these factors? If you found a target that's highly accretive to growth but dilutive to margins, would you pass? What's the hierarchy?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Share repurchases have been modest—$200M in FY2024. Post-Filtration Group close and deleveraging, could buybacks accelerate meaningfully? You're trading at 32-35x forward P/E. Is that valuation conducive to aggressive repurchases, or would you prioritize M&A?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Sixty-eight consecutive years of dividend increases—remarkable capital discipline. As you evaluate M&A like Filtration Group, does the dividend streak influence your leverage appetite? Would you ever pause dividend growth to fund a transformational acquisition?\"")]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Theme: Balance Sheet Management & Leverage Strategy",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker reduced net debt by $3.4 billion since Meggitt close, achieving 2.0x net debt/EBITDA target (from 3.8x at close). Filtration Group will be financed with new debt, temporarily increasing leverage. Management's disciplined deleveraging track record provides credibility, but investors will monitor credit metrics and ratings."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Filtration Group will add ~$9B debt to the balance sheet. What's your target leverage post-close—2.5x, 3.0x? And what's your deleveraging timeline—will you prioritize debt paydown over share repurchases like you did post-Meggitt?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Your credit rating—currently A-/A3—is important for aerospace business where long-term supplier stability matters to OEMs. Would you defend the A rating by constraining leverage, or are you comfortable operating at BBB+ if it enables value-creating M&A?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Free cash flow conversion has been exceptional—17% of sales in FY2024. As you layer on Filtration Group with its 85% aftermarket mix, should FCF conversion improve further? Is 18-19% achievable, or are there offsetting factors like aerospace working capital?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Working capital—particularly inventory—improved significantly: 80 days from 85 days. Can you go lower? Semiconductor companies run 60-70 days; automotive Tier 1s run 40-50 days. What's realistic for a diversified industrial with aerospace exposure?\"")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("9.5 Leadership & Culture")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [new TextRun({
          text: "Theme: Leadership Transition & Succession Planning",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Jenny Parmentier became CEO in January 2023 and added Chairman role in January 2024, succeeding Tom Williams. Internal promotion from COO ensured continuity. First female CEO in Parker's 107-year history. Andy Ross elevated to President & COO. Leadership team depth and succession planning critical for $100B+ market cap company executing complex integrations."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"As CEO for nearly two years and now Chairman, what surprised you most about the role? What aspects of Parker's culture or operations did you want to change, and what did you deliberately preserve from Tom Williams' tenure?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"You're the first woman CEO of Parker—a significant milestone. As you think about talent development and succession planning, how are you ensuring diverse candidate pipelines for senior leadership? What specific initiatives have you implemented?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Andy Ross as President & COO oversees both business segments. With Meggitt integration complete and Filtration Group pending, are you evaluating organizational changes? Could the segments be split into three (Aerospace, Industrial, Filtration) with dedicated segment presidents?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Parker has a strong culture of internal promotion—you, Andy, and most executives spent careers at Parker. How do you balance this with bringing in external perspectives, particularly in emerging areas like digital/IoT, sustainability, or advanced manufacturing?\"")]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Theme: Talent & Workforce in Tight Labor Markets",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Aerospace & defense industry attrition running 13% versus 3.8% U.S. average. Manufacturing labor shortages persist. Parker employs 61,120 globally with 335 plants. Win Strategy engagement (73% score, 91% response rate) helps retention, but wage inflation and skills gaps remain challenges."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Aerospace industry attrition is 13%—more than triple the national average. What's Parker's attrition rate, and how are you managing retention in hot labor markets? Are signing bonuses, retention bonuses, and wage escalators becoming necessary?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Manufacturing skills gap—particularly for CNC machinists, electronics technicians, quality inspectors—is acute in aerospace. Are you investing in training academies or partnerships with community colleges? Or are you automating to reduce headcount dependency?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Seventy-three percent engagement score is solid, but what about the 27% not fully engaged? Have you segmented the data—are they concentrated in certain geographies, tenure bands, or functions? What's the action plan for closing the gap?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"As you acquire companies like Filtration Group, how do you integrate 7,500 new employees into Parker's culture? What's the timeline for getting them Win Strategy trained, up to Parker safety standards, and contributing to HPTs?\"")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("9.6 Emerging Topics & Forward-Looking Themes")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [new TextRun({
          text: "Theme: Artificial Intelligence & Digital Transformation",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Industrial companies increasingly deploying AI for predictive maintenance, supply chain optimization, and engineering design. Parker's IoT-enabled products (sensors in hydraulics, pneumatics) generate data for analytics. However, capital-intensive businesses like Parker often lag pure software companies in AI adoption."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Honeywell talks about 'connected products' and 'software-driven outcomes.' Emerson emphasizes digital twin technology. What's Parker's digital strategy? Are you embedding IoT sensors and offering predictive maintenance services, or focusing on the hardware?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Internally, how are you deploying AI? Are you using it for engineering design optimization, supply chain forecasting, or quality inspection? Can you quantify productivity gains or cost savings?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Data center liquid cooling—driven by AI compute demands—is a greenfield opportunity for Parker. Beyond the hardware (cold plates, couplings, manifolds), could you offer thermal management-as-a-service, using AI to optimize cooling efficiency and PUE?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Generative AI for engineering design—using AI to optimize component geometry for weight reduction, flow efficiency, or material usage. Are you experimenting with this? Could it accelerate new product introduction cycles?\"")]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Theme: Geopolitical Risk & Supply Chain Resilience",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "U.S.-China tensions, Ukraine conflict, semiconductor supply constraints, and near-shoring mandates (CHIPS Act, Inflation Reduction Act) reshape global supply chains. Parker's 335 plants across 43 countries provide geographic diversification but also complexity. Titanium sourcing from Russia creates aerospace vulnerability."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Titanium supply for aerospace—historically sourced from Russia—has been disrupted. Have you fully de-risked the supply chain? Are you paying premiums for U.S. or allied-source material, and how much is it impacting costs?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"CHIPS Act incentivizes semiconductor manufacturing in the U.S.—$52B investment. You supply ultra-high-purity fittings and motion control to fab equipment OEMs. Are you benefiting from these fab buildouts? Any supply agreements with Intel, TSMC Arizona, Samsung Texas?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"China represents X% of Parker's revenue. As tensions escalate and reshoring accelerates, how are you positioning? Are you gaining business from European/American customers diversifying away from Chinese suppliers, or are you losing Chinese domestic market share to local competitors?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Your local-for-local manufacturing strategy—producing close to end markets—provides resilience. But it also means higher costs versus centralized mega-factories. Can you quantify the cost penalty? Is it 5-10% higher COGS? And do customers value resilience enough to pay for it?\"")]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Theme: Sustainability & ESG Performance",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Context:",
          italics: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker committed to carbon-neutral operations by 2040. Two-thirds of products enable clean technology. Investors increasingly evaluate ESG metrics. However, sustainability investments compete with shareholder returns, creating tension. Parker must articulate how sustainability creates value, not just costs."
        )]
      }),
      new Paragraph({
        spacing: { before: 80, after: 100 },
        children: [new TextRun({
          text: "Conversation Starters:",
          italics: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Carbon neutrality by 2040 for Scope 1 & 2 emissions is ambitious. What's the investment required? Are we talking $50M, $100M, $500M+ in capex for electrification, renewable energy, and efficiency? How does this impact your 27% margin target?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Two-thirds of your products enable clean tech—EVs, more-electric aircraft, hydrogen infrastructure, sustainable aviation fuel production. Can you quantify 'green revenue'? And are customers willing to pay premiums for certified sustainable products?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"European regulations—CSRD, taxonomy, supply chain due diligence—are more stringent than U.S. How are you managing compliance? Is this creating competitive advantage versus smaller suppliers who can't afford compliance costs?\"")]
      }),
      new Paragraph({
        numbering: { reference: "conversation-bullets", level: 0 },
        children: [new TextRun("\"Sustainable aviation fuel production requires specialized filtration and fluid handling—Parker's sweet spot. Are you partnering with SAF producers (Neste, World Energy, Gevo) to become the preferred equipment supplier? This could be a $500M+ market by 2030.\"")]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/9_Executive_Conversation_Starters.docx", buffer);
  console.log("Executive Conversation Starters created successfully");
});
