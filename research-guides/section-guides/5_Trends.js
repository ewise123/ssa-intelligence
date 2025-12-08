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
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "trend-bullets",
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
        children: [new TextRun("5. Trends")]
      }),
      new Paragraph({
        spacing: { before: 120, after: 240 },
        children: [new TextRun(
          "This section identifies and scores key trends affecting Parker-Hannifin across multiple horizons. Each trend is evaluated on direction (Positive/Negative/Neutral) and impact score (1-10 scale) based on magnitude, financial implications, and strategic significance. Scores of 1-3 indicate minor operational adjustments, 4-6 represent moderate strategic attention, 7-8 signify major business implications, and 9-10 denote transformational or existential impacts."
        )]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.1 Aggregate Trend Assessment")]
      }),
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun(
          "Parker-Hannifin operates at the intersection of multiple powerful secular trends that collectively position the company for sustained outperformance. The aerospace recovery, industrial digitalization wave, and clean technology transition create a favorable tailwind environment. However, near-term industrial cyclicality, supply chain fragility, and geopolitical tensions introduce execution risks. The aggregate outlook remains constructive with management demonstrating strong operational discipline through The Win Strategy to navigate headwinds while capitalizing on structural growth drivers."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [new TextRun({
          text: "Overall Trend Score: 7.5/10 (Positive)",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "The high score reflects multiple high-impact positive trends (aerospace recovery, electrification, digitalization) that outweigh near-term industrial headwinds. Parker's balanced portfolio, operational excellence, and strong balance sheet position it to navigate volatility while capturing long-term growth."
        )]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun({
          text: "Key Aggregate Observations:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun("Aerospace & Defense: Strongest tailwind with multi-year visibility (commercial aviation at 102% of pre-COVID; defense spending +5-7% CAGR)")]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun("Industrial Markets: Near-term softness masking long-term digitalization and capex investment waves")]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun("Electrification: Net positive despite hydraulics displacement concerns; Parker content increases 1.5-2x on electrified platforms")]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun("Margin Trajectory: Win Strategy driving 50-100 bps annual expansion toward 27% FY2029 target")]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun("M&A Pipeline: Filtration Group acquisition ($9.25B) signals continued portfolio optimization")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.2 Macro Trends (Industry & Economy-Wide)")]
      }),
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun(
          "These broad-based economic and industry-wide trends shape the overall operating environment for industrial and aerospace companies. Impact extends across multiple sectors and geographies with multi-year to multi-decade time horizons."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Commercial Aerospace Recovery & Long-Term Growth",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 8/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Global air travel has fully recovered to pre-pandemic levels with revenue passenger kilometers reaching 102% of 2019 levels in most regions. Asia-Pacific lags but shows accelerating recovery. Airbus and Boeing face historic backlogs exceeding 15,000 aircraft (9+ years of production), driving sustained OEM demand. Narrowbody production (737 MAX, A320neo family) ramping with Boeing targeting 38 units/month by late 2024 and Airbus reaching 60+/month. Wide-body recovery underway as long-haul international travel normalizes. Commercial aftermarket strengthening as flight hours grow and deferred maintenance normalizes, providing high-margin recurring revenue streams. Industry forecasts project 40,000+ new aircraft deliveries over next 20 years valued at $3.9 trillion. Parker positioned on virtually all major platforms with content expanding on more-electric architectures."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Defense Spending Increases & Geopolitical Tensions",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 7/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Global defense budgets rising with U.S. DoD spending +5% in FY2024 budget request focused on munitions, next-gen aircraft (NGAD program), and hypersonics. NATO allies increasing spending toward 2% GDP targets following Ukraine conflict. Asia-Pacific defense modernization accelerating (China, India, Japan, South Korea) with focus on advanced capabilities. Defense priorities include F-35 production ramp (156 units/year target), CH-47 Chinook upgrades, unmanned systems proliferation, and readiness/maintenance funding. Parker benefits from fluid power, actuation, and thermal management content across fixed-wing, rotary, and UAV platforms. Defense aftermarket growing as aging fleets require increased maintenance."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Industrial Digitalization & Industry 4.0 Capex Wave",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 7/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Manufacturing sector undergoing digital transformation with investments in automation, advanced robotics, IoT sensors, and AI-driven predictive maintenance. Global smart manufacturing market growing at 12-15% CAGR through 2030. Factory automation demand driven by labor shortages ($115k average A&D salary creates pressure), reshoring/nearshoring of supply chains, and productivity imperatives. Semiconductor manufacturing expansion (CHIPS Act: $52B U.S. investment) requires precision motion control and ultra-high-purity fluid handling—Parker strengths. Data center buildout for AI/cloud computing demands thermal management and liquid cooling solutions. Parker's connected products strategy (IoT-enabled hydraulics, pneumatics with embedded sensors) positions company to capture value from digital services and lifecycle optimization."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Electrification Across Transportation & Mobile Equipment",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 7/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Electric vehicle adoption accelerating with EVs representing 18% of global auto sales in 2024 (up from 9% in 2021). Battery-electric and hybrid powertrains increase Parker content by 1.5-2x versus combustion engines through thermal management (battery cooling), high-voltage connectors, fluid handling, and electromechanical actuation. Off-highway electrification beginning with construction equipment manufacturers (Caterpillar, Komatsu, Volvo CE) launching electric excavators and loaders. More-electric aircraft architecture reducing engine bleed air extraction, increasing electrical power generation, and requiring advanced thermal management—all Parker opportunities. Two-thirds of Parker's product portfolio enables clean technology solutions, positioning company favorably for carbon reduction mandates. Hydrogen infrastructure buildout requires high-pressure valves, regulators, and specialized materials—Parker capabilities."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Supply Chain Disruption & Reshoring Pressures",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Neutral to Negative", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 6/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Aerospace supply chains remain constrained with material shortages (titanium from Russia, aluminum forgings), labor gaps (13% attrition vs 3.8% U.S. average), and capacity limitations preventing OEMs from meeting production targets. Industrial supply chains recovering but vulnerable to geopolitical tensions (China-U.S. relations), pandemic disruptions, and Ukraine conflict impacts. Reshoring/nearshoring trends increase manufacturing costs but reduce lead times and geopolitical risk. Raw material inflation moderating from 2022-2023 peaks but remains elevated versus pre-pandemic baselines. Parker's 335 manufacturing plants across 43 countries provide resilience through local-for-local production but require significant working capital for inventory buffers."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Sustainability Mandates & ESG Pressures",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 6/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Regulatory pressure increasing with EU mandating sustainable aviation fuel (SAF) usage reaching 2% by 2025 and 63% by 2050. U.S. Inflation Reduction Act providing $369B for clean energy incentives. Corporate sustainability commitments driving OEM requirements for suppliers; Parker committed to carbon-neutral operations by 2040. Two-thirds of Parker products enable clean technology applications, providing competitive advantage in sustainability-focused procurement. However, meeting targets requires $150B+ annual industry investment in SAF production, electric aircraft development, and green manufacturing. Compliance costs and certification burdens increase, particularly for smaller suppliers."
        )]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.3 Micro/Industry Trends")]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Aerospace OEM Production Rate Challenges",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Neutral", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 6/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Boeing 737 MAX production recovery slower than planned due to quality issues, regulatory scrutiny, and supply chain constraints. Pratt & Whitney GTF engine reliability problems grounding hundreds of A320neo aircraft through 2026, creating aftermarket opportunities but limiting OEM deliveries. Spirit AeroSystems quality lapses forcing Boeing re-inspections. Positive: Longer backlogs extend revenue visibility; aftermarket content increases as aircraft stay in service longer. Negative: Revenue timing delays; Parker must carefully manage working capital and production schedules."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Industrial Market Destocking & Short-Cycle Weakness",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Negative (Near-term)", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 5/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Distributors and end users reducing inventory levels following 2022-2023 buildup. Manufacturing PMI hovering near 50 (contraction/expansion threshold) in U.S. and Europe. HVAC/R, automotive, and general industrial machinery showing weakness. Expected to normalize in 2H FY2025 as inventory digestion completes. Parker's diversification across end markets (no customer >4% revenue) and strong aftermarket mix (45% revenue) mitigates cyclical exposure."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Consolidation in Industrial Distribution",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Neutral", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 4/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Industrial distributors consolidating (e.g., MSC Industrial, Grainger acquisitions) creating larger, more sophisticated channel partners. Positive: Larger distributors invest in digital platforms, inventory management systems, and geographic expansion. Negative: Increased customer concentration and pricing leverage. Parker's ~17,100 distributor network (largest in industry) plus ParkerStores provide channel diversification and direct access."
        )]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("5.4 Company-Specific Trends & Issues")]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Meggitt Integration Execution & Synergy Realization",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 8/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Integration completed ahead of schedule with run-rate synergies of $160M achieved by FY2024 (above $140M target). Aerospace Systems margins expanded 740 bps to 20.3% in FY2024, demonstrating successful cost structure optimization. Complementary product portfolios (minimal overlap) enabled cross-selling opportunities. Divestiture of non-core wheel & brake business ($440M proceeds) streamlined portfolio. Cultural fit around engineering excellence and aftermarket service facilitated smooth integration. Remaining opportunity: Further procurement savings, manufacturing footprint rationalization, and commercial synergies as sales teams fully integrate."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Win Strategy 3.0 Driving Operational Excellence",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 7/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Business system delivering consistent margin expansion: 630 bps improvement over FY2019-FY2024 (18.6% to 24.9% adjusted segment operating margin). High Performance Teams (89% participation rate, 6,000+ active teams) driving lean initiatives, Kaizen events, and continuous improvement. Safety performance improving 45% (recordable incident rate to 0.31) with goal of zero incidents by 2030. Engagement score of 73% (91% response rate) indicating strong cultural adoption. Management raising FY2029 targets (27% segment margin, 28% EBITDA margin, 17% FCF margin) demonstrates confidence in runway for further improvement. Key risks: Maintaining momentum during rapid growth; ensuring newly acquired businesses adopt Win Strategy methodologies."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Filtration Group Acquisition Integration (Announced Nov 2024)",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 7/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "$9.25B acquisition creates one of world's largest industrial filtration businesses. Strategic rationale: Expands presence in high-growth life sciences, semiconductor, data center, and HVAC/R filtration applications. Enhances aftermarket recurring revenue streams. Leverages Parker's distribution network for cross-selling. Risks: Large debt-financed deal increases leverage temporarily; integration complexity following Meggitt; execution during industrial market softness. Expected close in 2025 pending regulatory approvals."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Leadership Transition & Succession Planning",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 5/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Jenny Parmentier became first female CEO (January 2023) and Chairman (January 2024) following Tom Williams' retirement. Parmentier internally promoted (joined 2012, COO 2021-2023) ensuring continuity. Andy Ross elevated to President & COO (joined 2012). Leadership team demonstrates deep Parker experience and operational expertise. Successful FY2024 performance under new leadership validates succession planning. Culture of internal development and decentralized structure ensures bench strength."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Margin Expansion Sustainability & FY2029 Target Credibility",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 8/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Management announced ambitious FY2029 targets: 27% segment operating margin (+200 bps from prior target), 28% EBITDA margin (+300 bps), 17% FCF margin (+100 bps), 4-6% organic growth CAGR, 10%+ adjusted EPS CAGR. Targets imply best-in-class performance and top-quartile positioning versus diversified industrial peers. Pathway: (1) Aerospace mix shift (higher margin segment growing faster), (2) Continued Win Strategy execution, (3) M&A margin accretion (Filtration Group), (4) Operating leverage on volume recovery, (5) Simplification benefits. Track record supports credibility: delivered on prior targets, achieved record FY2024 margins despite revenue headwinds. Risk: Industrial market recovery timing; execution on multiple large integrations simultaneously."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Aerospace Aftermarket Positioning & MRO Growth",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 8/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Commercial aftermarket showing strong recovery with flight hours exceeding pre-pandemic levels. Shop visit normalization driving component overhauls. Defense aftermarket strengthening on readiness funding and aging fleet maintenance. Parker's installed base on virtually every major platform creates 30+ year revenue streams from MRO requirements and airworthiness mandates. Aftermarket provides 10-15 percentage points higher margins than OEM business. Post-Meggitt, Parker significantly expanded aftermarket presence through fire protection, wheels & brakes (divested), and sensors. Global 24/7 AOG support network provides competitive differentiation."
        )]
      }),

      new Paragraph({
        spacing: { before: 180, after: 80 },
        children: [new TextRun({
          text: "Working Capital Management & Cash Conversion",
          bold: true,
          size: 24
        })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Direction: Positive", bold: true })]
      }),
      new Paragraph({
        numbering: { reference: "trend-bullets", level: 0 },
        children: [new TextRun({ text: "Impact Score: 6/10", bold: true })]
      }),
      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Cash flow from operations reached record $3.4B (17.0% of sales) in FY2024, up 14% YoY. Free cash flow of $3.0B (15.0% of sales) enabled $2B debt reduction, achieving 2.0x leverage target. Working capital metrics improving: Days inventory declined from 85 to 80 days; DSO flat at 51 days. FY2029 target of 17% FCF margin implies $3.3-3.5B annual free cash flow, providing $35B cumulative capital deployment capacity. Discipline around working capital evident in Diversified Industrial backlog management (down 12.6% as shipments exceeded orders). Challenge: Aerospace production ramps require inventory investment; Filtration Group acquisition increases working capital needs temporarily."
        )]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/5_Trends.docx", buffer);
  console.log("Trends section created successfully");
});
