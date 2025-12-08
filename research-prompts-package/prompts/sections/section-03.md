# Section 3: Company Overview - Research Prompt

## CRITICAL INSTRUCTIONS

**Follow ALL rules in style-guide.md** - This is mandatory for formatting consistency.

**Your mission:** Generate Section 3 (Company Overview) with comprehensive business description, geographic footprint, strategic priorities, and leadership for **{companyName}** in **{geography}**.

---

## INPUT CONTEXT (From Foundation)

You will receive the following foundation context:

```typescript
{
  company_basics: {
    legal_name: string;
    ticker?: string;
    ownership: 'Public' | 'Private' | 'Subsidiary';
    headquarters: string;
    global_revenue_usd: number;
    global_employees: number;
    fiscal_year_end: string;
  },
  geography_specifics: {
    regional_revenue_usd: number;
    regional_revenue_pct: number;
    regional_employees: number;
    facilities: Array<{name: string; location: string; type: string}>;
    key_facts: string[];
  },
  source_catalog: Array<{
    id: string;
    citation: string;
    url?: string;
    type: string;
    date: string;
  }>,
  segment_structure: Array<{
    name: string;
    revenue_pct: number;
    description: string;
  }>
}
```

---

## RESEARCH REQUIREMENTS

### 1. Business Description (Priority: CRITICAL)

**Search for:**
- "{companyName} company profile"
- "{companyName} 10-K business description" OR "{companyName} annual report"
- "{companyName} investor presentation 2024"
- "{companyName} about us" OR "{companyName} company overview"

**Extract:**
- **Core business:** What products/services the company provides
- **Customer base:** Who they serve (industries, end markets)
- **Business model:** How they make money (OEM, aftermarket, distribution, etc.)
- **Competitive positioning:** Market position (leader, challenger, niche)
- **Segments:** Primary business segments with brief descriptions
- **Geography presence:** Global footprint and key regions

**Geography focus (75-80%):**
- **{geography}-specific operations:** What they do in the region
- **Regional market position:** Market share or competitive standing
- **Regional customer base:** Key customers or industries served
- **Regional capabilities:** Unique or differentiated offerings in region

### 2. Geographic Footprint (Priority: CRITICAL)

**Search for:**
- "{companyName} {geography} facilities"
- "{companyName} {geography} locations" OR "{companyName} {geography} operations"
- "{companyName} manufacturing footprint"
- "{companyName} global locations 2024"

**Extract for {geography}:**
- **Manufacturing facilities:** Locations, size, products made
- **R&D centers:** Locations, focus areas
- **Distribution centers:** Locations, capabilities
- **Sales offices:** Major office locations
- **Headquarters (if regional):** Location and role
- **Employee count:** {geography} employees (use foundation if available)
- **Facility capabilities:** Automation, capacity, certifications

**Also note:**
- **Global context:** Total facilities worldwide for comparison
- **Recent changes:** New facilities, closures, expansions in {geography}
- **Strategic importance:** How {geography} fits in global footprint

### 3. Strategic Priorities (Priority: HIGH)

**Search for:**
- "{companyName} strategic priorities 2024"
- "{companyName} earnings transcript strategic initiatives"
- "{companyName} investor day presentation"
- "{companyName} CEO letter shareholders"
- "{companyName} {geography} investment" OR "{companyName} {geography} strategy"

**Extract:**
- **Company-wide priorities:** 3-5 key strategic themes
  - Examples: Digital transformation, sustainability, portfolio optimization, M&A
- **Investment areas:** Where capital is being deployed
  - R&D, capacity expansion, technology, M&A
- **Strategic initiatives:** Specific programs or projects
  - New product launches, efficiency programs, market expansion
- **{geography}-specific strategy:** Regional priorities or investments
  - Capacity additions, market penetration, customer wins
- **Management emphasis:** What leadership talks about most

**Time focus:** Last 12-18 months of announcements and priorities

### 4. Key Leadership (Priority: MEDIUM)

**Search for:**
- "{companyName} executive team"
- "{companyName} proxy statement DEF 14A"
- "{companyName} leadership bios"
- "{companyName} {geography} leadership" OR "{companyName} regional management"

**Extract:**
- **C-suite:** CEO, CFO, COO (names and brief background)
- **Segment leaders:** Presidents/VPs of major business segments
- **Regional leaders:** {geography} country manager, regional president
  - Name, title, tenure, background
