/* Portfolio interactions — plain JavaScript, no dependencies. */

const $ = (id) => document.getElementById(id);

// ===== saved state =====
// Web Storage can throw (storage disabled, some private modes, quota full), so every read and
// write goes through this wrapper and the page simply forgets instead of breaking.
// One factory serves both localStorage and sessionStorage.
function makeStore(type) {
  const attempt = (fn, fallback) => {
    try {
      return fn(window[type]);
    } catch {
      return fallback;
    }
  };
  return {
    get: (key, fallback = null) => attempt((s) => s.getItem(key) ?? fallback, fallback),
    set: (key, value) => attempt((s) => s.setItem(key, value)),
    remove: (key) => attempt((s) => s.removeItem(key)),
    // JSON values: anything missing or damaged comes back as the fallback
    getJSON: (key, fallback) => attempt((s) => JSON.parse(s.getItem(key)) ?? fallback, fallback),
  };
}
const store = makeStore("localStorage");
const session = makeStore("sessionStorage");

// restart a CSS animation class even if it is already on the element
function replayAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

// ===== theme toggle =====
// The inline script in <head> already picked the theme before the first paint (saved choice,
// then the OS setting), so here we only sync the button with it.
const root = document.documentElement;
const themeToggle = $("themeToggle");
const themeIcon = $("themeIcon");

function applyTheme(theme) {
  root.dataset.theme = theme;
  const isLight = theme === "light";
  themeIcon.textContent = isLight ? "☀" : "☾";
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
}

applyTheme(root.dataset.theme === "light" ? "light" : "dark");

themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  applyTheme(next);
  store.set("theme", next);
});

// ===== greeting: local time of day, plus the visitor's name once they share it =====
const greetingEl = $("greeting");
const visitorForm = $("visitorForm");
const visitorInput = $("visitorName");
const visitorError = $("visitorError");
const visitorSaved = $("visitorSaved");
const hour = new Date().getHours();
const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

function renderVisitor(justSaved = false) {
  const name = store.get("visitorName");
  greetingEl.textContent = name ? `${timeGreeting}, ${name} — I'm` : `${timeGreeting} — I'm`;
  visitorForm.hidden = Boolean(name);
  visitorSaved.hidden = !name;
  if (name) {
    $("visitorShown").textContent = name;
    $("visitorHello").textContent = justSaved ? "Nice to meet you" : "Welcome back";
  }
}

visitorForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = visitorInput.value.trim().replace(/\s+/g, " ");
  // at least one letter in any alphabet, so Arabic names work too
  if (!/\p{L}/u.test(name)) {
    visitorError.textContent = "Please type a name (up to 40 characters).";
    replayAnimation(visitorForm, "shake");
    visitorInput.focus();
    return;
  }
  visitorError.textContent = "";
  store.set("visitorName", name);
  renderVisitor(true);
  $("visitorChange").focus();
});

$("visitorChange").addEventListener("click", () => {
  visitorInput.value = store.get("visitorName", "");
  visitorSaved.hidden = true;
  visitorForm.hidden = false;
  visitorInput.focus();
  visitorInput.select();
});

$("visitorForget").addEventListener("click", () => {
  store.remove("visitorName");
  visitorInput.value = "";
  renderVisitor();
  visitorInput.focus();
});

renderVisitor();

// ===== typed rotating roles in the hero =====
const roles = ["autonomous systems", "AI that ships", "drone tech", "scalable platforms", "embedded systems"];
const roleEl = $("roleText");
// the HTML already shows the first role, so the loop starts by pausing on it, then deleting
let roleIndex = 0;
let charIndex = roles[0].length;
let deleting = true;

function typeLoop() {
  const word = roles[roleIndex];
  charIndex += deleting ? -1 : 1;
  roleEl.textContent = word.slice(0, charIndex);

  let delay = deleting ? 45 : 85;
  if (!deleting && charIndex === word.length) {
    deleting = true;
    delay = 1400; // pause on the complete word before deleting it
  } else if (deleting && charIndex === 0) {
    deleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
  }
  setTimeout(typeLoop, delay);
}
setTimeout(typeLoop, 1400);

