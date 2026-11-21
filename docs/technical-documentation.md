# Technical Documentation

**Assignment 3 — Advanced Functionality**
**Student:** Turki Andous (s202348490) · **Course:** SWE363, KFUPM

---

## 1. Overview

A static, single-page personal portfolio built with HTML5, CSS3 and vanilla
JavaScript. It has no dependencies, no build step and no backend: the browser
loads three files and runs.

Assignment 3 builds on the Assignment 2 site. What changed:

| Area | Assignment 2 | Assignment 3 |
| --- | --- | --- |
| Projects | Category filter and live search | Plus **sorting** (newest, oldest, A–Z) and a **level selector** (All, Beginner, Intermediate, Advanced) with a different intro per level |
| State | Only the theme was saved | Visitor name, collapsed sections, last sort, category and level are saved in `localStorage`. The visit start time and a GitHub cache are kept in `sessionStorage` |
| UI | — | Name form with change/forget, show/hide buttons on three sections, a visit timer in the footer |
| GitHub API | Fetched on every load | Cached for 10 minutes, only requested when its section is open, 429 and malformed responses handled |
| Performance | — | Non-blocking fonts, a high-priority hero image, merged CSS/JS, a contrast fix. Lighthouse results are in section 7 |

| Property | Value |
| --- | --- |
| Type | Static single-page site |
| Dependencies | None (Google Fonts and the GitHub API are the only external requests) |
| Build step | None |
| Backend | None — the contact form is validated client-side only |
| Page weight | About 200 KB on first load (Lighthouse "total byte weight"), most of it the portrait and the fonts |

### Architecture

Each file has exactly one job:

```
index.html   →  structure and content   (what the page says)
styles.css   →  presentation            (what the page looks like)
script.js    →  behaviour               (what the page does)
```

All visible content lives in `index.html`. JavaScript only filters, sorts,
shows/hides and fills in the few dynamic parts (greeting, typed role, repo
cards, timer). If the script fails, the page still shows all of its content.

`js/script.js` is loaded with `defer`, so it runs after the HTML is parsed and
needs no `DOMContentLoaded` wrapper. It is organised into blocks, top to bottom:

| Block | Purpose |
| --- | --- |
| Saved state | `store` wrapper around `localStorage` (section 4) |
| Theme toggle | Dark/light theme |
| Greeting | Time-of-day greeting and the visitor name form |
| Typed roles | Typewriter effect in the hero |
| Navigation | Scrolled state, mobile menu, active link |
| Reveal / counters | Scroll-in animations and counting stats |
| Projects | Category filter, level selector, search, sort |
| Collapsible sections | Show/hide buttons |
| GitHub repos | Fetch, cache and render the latest repositories |
| Contact form | Validation |
| Visit timer | Session timer in the footer |

---

## 2. File structure

```
202348490-TurkiAndous-assignment3/
├── index.html                      # 7 sections + nav + footer
├── README.md
├── .gitignore
├── css/
│   └── styles.css                  # tokens → base → components → responsive → reduced motion
├── js/
│   └── script.js                   # the blocks listed above
├── assets/
│   ├── resume.pdf
│   └── images/
│       ├── profile.jpg             # 600×900, 57 KB
│       └── projects/               # 7 SVG thumbnails, about 1 KB each
└── docs/
    ├── ai-usage-report.md
    └── technical-documentation.md
```

---

## 3. Features and their logic

### 3.1 Projects: filter, level, search and sort together

Every project card carries its data as attributes:

```html
<article class="pcard" data-category="ai" data-date="2026-05" data-level="advanced">
```

Three controls decide **which** cards are visible, and one decides their
**order**. A card is shown only when all three filters agree:

```js
const inCategory = activeCategory === "all" || card.dataset.category === activeCategory;
const inLevel = activeLevel === "all" || card.dataset.level === activeLevel;
const matches = !term || card.textContent.toLowerCase().includes(term);
card.hidden = !(inCategory && inLevel && matches);
```

- **Category** (All, AI & Autonomy, Web & Full-stack) and **level** (All,
  Beginner, Intermediate, Advanced) are button groups. Each group has one
  delegated click listener (`onGroupClick`), and both use one helper,
  `markPressed`, to set the `active` class and `aria-pressed`.
- **Search** runs on every `input` event over the card's whole text (title,
  description, tech chips, date).