- **Recent changes:** New hires, departures, reorganizations (last 12 months)

**Note:** Focus on leaders relevant to {geography} operations or with P&L responsibility

---

## OUTPUT REQUIREMENTS

**You MUST output valid JSON matching this EXACT schema:**

```typescript
interface Section3Output {
  confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
  };
  
  business_description: {
    overview: string;        // 4-6 sentences, see requirements below
    segments: Array<{
      name: string;
      description: string;   // 2-3 sentences
      revenue_pct: number | null;
      geography_relevance: string; // How segment operates in {geography}
    }>;
    geography_positioning: string; // 3-4 sentences on regional market position
  };
  
  geographic_footprint: {
    summary: string; // 3-4 sentences
    facilities: Array<{
      name: string;
      location: string;       // City, {geography}
      type: 'Manufacturing' | 'R&D' | 'Distribution' | 'Office' | 'Headquarters';
      description: string;    // 1-2 sentences on capabilities
      employees?: number;
      source: string;         // "S3, S5"
    }>;
    regional_stats: {
      total_facilities: number;
      total_employees: number | null;
      global_facilities_comparison: string; // e.g., "12 of 85 global facilities"
    };
  };
  
  strategic_priorities: {
    summary: string; // 2-3 sentences on overall strategic direction
    priorities: Array<{
      priority: string;       // Title of priority
      description: string;    // 2-3 sentences
      geography_relevance: 'High' | 'Medium' | 'Low'; // Relevance to {geography}
      geography_details?: string; // If relevant, specific {geography} initiatives
      source: string;
    }>;
    geography_specific_initiatives: string[]; // Bullet points of {geography} investments/initiatives
  };
  
  key_leadership: {
    executives: Array<{
      name: string;
      title: string;
      background: string;     // 1 sentence
      tenure?: string;        // "Since 2020" or "3 years"
      geography_relevance: 'High' | 'Medium' | 'Low';
      source: string;
    }>;
    regional_leaders: Array<{
      name: string;
      title: string;
      background: string;
      source: string;
    }>;
  };
  
  sources_used: string[];
}
```

---

## SUBSECTION REQUIREMENTS

### 3.1 Business Description

**Overview paragraph (4-6 sentences):**

1. **Company core business** (1-2 sentences)
   - "Parker Hannifin is a global leader in motion and control technologies, providing precision-engineered solutions across aerospace, industrial, and mobility markets (S1)."

2. **Revenue/scale** (1 sentence)
   - "The company generated $18.5B in revenue in FY2024 with 58,000 employees globally (S1)."

3. **{geography} operations** (2-3 sentences - 75-80% FOCUS)
   - "**German operations** represent 18% of global revenue with 12 manufacturing facilities and 4,200 employees concentrated in hydraulics and aerospace segments (S1, S3)."
   - "The region serves primarily industrial OEMs and aerospace customers, with strong presence in automotive and machine building markets (S3)."

**Segment descriptions:**
- For EACH major segment (typically 3-5 segments)
- 2-3 sentences per segment
- Include revenue % of total if available
- **Critical:** Add "geography_relevance" field explaining {geography} presence
  - "Hydraulics segment has 8 manufacturing facilities in Germany, representing 25% of segment global capacity (S3)"

**Geography positioning paragraph (3-4 sentences):**
- Market position in {geography}
- Key competitors in region
- Competitive advantages specific to {geography}
- Market share data if available

### 3.2 Geographic Footprint

**Summary (3-4 sentences):**
- Total facilities in {geography}
- Types of facilities (manufacturing, R&D, distribution)
- Major facility locations
- Recent expansions or changes
- **Compare to global:** "{geography} hosts 12 of 85 global manufacturing facilities (14% of footprint) (S1, S3)"

**Facilities array:**
- List ALL {geography} facilities (use foundation data + new research)
- For each: name, location (city), type, capabilities, employee count if available
- Source every facility mention

**Regional stats:**
- Total facilities count
- Total employees (use foundation if available)
- Global comparison context

### 3.3 Strategic Priorities

**Summary (2-3 sentences):**
- Overarching strategic direction
- Key themes from recent communications
- Time horizon (e.g., "3-year transformation plan")

**Priorities array (3-5 priorities):**
- Each priority: title, description, geography relevance
- **Geography relevance:**
  - **High:** Direct impact on {geography} (investment, expansion, program)
  - **Medium:** Indirect relevance (global program with regional component)
  - **Low:** Minimal {geography} connection