// ===== navigation: scrolled state, mobile menu, active link =====
const nav = $("nav");
const navLinks = $("navLinks");
const burger = $("burger");

const navAnchors = [...navLinks.querySelectorAll("a")];

const updateNavBg = () => nav.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", updateNavBg, { passive: true });
updateNavBg(); // the browser may restore a scrolled position on reload

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

burger.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || !navLinks.classList.contains("open")) return;
  setMenu(false);
  burger.focus();
});

// highlight the nav link of whichever section is in the middle of the viewport
// (sections without a link, like the hero, clear the highlight)
const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const href = `#${entry.target.id}`;
      navAnchors.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === href));
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("section[id]").forEach((section) => navObserver.observe(section));

// ===== reveal elements as they scroll into view =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ===== count the stat numbers up the first time they appear =====
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.dec || "0", 10);
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const step = target / 60;
      let current = 0;

      const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = prefix + current.toFixed(decimals) + suffix;
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".stat b").forEach((el) => counterObserver.observe(el));

// ===== projects: category filter + level + live search + sort (all apply together) =====
const filters = $("filters");
const levels = $("levels");
const levelIntro = $("levelIntro");
const projGrid = $("projGrid");
const projectCards = [...projGrid.querySelectorAll(".pcard")];
// the card text never changes, so lower-case it once instead of on every keystroke
const searchText = new Map(projectCards.map((card) => [card, card.textContent.toLowerCase()]));
const projEmpty = $("projEmpty");
const projEmptyTerm = $("projEmptyTerm");
const projSearch = $("projSearch");
const projSort = $("projSort");
const projCount = $("projCount");
let activeCategory = "all";
let activeLevel = "all";

const levelIntros = {
  all: "Everything I've built, from my first full-stack apps to platforms with real users.",
  beginner: "Where I started: smaller builds that taught me the basics of auth, databases and a clean web UI.",
  intermediate: "Self-directed projects that go deeper: simulations, swarm behaviour and a renderer written from scratch.",
  advanced: "Production-level work with real users, real-time control and AI running outside the lab.",
};

// data-date is "YYYY-MM", so plain string comparison already sorts it by time
const sorters = {
  newest: (a, b) => b.dataset.date.localeCompare(a.dataset.date),
  oldest: (a, b) => a.dataset.date.localeCompare(b.dataset.date),
  az: (a, b) => a.querySelector("h3").textContent.localeCompare(b.querySelector("h3").textContent),
};

// re-appending moves the existing nodes, so their listeners and state stay intact
function sortProjects() {
  const compare = sorters[projSort.value] || sorters.newest;
  projectCards.slice().sort(compare).forEach((card) => projGrid.append(card));
}

