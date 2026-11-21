# AI Usage Report

**Assignment 3 — Advanced Functionality**
**Student:** Turki Andous (s202348490) · **Course:** SWE363, KFUPM

This report covers only Assignment 3. The cumulative report for all assignments
is in [`ai-usage-report.md`](ai-usage-report.md).

---

## 1. Tool used

| | |
| --- | --- |
| **Tool** | Claude Code |
| **Provider** | Anthropic |
| **How I accessed it** | Terminal coding assistant that can read and edit the project files |

## 2. Model

| | |
| --- | --- |
| **Model** | Claude Opus 5.5 |
| **Dates used** | 2026-11-21 |

## 3. What it was used for

- **Code review and cleanup.** I asked it to revise my CSS, my JavaScript and
  everything else in the project: check for errors, unused code and dead code,
  and improve the code and make it lighter where that would not affect quality.
  It changed `css/styles.css`, `js/script.js` and `index.html`:
  - **Bugs fixed:** the page was blank with JavaScript turned off (the
    scroll-reveal hid everything), light-theme visitors saw a flash of the dark
    theme on every load, keyboard users could tab into the closed mobile menu,
    the visit timer could crash if `sessionStorage` was blocked, the typing
    animation showed each word twice, the hero role started empty, "About" stayed
    highlighted after scrolling back to the top, and the nav background was
    missing after a mid-page reload.
  - **Unused / dead code removed:** the unused `--accent3` variable, a duplicate
    `.pop` animation selector, the `readCollapsed()` helper and two `try/catch`
    cache helpers (replaced by one shared storage wrapper, `makeStore()`), and
    four separate `[hidden]` rules merged into one.
  - **Made lighter:** project search text is lower-cased once instead of on every
    keystroke, one click listener replaces one per mobile-menu link, repeated
    font declarations became a `--font-head` variable, and repeated
    `document.getElementById` calls use a short `$()` helper.
- **Documentation.** It updated `README.md` and
  `docs/technical-documentation.md` to describe the changes.
- **AI usage reports.** It turned `docs/ai-usage-report.md` into a cumulative
  report (Assignment 2 and Assignment 3 sections) and wrote this
  Assignment 3–only report.

**What I did myself:** I decided what to ask for: the scope of the review (CSS,
JavaScript, errors, unused and dead code, lighter code without losing quality),
updating the README, and keeping a cumulative AI report plus this separate
Assignment 3 report for submission.

**How I checked the output:** The AI kept a backup of the original files, then
tested the site in a headless Chrome browser: the theme toggle and saved theme,
saving and reloading the visitor name, the level and category filters, search,
the empty state and reset, sorting, the GitHub list (a mocked success and a
mocked 403 error), show/hide sections, contact form errors and success, the
visit timer, the mobile menu (Esc and tab order), the page with JavaScript
turned off, and the page with storage blocked. Every check passed with no
console errors.

## 4. Usage log

| # | Date | What I asked for | What I got | What I kept or changed |
| --- | --- | --- | --- | --- |
| 1 | 2026-11-21 | Revise my CSS, JS and everything else: check for errors, unused and dead code, improve the code and make it lighter where it won't affect quality, then update the README and my AI usage declaration | 8 bug fixes, unused code removed, lighter JS/CSS, an updated README and technical documentation, and a new entry in the AI report | Kept all of it after the browser tests passed |
| 2 | 2026-11-21 | Make the AI report cumulative (Assignment 2, Assignment 3, …), plus a separate Assignment 3–only report with today's date, then commit and push | The cumulative `ai-usage-report.md` and this file | Kept |

## 5. What I learned

✏️ [Write a few sentences in your own words before submitting]

## 6. Declaration

I declare that the use of AI tools in this assignment is fully and honestly
described above. I reviewed, tested and understand all of the submitted work,
and I take responsibility for it.

**Name:** Turki Andous
**Student ID:** s202348490
**Date:** 2026-11-21