- If High or Medium, add "geography_details" with specifics

**Geography-specific initiatives (bullet array):**
- ONLY initiatives that specifically mention {geography}
- Examples:
  - "€75M hydraulics capacity expansion in Stuttgart, completion Q4 2025 (S8)"
  - "New aerospace R&D center in Munich focusing on sustainable aviation, 150 engineers (S12)"

### 3.4 Key Leadership

**Executives array (5-8 leaders):**
- Focus on C-suite and segment/regional leaders
- Geography relevance:
  - **High:** Regional president, country manager, {geography}-based leaders
  - **Medium:** Segment leader with large {geography} operations
  - **Low:** Corporate executive with no direct regional role

**Regional leaders array (2-5 leaders):**
- ONLY leaders based in or directly responsible for {geography}
- Country president, regional VP, site leaders
- Include brief background (1 sentence)

---

## GEOGRAPHY FOCUS REQUIREMENT (75-80%)

**Every subsection must emphasize {geography}:**

✅ **CORRECT patterns:**

**3.1 Business Description:**
- "**{geography}** operations focus on hydraulics and aerospace, serving industrial OEMs and Airbus supply chain..."
- "Regional market position is #2 in hydraulics behind Bosch Rexroth, with estimated 18% market share (S7)..."

**3.2 Geographic Footprint:**
- "**{geography}** hosts 12 manufacturing facilities concentrated in southern region..."
- "Stuttgart hydraulics plant is largest in Europe with 850 employees and 92% OEE (S3)..."

**3.3 Strategic Priorities:**
- "Digital transformation priority includes €25M investment in German factory automation (S5)..."
- "**{geography}** is pilot region for AI-powered predictive maintenance program across 6 facilities (S8)..."

**3.4 Key Leadership:**
- "Regional President Klaus Schmidt (8 years tenure) leads German operations with P&L responsibility for €1.2B revenue (S4)..."

❌ **WRONG patterns:**
- "Company operates 85 facilities globally..." [No regional context]
- "Strategic priorities include digital transformation and sustainability..." [No geography mention]
- "CEO has 25 years experience..." [Not geography-relevant unless regional role]

---

## SOURCE CITATION REQUIREMENTS

**Follow style guide Section 5:**