// one helper for both button groups: highlight the chosen button, update aria-pressed
function markPressed(group, key, value) {
  group.querySelectorAll(".filter").forEach((b) => {
    const active = b.dataset[key] === value;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
}

function setCategory(category) {
  const known = [...filters.querySelectorAll(".filter")].some((b) => b.dataset.filter === category);
  if (!known) category = "all";
  activeCategory = category;
  store.set("projFilter", category);
  markPressed(filters, "filter", category);
}

function setLevel(level) {
  if (!Object.hasOwn(levelIntros, level)) level = "all";
  activeLevel = level;
  store.set("projLevel", level);
  markPressed(levels, "level", level);
  levelIntro.textContent = levelIntros[level];
}

function updateProjects() {
  const raw = projSearch.value.trim();
  const term = raw.toLowerCase();
  let visible = 0;

  projectCards.forEach((card) => {
    const inCategory = activeCategory === "all" || card.dataset.category === activeCategory;
    const inLevel = activeLevel === "all" || card.dataset.level === activeLevel;
    const matches = !term || searchText.get(card).includes(term);
    const show = inCategory && inLevel && matches;
    if (show && card.hidden) replayAnimation(card, "pop");
    card.hidden = !show;
    if (show) visible++;
  });

  projCount.textContent =
    visible === projectCards.length
      ? `Showing all ${visible} projects`
      : `Showing ${visible} of ${projectCards.length} projects`;
  projEmptyTerm.textContent = raw ? `"${raw}"` : "these filters";
  projEmpty.hidden = visible > 0;
}

// one delegated listener per button group instead of one per button
function onGroupClick(group, handle) {
  group.addEventListener("click", (e) => {
    const button = e.target.closest(".filter");
    if (!button) return;
    handle(button);
    updateProjects();
  });
}

onGroupClick(filters, (button) => setCategory(button.dataset.filter));
onGroupClick(levels, (button) => {
  setLevel(button.dataset.level);
  replayAnimation(levelIntro, "show");
});

projSearch.addEventListener("input", updateProjects);

projSort.addEventListener("change", () => {
  store.set("projSort", projSort.value);
  sortProjects();
});

// restore the last sort, category and level (ignoring anything that is not a valid choice)
const savedSort = store.get("projSort");
if (Object.hasOwn(sorters, savedSort)) projSort.value = savedSort;
setCategory(store.get("projFilter", "all"));
setLevel(store.get("projLevel", "all"));
sortProjects();
updateProjects();

$("projReset").addEventListener("click", () => {
  projSearch.value = "";
  setCategory("all");
  setLevel("all");
  updateProjects();
  projSearch.focus();
});

// ===== collapsible sections (which ones are hidden is saved in localStorage) =====
function setSectionOpen(button, open) {
  $(button.getAttribute("aria-controls")).hidden = !open;
  button.setAttribute("aria-expanded", String(open));
  button.textContent = `${open ? "Hide" : "Show"} ${button.dataset.label}`;
}

const savedCollapsed = store.getJSON("collapsedSections", []);
const collapsed = new Set(Array.isArray(savedCollapsed) ? savedCollapsed : []);

document.querySelectorAll(".collapse-btn").forEach((button) => {
  setSectionOpen(button, !collapsed.has(button.dataset.section));

  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    setSectionOpen(button, open);
    collapsed[open ? "delete" : "add"](button.dataset.section);
    store.set("collapsedSections", JSON.stringify([...collapsed]));
    if (open && button.dataset.section === "github") loadReposOnce();
  });
});

// ===== latest public repos from the GitHub API =====
const ghStatus = $("ghStatus");
const ghList = $("ghList");
const ghRetry = $("ghRetry");

function setGhStatus(text, type = "") {
  ghStatus.textContent = text;
  ghStatus.className = `gh-status ${type}`.trim();
}