- **Sort** is a `<select>` with three options. `sortProjects()` sorts a copy of
  the card list and re-appends the cards to the grid in that order. Appending an
  element that is already in the DOM moves it, so no card is re-created:

  ```js
  const sorters = {
    newest: (a, b) => b.dataset.date.localeCompare(a.dataset.date),
    oldest: (a, b) => a.dataset.date.localeCompare(b.dataset.date),
    az: (a, b) => a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent),
  };
  ```

  `data-date` uses the `YYYY-MM` format, so plain string comparison sorts by
  time. Sorting doesn't change which cards are hidden, so it works with any
  filter or search.
- The featured card spans the full grid width. `grid-auto-flow: dense` stops it
  from leaving an empty gap when sorting moves it into the middle of the list.
- A result count ("Showing 3 of 7 projects") is in an `aria-live` region. When
  nothing matches, an empty state offers **Show all projects**, which clears the
  search and resets the category and level to All.

**Levels and intro messages.** Each level has its own sentence in a
`levelIntros` object, shown above the filters (also `aria-live`). Levels are
assigned as follows:

| Level | Projects |
| --- | --- |
| Beginner | Banking System |
| Intermediate | UAV Swarm Formation, Natural Selection, Bender |
| Advanced | Petroly AIO, F1 Active Aero, Thaka |

### 3.2 Visitor name

A small form in the hero asks "What should I call you?".

1. On submit, the value is trimmed and repeated spaces are collapsed. It must
   contain at least one letter (`/\p{L}/u`, so Arabic and other alphabets
   work). The input has `maxlength="40"`. An invalid entry shows an inline
   error (`role="alert"`) and shakes the field.
2. A valid name is saved under `visitorName`. `renderVisitor()` then hides the
   form, shows "Nice to meet you, *name*!" with **Change name** and **Forget me**
   buttons, and rewrites the hero greeting, e.g. "Good evening, Sara — I'm".
   On later visits the message reads "Welcome back, *name*!".
3. **Change name** shows the form again with the current name selected.
   **Forget me** removes the key and returns to the empty form.

The name is only ever written with `textContent`, so typing HTML into the field
shows it as plain text and never runs it. Focus moves to a sensible control
after each action, so keyboard users are not lost.

### 3.3 Collapsible sections

Skills, Experience and "Latest on GitHub" each have a toggle button:

```html
<button class="collapse-btn" aria-expanded="true" aria-controls="skillsBody"
        data-section="skills" data-label="skills">Hide skills</button>
```

`setSectionOpen()` sets `hidden` on the controlled element, updates
`aria-expanded` and changes the label between "Hide …" and "Show …". The ids of
the closed sections are stored as a JSON array under `collapsedSections` and
reapplied on load. A damaged or non-array value is ignored, and every section
then starts open.

If the GitHub section starts closed, the API is not called at all. The first
time it is opened, `loadReposOnce()` makes the request.

### 3.4 Visit timer

On the first page load of a tab, `Date.now()` is saved in `sessionStorage`
under `visitStart`. Every second the footer shows the time since then as
`mm:ss` (minutes keep counting past 59, e.g. `75:03`). Because it is
`sessionStorage`, reloading keeps the count, and a new tab starts from zero. The
value is inside a `<time datetime="PT…S">` element. It is not in a live region,
so screen readers are not interrupted every second.

### 3.5 Theme toggle (from Assignment 1)

The theme is stored under `theme`. Order of preference: saved choice → OS
`prefers-color-scheme` → dark. `applyTheme()` sets `<html data-theme>` and keeps
the button's `aria-pressed` and `aria-label` in sync. The light theme only
redefines the CSS colour tokens, so every component works in both themes.

### 3.6 Contact form validation (from Assignment 1)

The form has `novalidate` and is checked by a `rules` object keyed by input id:
name ≥ 2 characters, email matching `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`, message
≥ 10 characters. Errors are linked with `aria-describedby`, clear as the visitor
types, and the first invalid field gets focus. Nothing is sent anywhere.

---

## 4. Saved state

All `localStorage` access goes through a small `store` wrapper (`get`, `set`,
`remove`) that catches exceptions. If storage is blocked, for example in some
private modes, the site just doesn't remember anything, and nothing breaks.
Every value read back is validated before use (`Object.hasOwn` against the known
options), so an edited or stale value falls back to the default.

