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
        reference: "news-bullets",
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
        children: [new TextRun("8. Recent News & Events")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 240 },
        children: [new TextRun(
          "This section chronicles significant corporate developments, earnings announcements, strategic initiatives, and external events impacting Parker-Hannifin over the past 12 months (December 2023 – December 2024). Events are organized chronologically and categorized by strategic significance."
        )]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("November 2024: Filtration Group Acquisition Announced")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 100 },
        children: [new TextRun({
          text: "Date: November 11, 2024",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Strategic Significance: Transformational",
          bold: true
        })]
      }),

      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Parker announced a definitive agreement to acquire Filtration Group Corporation from Madison Industries for $9.25 billion in cash (debt-free, cash-free basis). This represents Parker's second-largest acquisition ever, behind only the $9.8 billion Meggitt purchase in 2022. The transaction values Filtration Group at 19.6x estimated calendar 2025 adjusted EBITDA of $472 million, or 13.4x including $220 million expected cost synergies."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Key Transaction Details:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Target Profile: Filtration Group generates approximately $2 billion in calendar 2025 sales with 23.5% adjusted EBITDA margin and employs 7,500 team members across 165 locations in 27 countries")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Aftermarket Focus: 85% of Filtration Group sales are recurring aftermarket revenue, increasing Parker Filtration's aftermarket mix by 500 basis points")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("End Markets: Life Sciences (pharmaceutical, biotech, medical device filtration), HVAC/R (commercial building air filtration), and industrial applications (compressed air, hydraulic oil, process filtration)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Synergies: $220 million pre-tax cost synergies expected by end of year three post-close, driven by procurement optimization, manufacturing footprint rationalization, and overhead leverage")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Financing: New debt issuance plus cash on hand; Parker expects to maintain investment-grade credit rating")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Timeline: Expected close in 6-12 months pending regulatory approvals (antitrust clearance in U.S., EU, other jurisdictions)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Returns: Projected to achieve high single-digit ROIC by year five; accretive to organic growth, EBITDA margin, adjusted EPS, and cash flow")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun({
          text: "Strategic Rationale:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "CEO Jenny Parmentier stated the transaction \"continues our investment in high quality businesses that continue to transform our portfolio, accelerate sales growth and improve profitability.\" The deal creates one of the world's largest industrial filtration businesses, combining Filtration Group's specialized media technologies and aftermarket presence with Parker's global distribution network (~17,100 partners), engineering capabilities (8,000+ engineers), and Win Strategy operational excellence. Parker previously acquired CLARCOR for $4.3 billion in 2017, establishing filtration as a core technology platform. Filtration Group adds complementary capabilities in high-growth life sciences (driven by bioprocessing, single-use systems) and premium HVAC/R segments where Parker had limited presence. The 85% aftermarket mix aligns with Parker's strategic priority to increase recurring revenue and improve margin stability."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun({
          text: "Market and Analyst Reaction:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Parker's stock declined modestly following the announcement as investors digested the valuation multiple (19.6x EBITDA viewed as full pricing) and leverage implications. However, analysts generally viewed the acquisition favorably, citing strategic fit, aftermarket synergies, and Parker's strong integration track record post-Meggitt. The market capitalization stood at approximately $106 billion at announcement, providing ample financial capacity. Barclays served as financial advisor to Parker; Lincoln International advised Filtration Group."
        )]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("August 2024: Fiscal 2024 Full Year Results")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 100 },
        children: [new TextRun({
          text: "Date: August 8, 2024",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Strategic Significance: High",
          bold: true
        })]
      }),

      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Parker reported record FY2024 financial performance (fiscal year ended June 30, 2024) with total sales of $19.9 billion (+4.5% versus FY2023), adjusted segment operating margin of 24.9% (+200 bps), adjusted EPS of $25.44 (+17.7%), and free cash flow of $3.0 billion (15.0% of sales). The company exceeded its guidance ranges across all key metrics and raised five-year financial targets for fiscal 2029."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Fourth Quarter Highlights (Q4 FY2024, ended June 30, 2024):",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Sales: $5.2 billion (+2% reported, +3% organic)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Adjusted segment operating margin: Record 25.3% (+130 bps)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Adjusted EPS: $6.77 (+12%)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Aerospace Systems sales: Record $1.5 billion (+19% organic), with segment margins of 21.9%")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Diversified Industrial: North America organic sales -3%; International organic sales -2.5% (Europe and Asia softness)")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Full Year Performance (FY2024):",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Operating cash flow: Record $3.4 billion (17.0% of sales, +14% YoY)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Debt reduction: Over $3.4 billion since Meggitt acquisition close; achieved 2.0x net debt/EBITDA target")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Working capital: Days inventory improved from 85 to 80 days")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Aerospace Systems: Sales doubled since FY2020 ($2.7B to $5.5B); margins expanded to 20.3%")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Dividend: Increased annual dividend for 68th consecutive year, ranking among top 5 longest-running records in S&P 500")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Updated FY2029 Financial Targets (announced):",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Adjusted segment operating margin: 27% (raised from 25% prior target)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Adjusted EBITDA margin: 28% (raised from 25%)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Free cash flow margin: 17% (raised from 16%)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Adjusted EPS CAGR: 10%+ through FY2029")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Organic sales growth: 4-6% CAGR")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun({
          text: "Management Commentary:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "CEO Jenny Parmentier: \"We delivered an exceptionally strong fourth quarter capping another year of record performance. Our ability to drive outstanding results reflects the dedication and commitment of our people, the strength and balance of our portfolio, and the power of our business system, The Win Strategy. We had record sales approaching $20 billion, record adjusted segment operating margin, which increased 200 basis points compared to the prior year, adjusted earnings per share growth of 18%, and record free cash flow of $3 billion. Parker has a very bright future ahead as indicated by our strong outlook for fiscal year 2025, which puts us on track to achieve our financial targets for fiscal year 2029.\""
        )]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("August 2024: Fiscal 2025 Guidance Issued")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 100 },
        children: [new TextRun({
          text: "Date: August 8, 2024 (concurrent with FY2024 results)",
          bold: true
        })]
      }),

      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Parker issued guidance for fiscal year 2025 (year ending June 30, 2025) reflecting expectations for continued aerospace strength offset by near-term industrial softness with second-half recovery."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "FY2025 Guidance:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Total sales growth: 1.5% to 4.5%")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Organic sales growth: 2% to 5% (implying neutral to low-single-digit H1, acceleration in H2)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Adjusted segment operating margin: 25.2% to 25.6% (+30 to 70 bps expansion)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Adjusted EPS: $26.30 to $27.00 (+3% to +6% versus FY2024's $25.44)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Aerospace Systems organic growth: High single digits (commercial OE, low double-digit commercial aftermarket, mid-single-digit defense)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Diversified Industrial organic growth: Neutral to low-single-digit H1 FY2025, improving to low-to-mid single digits H2")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun({
          text: "Segment Outlook Detail:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Aerospace: Management forecasts high single-digit commercial OE growth driven by Boeing 737 MAX ramp (targeting 38 units/month) and Airbus A320neo family production (60+ units/month). Wide-body production (787, A350, 777X) expected to increase low-to-mid single digits. Commercial aftermarket projected to grow low double digits supported by flight hour recovery and MRO shop visit normalization. Defense OE anticipated mid-single-digit growth (F-35 ramp to 156 units/year, CH-47 upgrades, unmanned systems). Defense aftermarket high single digits on readiness funding."
        )]
      }),
      new Paragraph({
        children: [new TextRun(
          "Diversified Industrial: Near-term headwinds from industrial destocking, HVAC/R market softness, and European/Asia demand weakness. Sequential improvement expected throughout FY2025 as inventory digestion completes and manufacturing PMI stabilizes. Energy markets (oil & gas) providing relative strength. Off-highway (construction, agriculture) showing early signs of stabilization. Aftermarket business (45% of Diversified Industrial revenue) remains resilient."
        )]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("May 2024: Investor Day & Updated Long-Term Targets")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 100 },
        children: [new TextRun({
          text: "Date: May 16, 2024",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({
          text: "Strategic Significance: High",
          bold: true
        })]
      }),

      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Parker hosted an Investor Day in New York City where management presented the company's strategic vision and updated five-year financial targets through fiscal 2029. The event highlighted transformation achievements post-Meggitt integration, Win Strategy operational improvements, and secular growth drivers positioning Parker for sustained outperformance."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Key Themes:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Portfolio Transformation: Post-Meggitt, aerospace represents 33% of revenue (up from ~20% pre-acquisition), creating balanced exposure between secular growth aerospace and resilient industrial markets")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Interconnected Technologies: Two-thirds of customers purchase 4+ Parker technologies, demonstrating systems integration value proposition and creating switching costs")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Win Strategy 3.0: Business system evolution focusing on safety excellence (zero incidents goal by 2030), customer experience (NPS improvement), profitable growth (design-in wins), and financial performance (margin expansion)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Capital Deployment: $35 billion cumulative deployment capacity through FY2029 allocated to M&A (acquisitions like Filtration Group), share repurchases, and dividend growth (targeting 68+ consecutive years)")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun({
          text: "Ambitious Long-Term Targets (FY2029):",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Management raised targets from prior fiscal 2027 goals, reflecting confidence in execution and secular tailwinds. New targets position Parker in the top quartile of diversified industrial peers across margin, return, and growth metrics."
        )]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Q3 FY2024 Results (May 2024)")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 100 },
        children: [new TextRun({
          text: "Date: May 2, 2024",
          bold: true
        })]
      }),

      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "Third quarter fiscal 2024 results (quarter ended March 31, 2024) showed continued aerospace momentum and margin expansion despite industrial market headwinds. Sales were $5.07 billion (flat YoY reported, +3% organic excluding divestitures). Adjusted segment operating margin improved 140 bps to 24.5%. Adjusted EPS increased 10% to $6.51."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Segment Performance:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Aerospace Systems: Record $1.4 billion sales (+18% organic) with commercial OE and aftermarket both growing double digits; segment margins expanded to 19.8%")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Diversified Industrial North America: $2.2 billion sales (-4.6% organic) reflecting industrial destocking and HVAC/R softness")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Diversified Industrial International: $1.4 billion sales (-3.1% organic) with Europe and Asia weakness")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun({
          text: "Cash Flow & Balance Sheet:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "Year-to-date cash flow from operations increased 20% to record $2.1 billion (14.6% of sales). Free cash flow reached $1.9 billion (12.6% of sales). Debt reduced by $420 million in Q3, bringing total deleveraging since Meggitt close to $2.6 billion. Management raised full-year guidance based on strong Q3 execution, increasing adjusted EPS outlook to $24.75 (from $24.65 midpoint)."
        )]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Q1 FY2024 Results (November 2023)")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 100 },
        children: [new TextRun({
          text: "Date: November 2, 2023",
          bold: true
        })]
      }),

      new Paragraph({
        spacing: { before: 80, after: 120 },
        children: [new TextRun(
          "First quarter fiscal 2024 (quarter ended September 30, 2023) delivered record sales of $4.8 billion (+15% reported, including Meggitt), adjusted EPS of $5.96 (+26%), and operating cash flow of $650 million (13.4% of sales). Results exceeded expectations across all metrics, prompting Parker to raise full-year guidance."
        )]
      }),

      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({
          text: "Performance Drivers:",
          bold: true
        })]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Meggitt integration ahead of schedule with synergy realization exceeding targets")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Aerospace strong double-digit organic growth in both commercial and defense")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Adjusted segment operating margins expanded 180 bps to 23.5% despite volume headwinds")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Price realization of 3-4% offsetting inflation and mix impacts")]
      }),

      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [new TextRun({
          text: "Management Commentary:",
          bold: true
        })]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun(
          "CEO Jenny Parmentier: \"With such a strong start to the fiscal year, we have raised our guidance for fiscal 2024. Our focus remains on being the safest industrial company in the world, serving our customers, strengthening our operations and expanding margins. These priorities coupled with favorable secular growth trends will help accelerate our performance through the cycle and achieve our long-term financial targets. We have a very promising future.\""
        )]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Other Significant Events")]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Leadership & Governance")]
      }),

      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("January 2024: Jenny Parmentier appointed Chairman of the Board (in addition to CEO role assumed January 2023), succeeding Tom Williams who retired")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Andy Ross continues as President & Chief Operating Officer, overseeing both business segments")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Leadership team demonstrates strong continuity with deep Parker experience")]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("ESG & Sustainability")]
      }),

      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Reaffirmed carbon-neutral operations commitment by 2040")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Safety performance: 0.31 recordable incident rate, 45% reduction over 5 years; targeting zero incidents by 2030")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Two-thirds of Parker's product portfolio enables clean technology solutions")]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Operational Milestones")]
      }),

      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Completed Meggitt wheel & brake business divestiture to Kaman Corporation for $440 million (closed Q1 FY2024)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Achieved 89% High Performance Team (HPT) participation rate with 6,000+ active teams driving continuous improvement")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Employee engagement score of 73% with 91% response rate")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Expanded global manufacturing footprint to 335 plants across 43 countries")]
      }),

      new Paragraph({
        spacing: { before: 180 },
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Awards & Recognition")]
      }),

      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Fortune 250 ranking maintained (based on FY2023 revenue of $19.1 billion)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("68 consecutive years of annual dividend increases (among top 5 in S&P 500)")]
      }),
      new Paragraph({
        numbering: { reference: "news-bullets", level: 0 },
        children: [new TextRun("Multiple supplier excellence awards from Boeing, Airbus, Lockheed Martin for quality and delivery performance")]
      }),

      new Paragraph({
        spacing: { before: 240 },
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Forward-Looking Considerations")]
      }),

      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [new TextRun(
          "Parker enters calendar 2025 with strong momentum despite mixed near-term industrial signals. The Filtration Group acquisition pending close adds $2 billion revenue and 85% aftermarket content, accelerating portfolio transformation. Management's raised FY2029 targets (27% segment margin, 28% EBITDA margin, 17% FCF margin) reflect confidence in secular aerospace growth, Win Strategy execution, and M&A integration capabilities. Key catalysts to monitor: (1) Industrial demand recovery timing (H2 FY2025 inflection), (2) Filtration Group deal close and integration execution, (3) Aerospace production rate trajectory (Boeing 737 MAX, GTF engine reliability), (4) Margin progression toward 27% target, (5) Capital deployment (share buybacks, bolt-on M&A). Risks include industrial cycle downturn, integration challenges, geopolitical tensions impacting supply chains, and aerospace OEM quality/certification delays."
        )]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/8_Recent_News_and_Events.docx", buffer);
  console.log("Recent News & Events created successfully");
});