function repoCard(repo, index) {
  const link = document.createElement("a");
  link.href = repo.html_url;
  link.target = "_blank";
  link.rel = "noopener";

  const name = document.createElement("b");
  name.textContent = repo.name;

  const desc = document.createElement("p");
  desc.textContent = repo.description || "No description yet.";

  const meta = document.createElement("span");
  meta.className = "gh-meta";
  const updated = new Date(repo.pushed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  [repo.language, `★ ${repo.stargazers_count}`, `Updated ${updated}`]
    .filter(Boolean)
    .forEach((text) => {
      const item = document.createElement("span");
      item.textContent = text;
      meta.append(item);
    });

  link.append(name, desc, meta);
  const li = document.createElement("li");
  li.style.setProperty("--i", index);
  li.append(link);
  return li;
}

// a short sessionStorage cache, so reloading the page doesn't spend the 60-requests-an-hour limit
const GH_URL = "https://api.github.com/users/quhtani-x/repos?sort=pushed&per_page=12";
const GH_CACHE_KEY = "ghRepos";
const GH_CACHE_MS = 10 * 60 * 1000;

// a missing, damaged or old cache returns null and the repos are fetched again
function readRepoCache() {
  const cached = session.getJSON(GH_CACHE_KEY, null);
  return cached && Array.isArray(cached.repos) && Date.now() - cached.time < GH_CACHE_MS ? cached.repos : null;
}

// if storage is full or blocked, the next load simply fetches again
const writeRepoCache = (repos) => session.set(GH_CACHE_KEY, JSON.stringify({ time: Date.now(), repos }));

async function fetchRepos() {
  const response = await fetch(GH_URL);
  if (response.status === 403 || response.status === 429) {
    throw new Error("GitHub's hourly request limit was reached. Please try again in a few minutes.");
  }
  if (!response.ok) throw new Error(`GitHub answered with an error (${response.status}).`);

  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("GitHub sent an unexpected response.");

  // keep only the fields the cards use, so the cache stays small
  return data
    .filter((repo) => !repo.fork)
    .slice(0, 6)
    .map(({ name, html_url, description, language, stargazers_count, pushed_at }) => ({
      name, html_url, description, language, stargazers_count, pushed_at,
    }));
}

async function loadRepos() {
  ghRetry.hidden = true;
  ghList.replaceChildren();
  setGhStatus("Loading repositories…", "loading");

  try {
    let repos = readRepoCache();
    if (!repos) {
      repos = await fetchRepos();
      writeRepoCache(repos);
    }

    if (!repos.length) {
      setGhStatus("No public repositories to show yet.");
      return;
    }

    ghList.append(...repos.map(repoCard));
    setGhStatus("");
  } catch (err) {
    const offline = err instanceof TypeError;
    setGhStatus(
      offline
        ? "Couldn't reach GitHub. Check your internet connection, then try again."
        : `Couldn't load repositories: ${err.message}`,
      "error"
    );
    ghRetry.hidden = false;
  }
}

// the request is only made once the section is open, so a collapsed list costs nothing
let reposRequested = false;
function loadReposOnce() {
  if (reposRequested) return;
  reposRequested = true;
  loadRepos();
}

ghRetry.addEventListener("click", loadRepos);
if (!$("githubBody").hidden) loadReposOnce();

// ===== contact form validation (front-end only, no backend) =====
const form = $("contactForm");
const formStatus = $("formStatus");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const rules = {
  name: (value) => (value.length >= 2 ? "" : "Please enter your name (at least 2 characters)."),
  email: (value) => (emailPattern.test(value) ? "" : "Please enter a valid email address."),
  message: (value) => (value.length >= 10 ? "" : "Please write a message of at least 10 characters."),
};

function validateField(input) {
  const message = rules[input.id](input.value.trim());
  input.closest(".field").classList.toggle("invalid", Boolean(message));
  $(`${input.id}Error`).textContent = message;
  return !message;
}

// clear a field's error as soon as the visitor starts fixing it
Object.keys(rules).forEach((id) => {
  const input = $(id);
  input.addEventListener("input", () => {
    if (input.closest(".field").classList.contains("invalid")) validateField(input);
  });
  input.addEventListener("blur", () => {
    if (input.value.trim()) validateField(input);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formStatus.textContent = "";

  const inputs = Object.keys(rules).map((id) => $(id));
  const invalid = inputs.filter((input) => !validateField(input));

  if (invalid.length) {
    invalid.forEach((input) => replayAnimation(input.closest(".field"), "shake"));
    invalid[0].focus();
    return;
  }

  formStatus.textContent = `Thanks, ${$("name").value.trim()}! Your message is ready — I'll get back to you soon.`;
  replayAnimation(formStatus, "show");
  form.reset();
});

// ===== visit timer: time on the site this session, kept across reloads in sessionStorage =====
const visitTimer = $("visitTimer");
// goes through the safe wrapper: a blocked sessionStorage used to throw here and stop the timer
const visitStart = Number(session.get("visitStart")) || Date.now();
session.set("visitStart", String(visitStart));

function updateVisitTimer() {
  const seconds = Math.floor((Date.now() - visitStart) / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  visitTimer.textContent = `${mm}:${ss}`;
  visitTimer.setAttribute("datetime", `PT${seconds}S`);
}
updateVisitTimer();
setInterval(updateVisitTimer, 1000);

// ===== footer year =====
$("year").textContent = new Date().getFullYear();