| Storage | Key | Value | Used by |
| --- | --- | --- | --- |
| `localStorage` | `theme` | `"dark"` or `"light"` | Theme toggle |
| `localStorage` | `visitorName` | The saved name (string) | Greeting and visitor form |
| `localStorage` | `projFilter` | `"all"`, `"ai"` or `"web"` | Category filter |
| `localStorage` | `projLevel` | `"all"`, `"beginner"`, `"intermediate"` or `"advanced"` | Level selector |
| `localStorage` | `projSort` | `"newest"`, `"oldest"` or `"az"` | Sort menu |
| `localStorage` | `collapsedSections` | JSON array, e.g. `["skills","github"]` | Show/hide buttons |
| `sessionStorage` | `visitStart` | Timestamp in ms | Visit timer |
| `sessionStorage` | `ghRepos` | `{ "time": ms, "repos": [...] }` | GitHub cache |

The search text is deliberately **not** saved: coming back to a page that hides
most projects because of an old search would be confusing.

---

## 5. GitHub API and error handling

`loadRepos()` shows the latest six non-fork public repositories from
`https://api.github.com/users/quhtani-x/repos?sort=pushed&per_page=12`.

1. Show "Loading repositories…" with a spinner and hide the retry button.
2. Look in `sessionStorage` (`ghRepos`). If there is an entry younger than 10
   minutes, use it and skip the network.
3. Otherwise `fetchRepos()` calls the API, drops forks, keeps six, and maps each
   repo to only the six fields the cards use (name, URL, description, language,
   stars, last push), which keeps the cache small. The result is cached.
4. Render the cards with `createElement` and `textContent` (never `innerHTML`),
   so a repo description cannot inject markup.

| Situation | How it is detected | What the visitor sees |
| --- | --- | --- |
| Loading | — | "Loading repositories…" + spinner |
| Success | `response.ok` and an array | Up to six repo cards |
| No repos | Empty array after filtering | "No public repositories to show yet." |
| Offline / DNS / CORS failure | `fetch` rejects with a `TypeError` | "Couldn't reach GitHub. Check your internet connection, then try again." + **Try again** |
| Rate limit | HTTP 403 or 429 | Explains the hourly limit + **Try again** |
| Other HTTP error | `!response.ok` | "GitHub answered with an error (status)." + **Try again** |
| Unexpected body | JSON is not an array | "GitHub sent an unexpected response." + **Try again** |

`response.ok` is checked explicitly because `fetch` only rejects on network
failure, not on a 404 or 500. Errors are never cached, so **Try again** always
makes a fresh request. Reading or writing the cache is wrapped in `try/catch`.
A damaged cache entry is simply fetched again.

---

## 6. Accessibility

- Landmarks (`header`, `nav`, `main`, `section`, `footer`) and a skip link as
  the first focusable element.
- Every input has a `<label>`. The sort menu has a visible label, and the search
  box has a screen-reader-only one.
- Toggle buttons report their state: `aria-pressed` on the filter, level and
  theme buttons, `aria-expanded` + `aria-controls` on the show/hide buttons and
  the mobile menu.
- Result count, level intro, form status and GitHub status are live regions.
  The visit timer is deliberately not one.
- The arrow on the show/hide buttons is CSS content with empty alt text
  (`content: "▴" / ""`), so it isn't read out.
- Visible focus rings on all controls. Under `prefers-reduced-motion: reduce`,
  every animation and transition is turned off.
- Lighthouse accessibility: 100 (section 7).

---

## 7. Performance

### What was done

| Change | Why |
| --- | --- |
| Google Fonts stylesheet loaded with `media="print" onload="this.media='all'"`, plus `preload` and a `<noscript>` fallback | It was the main render-blocking request. Text now paints at once in the system font and swaps when the fonts arrive (`display=swap`) |
| `fetchpriority="high"` on the hero portrait, which is never lazy-loaded | It is above the fold, so it should load first |
| `loading="lazy"` and `decoding="async"` on the eight images below the fold | Off-screen images don't compete with the first paint |
| `width` and `height` on every `<img>` | The browser reserves space, so the layout doesn't jump (CLS stays below 0.02) |
| `defer` on the script | The HTML is parsed without waiting for JavaScript |
| GitHub request cached for 10 minutes and skipped while its section is hidden | Fewer network requests and less risk of the rate limit |
| Passive scroll listener | Scrolling never waits for the handler |
| Repeated code merged: one shared hover transition for three card types, a `--i` custom property for the repo-card stagger instead of five `nth-child` rules, one click helper and one pressed-state helper for both button groups | Less code to download and maintain |
| Footer text no longer dimmed with `opacity` | It failed WCAG colour contrast in the light theme |