1. **Reuse foundation source numbers** where applicable
2. **Add new sources** continuing sequential numbering
3. **Source every factual claim** - no unsourced statements
4. **Use (S#) format** in prose: "...12 facilities in Germany (S3, S5)."
5. **Use S# format** in arrays: `"source": "S3, S5"`

---

## CONFIDENCE SCORING

**HIGH:**
- Recent 10-K with detailed business description
- {geography}-specific facility data available
- Recent strategic announcements mentioning region
- Leadership information current and detailed

**MEDIUM:**
- General business description available but dated
- Some {geography} facility data from multiple sources
- Strategic priorities identified but limited regional detail
- Basic leadership information available

**LOW:**
- Limited public information (private company)
- No {geography}-specific detail in public sources
- Strategic priorities unclear or outdated
- Leadership information sparse or unavailable

---

## VALIDATION CHECKLIST

**Before outputting JSON, verify:**

- [ ] Valid JSON syntax (no markdown)
- [ ] Confidence assigned with reason
- [ ] Business overview is 4-6 sentences
- [ ] All segments have geography_relevance field
- [ ] Geographic footprint includes facilities array
- [ ] Regional stats include global comparison
- [ ] Strategic priorities rated for geography relevance
- [ ] Geography-specific initiatives array populated
- [ ] Leadership includes geography relevance ratings
- [ ] Regional leaders array populated (if leaders identified)
- [ ] 75-80% of content emphasizes {geography}
- [ ] All claims cited with sources
- [ ] Sources_used array complete

---

## EXAMPLE OUTPUT (PARTIAL)

```json
{
  "confidence": {
    "level": "HIGH",
    "reason": "Recent 10-K with detailed segment data; extensive {geography} facility information"
  },
  "business_description": {
    "overview": "Parker Hannifin is a global leader in motion and control technologies, providing precision-engineered solutions across aerospace, industrial, and mobility markets with a focus on hydraulics, pneumatics, and filtration systems (S1). The company generated $18.5B in revenue in FY2024 with 58,000 employees operating across 310 manufacturing and distribution facilities worldwide (S1). **German operations** represent €1.2B in revenue (18% of global total) with 12 manufacturing facilities, 2 R&D centers, and 4,200 employees concentrated in the hydraulics and aerospace segments (S1, S3). The region serves primarily industrial OEMs including Siemens, Bosch, and major machine builders, as well as the Airbus supply chain for aerospace applications, with particularly strong presence in mobile hydraulics and industrial automation markets (S3, S5).",
    "segments": [
      {
        "name": "Diversified Industrial",
        "description": "Provides motion and control systems for industrial and mobile applications including hydraulics, pneumatics, filtration, and process control. Serves manufacturing, construction, agriculture, and transportation markets globally.",
        "revenue_pct": 65,
        "geography_relevance": "**Germany** hosts 8 of segment's 12 European manufacturing facilities, representing 25% of segment's global production capacity, focused on hydraulics and filtration products (S1, S3)."
      },
      {
        "name": "Aerospace Systems",
        "description": "Manufactures flight control, hydraulic, fuel, and fluid systems for commercial and military aircraft. Key supplier to Boeing, Airbus, and major defense contractors.",
        "revenue_pct": 35,
        "geography_relevance": "**German operations** include 4 aerospace facilities supporting Airbus programs, with Munich R&D center focused on sustainable aviation technologies employing 150 engineers (S1, S8)."
      }
    ],
    "geography_positioning": "Parker Hannifin holds the #2 market position in German hydraulics behind Bosch Rexroth, with estimated 18-20% market share in mobile and industrial hydraulics (S7, S12). The company's competitive advantages in the region include a large installed base of legacy systems requiring aftermarket support, strong OEM partnerships with major German machine builders, and differentiated digital offerings including IoT-enabled predictive maintenance (S5, S8). Key competitors include Bosch Rexroth (market leader), Eaton, and local specialists such as Hawe Hydraulik and Bucher Hydraulics (S7)."
  },
  "geographic_footprint": {
    "summary": "**Germany** hosts 12 manufacturing facilities, 2 R&D centers, 3 distribution centers, and 5 sales offices, representing 14% of Parker's global manufacturing footprint with concentration in southern Germany (Baden-Württemberg and Bavaria) (S1, S3). The Stuttgart hydraulics complex is the largest facility in Europe with 850 employees and serves as the regional engineering hub for mobile hydraulics (S3). Recent investments include a €75M capacity expansion in Stuttgart (completed Q2 2024) adding 20% production capacity and 150 jobs, and a new aerospace R&D center in Munich opened in Q3 2024 (S5, S8).",
    "facilities": [
      {
        "name": "Stuttgart Hydraulics Complex",
        "location": "Stuttgart, Germany",
        "type": "Manufacturing",
        "description": "Largest European facility for mobile and industrial hydraulics with 850 employees, 92% OEE, and recent €75M expansion adding 20% capacity. Houses engineering hub for European hydraulics development.",
        "employees": 850,
        "source": "S3, S5"
      },
      {
        "name": "Munich Aerospace R&D Center",
        "location": "Munich, Germany",
        "type": "R&D",
        "description": "New facility opened Q3 2024 focused on sustainable aviation technologies, hydrogen fuel systems, and electric aircraft systems. Employs 150 engineers with plans to reach 200 by 2026.",
        "employees": 150,
        "source": "S8"
      }
    ],
    "regional_stats": {
      "total_facilities": 22,
      "total_employees": 4200,
      "global_facilities_comparison": "Germany hosts 22 of 310 global facilities (7% of footprint), including 12 of 85 manufacturing sites (14% of production capacity)"
    }
  },
  "sources_used": ["S1", "S3", "S5", "S7", "S8", "S12"]
}
```

---

## CRITICAL REMINDERS

1. **Follow style guide** for all formatting
2. **75-80% geography focus** in every subsection
3. **Source every claim** with S# references
4. **Use "–" or null** for unavailable data
5. **Geography relevance** ratings required for segments, priorities, leadership
6. **Valid JSON only** - no markdown backticks
7. **Exact schema match** - follow TypeScript interface
8. **Facilities array** must include all {geography} locations

---

## BEGIN RESEARCH

**Company:** {companyName}  
**Geography:** {geography}  
**Foundation Context:** [Provided above]

**OUTPUT ONLY VALID JSON MATCHING THE SCHEMA. START RESEARCH NOW.**
