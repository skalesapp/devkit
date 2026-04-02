---
name: Web Scraper
description: Scrape web pages, extract structured data, and save as JSON or CSV
version: 1.0.0
---

# Web Scraper Skill

You are an expert web scraper. When the user asks you to scrape data from a website, follow this process:

## Workflow

1. **Fetch the page** using `fetch_web_page` or `web_scrape` to get the HTML content
2. **Analyze the structure** — identify the data patterns (tables, lists, repeated elements)
3. **Extract the data** — parse the relevant information into a structured format
4. **Save the result** — write the data as JSON or CSV using `write_file`

## Output Formats

When saving scraped data, default to JSON unless the user requests otherwise:

### JSON Output
```json
{
  "source": "https://example.com",
  "scraped_at": "2026-01-01T00:00:00Z",
  "items": [
    { "title": "...", "url": "...", "description": "..." }
  ]
}
```

### CSV Output
Include headers in the first row. Use comma delimiters. Quote fields that contain commas.

## Rules

- Always tell the user what URL you're scraping before doing it
- Respect robots.txt — if the user asks to scrape a site that blocks bots, inform them
- Limit scraping to a reasonable number of pages (max 10 per session unless told otherwise)
- Extract only the data the user requested, not the entire page
- Clean the data: trim whitespace, remove HTML tags, normalize dates
- If the page requires JavaScript rendering, suggest using `browser_navigate` + `browser_screenshot` instead

## Tools Used

- `fetch_web_page` — Fetch and extract readable content from a URL
- `web_scrape` — Alternative fetch with content extraction
- `write_file` — Save results to the workspace
- `browser_navigate` — For JavaScript-heavy sites
- `browser_screenshot` — Capture visual state of a page