I checked every class and id in the stylesheet against the HTML and script.
None were unused, so no dead CSS was left to remove.

### Lighthouse results

Lighthouse 12.8.2, run from the command line against the local
`python3 -m http.server`, in headless Chrome.

| Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mobile — before the performance pass | 95 | 96 | 100 | 100 | 1.7 s | 2.8 s | 0.015 |
| Mobile — after | **99** | **100** | 100 | 100 | 0.9 s | 2.2 s | 0.018 |
| Desktop — before | 98 | 96 | 100 | 100 | 0.6 s | 1.0 s | 0.006 |
| Desktop — after | **100** | **100** | 100 | 100 | 0.3 s | 0.6 s | 0.006 |

Total blocking time was 0 ms in every run.

### What is left

Lighthouse still lists text compression, cache headers and minification. The
first two are server settings: Python's test server sends neither, while GitHub
Pages serves files gzip-compressed and with cache headers. Minification would
need a build step, which this project deliberately avoids. The portrait could
also be served as a smaller WebP, which Lighthouse estimates would save about
25 KB.

---

## 8. Browser support

| Feature | Minimum support |
| --- | --- |
| CSS Grid, Flexbox, custom properties, `clamp()`, `aspect-ratio` | All major browsers since 2021 |
| `IntersectionObserver`, `fetch`, `async`/`await` | Chrome 58+, Firefox 55+, Safari 12.1+ |
| `Object.hasOwn` | Chrome 93+, Firefox 92+, Safari 15.4+ |
| Unicode property escapes (`\p{L}`) | Chrome 64+, Firefox 78+, Safari 11.1+ |
| `fetchpriority`, CSS `content` alt text | Newer browsers. Older ones ignore them, and the plain `content: "▴"` declaration before it is the fallback |
| `backdrop-filter` | Chrome 76+, Safari 9+ (`-webkit-` prefix included). Without it the nav keeps a solid tinted background |

---

## 9. Testing performed

The site was served with `python3 -m http.server` and tested with scripted
headless Chrome (Playwright) plus screenshots.

| Test | Method | Result |
| --- | --- | --- |
| Sorting | Newest, A–Z, Oldest, then Oldest + AI filter, then + search "swarm" | Correct order each time. Filters and search still apply |
| Level selector | Each level, then Advanced + AI, then Beginner + AI | 1 / 3 / 3 cards with the right intro. F1 only. Empty state. Reset restores all 7 |
| Remembered choices | Picked A–Z + Web + Advanced, reloaded. Then wrote bogus values into storage and reloaded | Choices restored. Bogus values fall back to defaults with no errors |
| Visitor name | Empty submit, "  Sara   Ali ", reload, change to an Arabic name, forget, an HTML string | Error and focus. Saved as "Sara Ali". "Welcome back". Arabic works. Key removed. HTML shown as text |
| Collapsible sections | Hid all three, reloaded, opened GitHub, then stored invalid JSON | Stayed hidden with no API request. Opening fetched 6 repos. Invalid JSON → all open |
| Visit timer | Waited 2 s, reloaded, set the start 754 s in the past | 00:02, still 00:02 after the reload, 12:34 |
| GitHub — success and cache | Load, then reload | 6 cards. The reload made no new request |
| GitHub — failures | Intercepted the API: network abort, 403, 404, `[]`, a non-array body. Then removed the block and pressed **Try again** | The matching message for each, retry shown for errors only. The retry loaded 6 cards |
| Layout | 1440×900 and 375×812, dark and light | No horizontal scroll. Controls wrap cleanly on the phone |
| Console | Every test above | No errors or warnings on a normal load. The only messages were the browser's own network errors during the simulated failures |

---

## 10. Known limitations

- **The contact form does not send anything.** A form service or serverless
  function would be needed.
- **Project dates are approximate months** I chose so sorting has real data.
  They are in the `data-date` attributes and the visible `<time>` tags.
- **Thumbnails are placeholder artwork**, not screenshots of the projects.
- **The GitHub API allows 60 unauthenticated requests per hour per IP.** The
  cache reduces this, but a visitor on a shared network can still hit the
  rate-limit message.
