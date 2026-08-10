<p align="center">
  <img src="public/images/Triada_typo.png" alt="TRIADA" width="220" />
</p>

<h1 align="center">News</h1>

<p align="center">
  Cybersecurity headlines, aggregated and enriched, updated every hour.
</p>

---

## What it does

TRIADA News pulls headlines from over 30 cybersecurity sources (vendor
advisories, threat research blogs, national CERTs, cloud security bulletins)
and enriches every article automatically:

- **Severity classification** (critical, high, medium, news) based on
  content signals and CISA's Known Exploited Vulnerabilities catalog
- **CVE extraction and tracking**, with dedicated pages per CVE listing
  every article that mentions it
- **Category tagging** (ransomware, zero day, vendor advisory, threat
  intel, and more), auto-detected per article
- **AI-generated summaries** covering why a story matters, affected
  products, and recommended action, with a deterministic fallback when
  no AI provider is configured
- **KEV and proof-of-concept detection** to surface actively exploited
  or weaponized vulnerabilities first

The homepage highlights the top breaking story, a daily digest of
critical activity, and a searchable, filterable feed of everything else.

## Stack

- [Next.js](https://nextjs.org) (App Router, Turbopack) and React 19
- TypeScript and Tailwind CSS
- Google Gemini for AI enrichment, with an Anthropic Claude fallback path
- GitHub Actions for the hourly data refresh

## How data flows

1. `scripts/fetch-news.mjs` runs on a scheduled GitHub Action, once an hour
2. It pulls every configured RSS/Atom feed, deduplicates against the
   existing dataset, and hands new articles to the enrichment pipeline
3. `scripts/lib/enrich.mjs` classifies severity and category, extracts
   CVEs, cross-references the CISA KEV catalog, and generates a
   structured AI summary for each new article
4. The result is written to `data/news.json` and committed back to the
   repository
5. The Next.js site reads that file at build time and renders statically

No database, no runtime API calls from the browser. The site is fully
static once built.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run the data pipeline locally:

```bash
node scripts/fetch-news.mjs
```

Set `GEMINI_API_KEY` (or `ANTHROPIC_API_KEY`) in a local `.env` file to
enable AI-generated summaries. Without a key, the pipeline falls back to
a rule-based summary so the site still works end to end.

## Project structure

```
app/                  Routes, layouts, and UI components
scripts/
  fetch-news.mjs       Feed fetching and pipeline entry point
  lib/enrich.mjs        Severity, category, CVE, and AI enrichment
  lib/env.mjs            Local .env loader for the pipeline
data/news.json         Generated dataset consumed by the site
.github/workflows/      Hourly data refresh automation
```

## Deployment

Any static-friendly host works. On Vercel, connect the repository and
every commit to `main`, including the hourly automated data update,
triggers a new deployment.

## License

Built and maintained by [TRIADA](https://triada.in).
