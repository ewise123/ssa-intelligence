# News Intelligence

How the news functionality works, end to end. This document describes behavior and
architecture at a conceptual level — it intentionally avoids implementation detail so it
stays useful as the code evolves. For source locations, see the
[File Map](#file-map) at the bottom.

---

## 1. What the feature does

Each user maintains a **call diet** — a personal watchlist of companies, people, and
topics/tags they care about. The platform periodically gathers fresh news about those
entities from multiple sources, removes duplicates, summarizes and classifies each story
with an LLM, and shows the results on a per-user dashboard. Users can pin, dismiss, and
archive stories, run on-demand searches and deep dives, and export a curated digest as a
PDF, Markdown, or Word document.

Visibility is strictly per-user: a story is only associated with the users whose call
diet matched it, and non-admin users only ever see their own articles.

---

## 2. The call diet (what drives everything)

A user's call diet is composed of three kinds of tracked entities:

- **Companies** — reference entities the user follows.
- **People** — individuals the user follows (executives, partners, etc.).
- **Tags / topics** — thematic interests (e.g. an industry or deal type).

These are managed through standard create/read/update/delete operations on the user's
profile. The call diet is the input to every retrieval run: the system fetches and filters
news *for each entity in each user's diet*, and the resulting articles are linked back to
the users whose diet produced them.

---

## 3. Retrieval — a two-layer hybrid model

When a refresh runs, **two retrieval layers execute in parallel** and their results are
combined afterward. The two layers are complementary: Layer 1 is cheap, deterministic, and
broad; Layer 2 is LLM-driven and fills contextual gaps.

### Layer 1 — deterministic feeds (RSS / API)

Layer 1 pulls from structured, public feeds with no LLM involved:

- **Google News RSS** — one query per tracked company and person in the call diet.
- **Industry / PE RSS feeds** — a fixed set of finance- and deal-oriented feeds
  (alternative-assets news, PR-wire financial-services news, PR-wire M&A news). Articles
  from these broad feeds are pre-filtered by matching tracked company/person names so only
  relevant items survive.

Layer 1 is fast and reliable, and it provides the bulk of coverage.

### Layer 2 — Claude web search (contextual gap filling)

Layer 2 uses Claude's built-in web-search tool to find stories the structured feeds miss —
contextual or thematic coverage that doesn't show up cleanly in an RSS query. It is the
"enrichment" layer.

Because Layer 2 makes live model calls, it is wrapped in protective controls:

- **Per-request timeout** (several minutes) so a slow search can't stall a refresh.
- **Circuit breaker** — after a run of consecutive failures, Layer 2 is temporarily
  skipped (a short cooldown) so repeated failures don't degrade the whole refresh. Layer 1
  results still flow through during the cooldown.

If Layer 2 is unavailable, the refresh degrades gracefully to Layer 1 only.

Every stored article records **which layer produced it** (RSS feed, structured API, or LLM
web search), so coverage by source is traceable.

---

## 4. Combination, deduplication, and classification

After both layers return, raw articles are merged and run through a **two-stage
deduplication** process, then summarized and classified.

### Stage 1 — heuristic dedup (fast, no LLM)

A set of deterministic rules collapses obvious and near-duplicates:

- **URL normalization** — strips tracking parameters and standardizes URLs so the same
  link in different forms is recognized as one.
- **Content fingerprinting** — builds a signature from the normalized headline and
  description (significant words only) to catch reposts and lightly-edited copies.
- **Similarity scoring** — a word-overlap (Jaccard-style) comparison flags near-duplicate
  stories that aren't byte-identical.
- **Event signatures** — recognizes when multiple outlets are reporting the *same event*
  (e.g. a specific M&A deal) so they can be treated as one story.

This stage also restricts the set to recent articles before the more expensive LLM pass.

### Stage 2 — LLM dedup, grouping, and summarization

The LLM then groups the remaining articles by underlying story and, for each group,
selects the single best representative. For each surviving story it produces the
structured fields the dashboard displays:

- A **headline** and both a short and long **summary**.
- A **"why it matters"** note putting the story in context for the reader.
- A **status** — either a brand-new story or an update to a previously seen one.
- A **match type** — `exact` (a tracked company/person is directly named) or `contextual`
  (thematically related rather than a direct mention).

When multiple sources report the same merged story, each contributing source is retained
alongside the article so the story can show "reported by N sources."

### Final filtering

Stories that only matched on a tag/topic (with no company or person hit) are filtered out
before storage, keeping the feed focused on the entities the user actually tracks.

---

## 5. Storage model (conceptual)

The persisted shape of the feature, described by responsibility rather than schema:

| Concept | Holds |
|---|---|
| **Article** | The canonical story: headline, short/long summary, "why it matters", primary source URL (unique), publish time, status (new vs. update), match type (exact vs. contextual), originating layer, and per-article flags: sent, archived, dismissed, content-scraped. |
| **Article source** | The list of outlets/links backing a single merged story (URL, source name, layer, fetch time). One article can have many sources. |
| **Article ↔ user link** | The visibility join: which users a story belongs to, based on whose call diet matched it. This is the basis for per-user scoping. |
| **User pinned article** | Per-user pins. Pinned stories are protected from auto-archive. |
| **User activity** | Engagement log — opens, clicks, pins, exports — recorded per user. |
| **Tracked company / person / tag** | The reference entities that call diets are built from. |
| **News config** | A small key/value store used for operational state, including the latest **refresh status** (progress, stats, errors) and per-user **deep-dive sessions**. |

---

## 6. Refresh lifecycle

A "refresh" is the act of running retrieval → dedup → classification → storage for the
relevant call diets. There are two ways it gets triggered.

### Scheduled (automatic)

A daily cron job runs in the **America/New_York** timezone at roughly midnight Eastern.
Each scheduled run does two things in order:

1. **Auto-archive** — any article older than **72 hours** that hasn't been sent, archived,
   or dismissed, and isn't pinned, is automatically archived. This keeps the active feed
   fresh without losing anything a user explicitly kept.
2. **Refresh** — gather and process new news for the tracked entities.

### Manual (on-demand)

Users can trigger a refresh directly, optionally specifying how many days back to look
(within a bounded range). To prevent two refreshes from running at once, the manual
refresh acquires a **Postgres advisory lock**; if a refresh is already in progress, the
new request is rejected rather than queued. Refresh progress (percent complete, current
step, counts) is streamed back so the UI can show a live progress indicator.

---

## 7. Viewing and acting on the feed

### Dashboard

The dashboard lists the authenticated user's articles. **Non-admin users are always scoped
to their own stories**; admins may additionally filter by a specific user. Stories can be
filtered by company, person, tag, and by their sent/archived/dismissed state.

### Per-article actions

- **Pin / unpin** — protect a story from auto-archive.
- **Dismiss / archive** — remove a story from the active view.
- Engagement (opens, clicks, pins, exports) is logged as user activity.

### Ad-hoc search

Beyond the scheduled feed, a user can run an **on-demand search** for a specific company or
person, reusing the same retrieval/classification pipeline to pull current coverage on
demand.

### Deep dive

A **deep dive** is a heavier, background search session scoped to a single user. The user
starts a deep dive, polls for status while it runs, and then fetches the session's results.
Sessions are stored per user (in the config key/value store) and can be cleared — clearing
keeps pinned items.

---

## 8. Digest export

Users can export a curated digest of their news for a chosen date range in three formats:

- **PDF** — branded (SSA styling), rendered server-side with a headless browser.
- **Markdown** — plain-text-friendly export.
- **Word (DOCX)** — document export.

When a digest is exported, the included articles are marked **sent**, which both records
that they've been delivered and influences future auto-archive behavior.

---

## 9. Important caveat — there is no automated email delivery

Although the product is sometimes described as delivering "news digests via email," **the
codebase contains no email-sending infrastructure** (no SMTP client, mail SDK, or send
routine). In practice:

- Digests are produced **only on demand**, as downloadable PDF / Markdown / DOCX files.
- The "sent" flag on an article is set when a user **exports** a digest — it does not
  correspond to an email actually being sent.

If automated email delivery is a requirement, it is **not currently implemented** and would
need to be built (a mail transport plus a scheduled send step that consumes the existing
digest generators).

---

## 10. Data flow at a glance

```
            ┌─────────────────────────────────────────────────────┐
            │            Trigger: daily cron  OR  manual            │
            │     (manual run guarded by a Postgres advisory lock)  │
            └───────────────────────────┬─────────────────────────┘
                                         │
                 (scheduled run first auto-archives stories >72h old)
                                         │
                        per user's call diet (companies / people / tags)
                                         │
                ┌────────────────────────┴────────────────────────┐
                │                    in parallel                    │
        ┌───────▼────────┐                              ┌──────────▼─────────┐
        │   LAYER 1       │                              │   LAYER 2           │
        │ Google News RSS │                              │ Claude web search   │
        │ + industry/PE   │                              │ (gap filling)       │
        │ RSS feeds       │                              │ timeout + breaker   │
        └───────┬─────────┘                              └──────────┬─────────┘
                └──────────────────────┬──────────────────────────┘
                                       │  combine raw articles
                                       ▼
                        Stage 1: heuristic dedup
                  (URL norm · fingerprint · similarity · event sig)
                                       ▼
                Stage 2: LLM dedup + grouping + summarize + classify
              (headline, summaries, "why it matters", status, match type)
                                       ▼
                       drop tag-only matches; keep entity hits
                                       ▼
              store Article (+ sources) and link to matching users
                                       ▼
        ┌──────────────┬───────────────┬──────────────────────────┐
        ▼              ▼               ▼                          ▼
   Dashboard     Pin/Dismiss/      Ad-hoc search /         Digest export
  (per-user)      Archive          Deep dive (per-user)    (PDF/MD/DOCX → "sent")
```

---

## File Map

| Responsibility | Location |
|---|---|
| Hybrid orchestration (combine layers, dedup, classify) | `backend/src/services/news-fetcher.ts` |
| Layer 1 feeds + heuristic dedup | `backend/src/services/layer1-fetcher.ts` |
| Scheduling + auto-archive | `backend/src/services/news-scheduler.ts` |
| Manual refresh (advisory lock, progress stream) | `backend/src/api/news/refresh.ts` |
| Dashboard query (per-user scoping) | `backend/src/api/news/articles.ts` |
| Call diet management | `backend/src/api/news/user-call-diet.ts` |
| Ad-hoc search | `backend/src/api/news/search.ts` |
| Deep dive (background sessions) | `backend/src/api/news/deep-dive.ts` |
| Pins / activity | `backend/src/api/news/pins.ts`, `backend/src/api/news/activity.ts` |
| Digest export (routes) | `backend/src/api/news/export.ts` |
| Export generators | `backend/src/services/pdf-export.ts`, `markdown-export.ts`, `news-docx-export.ts` |
| Persistence (models) | `backend/prisma/schema.prisma` |
