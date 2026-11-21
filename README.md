# Turki Andous — Portfolio (Assignment 3)

SWE363 Assignment 3: Advanced Functionality.

My portfolio from Assignment 2 with more advanced features on top: sorting, a level selector, saved visitor state, a visit timer, a cached GitHub feed and a performance pass. It is still plain HTML, CSS and JavaScript with no frameworks, no libraries and no build step.

| | |
| --- | --- |
| **Student** | Turki Andous, s202348490 |
| **Course** | SWE363 Web Engineering & Development, KFUPM |
| **Live site** | <https://quhtani-x.github.io/202348490-TurkiAndous-assignment3/> |
| **Repository** | <https://github.com/quhtani-x/202348490-TurkiAndous-assignment3> |
| **Assignment 2** | <https://github.com/quhtani-x/202348490-TurkiAndous-assignment2> |

## What's new in Assignment 3

**Sorting.** A "Sort" menu above the projects orders them by newest first, oldest first, or A–Z. Each card has a `data-date` and shows its month in the tag line. Sorting works together with the category filter, the level selector and the search box.

**Level selector.** Buttons for All, Beginner, Intermediate and Advanced show only the projects at that level (each card has a `data-level`). Each level has its own short intro message above the filters.

**Visit timer.** The footer shows how long you have been on the site this visit, in mm:ss. It keeps counting across reloads in the same tab and starts again in a new tab.

**Remembers you.**
- A small "What should I call you?" form in the hero. After you save a name the greeting says, for example, "Good evening, Sara — I'm". The name is kept in `localStorage`, and you can change it or press **Forget me** to delete it.
- The Skills, Experience and "Latest on GitHub" sections have show/hide buttons. The site remembers which ones you closed.
- Your last sort, category and level are restored when you come back.

**GitHub feed.** The "Latest on GitHub" list still has its loading, empty, error and "Try again" states. The result is now cached in `sessionStorage` for 10 minutes, so reloading the page doesn't use up GitHub's 60-requests-an-hour limit. If the section is hidden, nothing is requested until you open it.

**Performance.**
- The Google Fonts stylesheet no longer blocks the first paint.
- The hero portrait is loaded first, and the images further down load lazily. Every image has a width and height.
- I merged repeated CSS and JS.
- I fixed a footer colour-contrast problem.

Lighthouse scores are in the technical documentation.

**Code review and cleanup.** At the end the CSS and JavaScript were reviewed again with AI help (declared in the [AI usage report](docs/ai-usage-report-assignment3.md)), looking for bugs, unused and dead code, and anything that could be lighter without changing how the site looks or behaves:
- **Fixed:** the page was blank with JavaScript turned off, because the scroll-reveal hid everything until the script showed it. Now content is only hidden when the script is running.
- **Fixed:** light-theme visitors saw a flash of the dark theme on every load. A tiny script in `<head>` now picks the theme before the first paint.
- **Fixed:** on phones and tablets, keyboard users could tab into the closed (off-screen) menu. <kbd>Esc</kbd> now also returns focus to the menu button.
- **Fixed:** the visit timer could crash if `sessionStorage` was blocked. All storage now goes through one safe wrapper.
- **Fixed:** small glitches — the typing animation showed each finished word twice, the hero started with an empty role, the nav kept "About" highlighted after scrolling back to the top, and the nav background didn't appear when reloading halfway down the page.
- **Removed:** an unused colour variable, a duplicate animation selector, two separate `try/catch` cache helpers and a `readCollapsed()` helper (replaced by the shared wrapper), and four separate `[hidden]` rules (now one).
- **Lighter:** the project search lower-cases each card's text once instead of on every keystroke, the mobile menu uses one click listener instead of one per link, and repeated font declarations became a single `--font-head` variable.

### Still there from Assignments 1 and 2

- dark/light theme toggle: it follows your system setting on the first visit and remembers your choice
- category filter (All, AI & Autonomy, Web & Full-stack) and live search over the project cards, with a result count and an empty state that has a reset button
- time-of-day greeting and the typing animation in the hero
- navigation that highlights the current section, and a slide-out menu on phones and tablets (closes with <kbd>Esc</kbd>)
- stats that count up, sections that fade in on scroll
- contact form validation with inline errors (front-end only, nothing is sent)
- a "skip to content" link, visible focus rings, and full support for the "reduce motion" setting
- the page stays fully readable with JavaScript turned off

## Running it locally

```bash
git clone https://github.com/quhtani-x/202348490-TurkiAndous-assignment3.git
cd 202348490-TurkiAndous-assignment3
python3 -m http.server 8000
```

Open <http://localhost:8000>. There is nothing to install. VS Code's Live Server works too. You need an internet connection for the GitHub list and the fonts. Everything else works offline.

### Trying the new features

1. **Projects:** pick **Advanced**, then **AI & Autonomy**. Only *F1 Active Aero* is left. Change **Sort** to A–Z or Oldest first and watch the order change.
2. Reload the page. The level, category and sort you chose are still selected.
3. **Hero:** type your name and press **Save**. The greeting uses it. Reload, then try **Change name** and **Forget me**.
4. Press **Hide skills** (or Hide experience / Hide repositories) and reload. The section stays hidden until you press **Show**.
5. **Footer:** watch the visit timer. It keeps counting after a reload.
6. **GitHub error:** in DevTools → Network, choose "Offline" and run `sessionStorage.clear()` in the console (to skip the cache). Then reload. You'll see the error message and **Try again**. Go back online and press it.

## Folder structure

```
├── index.html
├── css/styles.css
├── js/script.js
├── assets/
│   ├── resume.pdf
│   └── images/
│       ├── profile.jpg
│       └── projects/      (one SVG per project card)
└── docs/
    ├── ai-usage-report.md              (cumulative, all assignments)
    ├── ai-usage-report-assignment3.md  (Assignment 3 only)
    └── technical-documentation.md
```

How each feature works, the saved-state keys, the API error handling and the performance results are in [`docs/technical-documentation.md`](docs/technical-documentation.md).

## AI use

How AI tools were used in this assignment is documented in [`docs/ai-usage-report-assignment3.md`](docs/ai-usage-report-assignment3.md). The cumulative report for Assignments 2 and 3 together is [`docs/ai-usage-report.md`](docs/ai-usage-report.md).

## Deployment

The site is deployed with GitHub Pages from the `main` branch (root folder): <https://quhtani-x.github.io/202348490-TurkiAndous-assignment3/>
