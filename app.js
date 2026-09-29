let D;
try {
  D = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || "{}"));
} catch (x) {
  D = JSON.parse(JSON.stringify(DEF));
}
const ensureOptionalSections = () => {
  D.assistant = Object.assign(
    {
      enabled: false,
      title: "Ask about my work",
      prompt: "Ask about my research →",
      endpoint: "",
      description:
        "No backend is configured yet. Add an API endpoint to enable this feature.",
    },
    D.assistant || {},
  );
  D.currently = Object.assign({ enabled: false, items: [] }, D.currently || {});
  D.currently.items = Array.isArray(D.currently.items) ? D.currently.items : [];
  D.github = Object.assign(
    {
      enabled: false,
      username: "",
      showRecent: true,
      repoCount: "",
      activityNote: "",
    },
    D.github || {},
  );
  D.projects = Object.assign({ enabled: false, items: [] }, D.projects || {});
  D.projects.items = Array.isArray(D.projects.items) ? D.projects.items : [];
  D.reading = Object.assign({ enabled: false, items: [] }, D.reading || {});
  D.reading.items = Array.isArray(D.reading.items) ? D.reading.items : [];
  D.experiments = Object.assign(
    { enabled: false, items: [] },
    D.experiments || {},
  );
  D.experiments.items = Array.isArray(D.experiments.items)
    ? D.experiments.items
    : [];
  D.demos = Object.assign({ enabled: false, items: [] }, D.demos || {});
  D.demos.items = Array.isArray(D.demos.items) ? D.demos.items : [];
};
ensureOptionalSections();
const OPTIONAL_DEFAULTS_MIGRATION = "sma_optional_defaults_v7";
try {
  if (localStorage.getItem(OPTIONAL_DEFAULTS_MIGRATION) !== "1") {
    const storedData = JSON.parse(localStorage.getItem(KEY) || "{}");
    const savedData =
      storedData && typeof storedData === "object" ? storedData : {};
    if (!D.github.username) {
      D.github.username = DEF.github.username;
      D.github.enabled = true;
    }
    const previousBookSeeds = new Set([
      "1984",
      "Brave New World",
      "The Stranger",
      "Siddhartha",
    ]);
    if (
      !D.reading.items.length ||
      D.reading.items.some((item) => previousBookSeeds.has(item.title))
    ) {
      D.reading.items = JSON.parse(JSON.stringify(DEF.reading.items));
      D.reading.enabled = true;
    }
    if (!D.demos.items.length) {
      D.demos.items = JSON.parse(JSON.stringify(DEF.demos.items));
    }
    D.demos.enabled = true;
    savedData.demos = D.demos;
    localStorage.setItem(KEY, JSON.stringify(savedData));
    D.assistant.enabled = true;
    localStorage.setItem(OPTIONAL_DEFAULTS_MIGRATION, "1");
  }
} catch (x) {}
const DELETED_POSTS_KEY = KEY + "_deleted_posts";
const deletedPosts = () => {
  try {
    const slugs = JSON.parse(localStorage.getItem(DELETED_POSTS_KEY) || "[]");
    return Array.isArray(slugs) ? slugs : [];
  } catch (x) {
    return [];
  }
};
const markPostDeleted = (slug) => {
  if (!slug) return;
  try {
    localStorage.setItem(
      DELETED_POSTS_KEY,
      JSON.stringify([...new Set([...deletedPosts(), slug])]),
    );
  } catch (x) {}
};
const S = {
  news: ["date", "text"],
  education: ["title", "place", "period"],
  experience: ["title", "place", "period", "desc"],
  pubs: ["abbr", "title", "authors", "venue", "year", "doi", "pdf"],
  awards: ["title", "by", "year"],
  training: ["title", "place", "period"],
  skills: ["cat", "items"],
  teaching: ["course", "place", "period"],
};
const TA = ["text", "desc", "authors", "items"],
  LS = ["education", "experience", "awards", "training", "teaching"];
const $ = (s) => document.querySelector(s);
const e = (s) =>
  String(s || "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const bio = () =>
  D.bio
    .split(/\n\n+/)
    .map((p) => `<p>${e(p)}</p>`)
    .join("");
const SV = (p) =>
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px">${p}</svg>`;
const IC = {
  cap: '<path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5"/>',
  job: '<path d="M3 7h18v13H3zM9 7V4h6v3"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8 14l-2 8 6-3 6 3-2-8"/>',
  code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
  news: '<path d="M4 4h16v16H4zM8 9h8M8 13h8"/>',
  book: '<path d="M4 4h7v16H4zM13 4h7v16h-7z"/>',
  mail: '<path d="M3 5h18v14H3zM3 6l9 7 9-7"/>',
  in: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v6M8 8v.01M12 17v-6M12 13c0-3 5-3 5 0v4"/>',
  orcid:
    '<circle cx="12" cy="12" r="9"/><path d="M9 8v8M12 8h1.5a4 4 0 010 8H12z"/>',
  star: '<path d="M12 3l3 6 6 1-4.5 4.5L18 21l-6-3-6 3 1.5-6.5L3 10l6-1z"/>',
};
const H = (i, t) => `<h2>${SV(IC[i])} ${t}</h2>`;
const socials = () =>
  [
    [D.email && "mailto:" + D.email, "mail", "Email"],
    [D.orcid && "https://orcid.org/" + D.orcid, "orcid", "ORCID"],
    [D.scholar, "cap", "Scholar"],
    [D.linkedin, "in", "LinkedIn"],
  ]
    .filter((x) => x[0])
    .map(
      (x) =>
        `<a class="sb" href="${e(x[0])}" target="_blank" rel="noopener">${SV(IC[x[1]])} ${x[2]}</a>`,
    )
    .join("");
const pal = (n) => {
  let h = 0;
  for (const c of n) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
};
const LOGO = {
  "University of Dhaka": "logos/du.png",
  "East West University": "logos/ewu.png",
  "Prime University": "logos/pu.png",
};
const lg = (x) => {
  const n = (x.place || x.by || "").split(",")[0];
  if (!n) return "";
  const a = n.match(/\(([A-Z]{2,})\)/);
  const t = a
    ? a[1]
    : /^[A-Z]{2,5}$/.test(n)
      ? n
      : n
          .replace(/\(.*?\)/g, "")
          .split(/\s+/)
          .filter((w) => /^[A-Z]/.test(w))
          .map((w) => w[0])
          .join("")
          .slice(0, 4);
  const fb = `<div class="lg" style="background:hsl(${pal(n)},55%,38%)" title="${e(n)}">${e(t)}</div>`;
  const src = x.logo || LOGO[n];
  if (!src) return fb;
  return `<img class="lg" src="${e(src)}" alt="" loading="lazy" data-fb="${e(fb)}" onerror="this.outerHTML=this.dataset.fb">`;
};
const affs = () => {
  const seen = {};
  return [...D.education, ...D.experience]
    .filter((x) => x.place && !seen[x.place] && (seen[x.place] = 1))
    .map((x) => `<div class="af">${lg(x)}<span>${e(x.place)}</span></div>`)
    .join("");
};
const rows = (a, f) => (Array.isArray(a) ? a.map(f).join("") : "");
const slugify = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "item";
const getPubSlug = (p) => slugify(p.slug || p.title || "publication");
const makeBibtex = (p) => {
  if (p.bibtex && p.bibtex.trim()) return p.bibtex.trim();
  const key = slugify(p.title || p.abbr || "publication");
  const year = (p.year || "n.d.").replace(/[^0-9A-Za-z]/g, "");
  const authors = (p.authors || "")
    .split(/,\s*|\s+and\s+/)
    .filter(Boolean)
    .map((a) => a.trim())
    .join(" and ");
  return `@article{${key}${year},\n  title = {${(p.title || "").replace(/[{}]/g, "").trim()}},\n  author = {${authors}},\n  journal = {${(p.venue || "").replace(/[{}]/g, "").trim()}},\n  year = {${p.year || "n.d."}}\n}`;
};
const renderPublicationActions = (pub) => {
  const items = [
    [pub.pdf, "PDF"],
    [pub.doi, "DOI"],
    [pub.code, "Code"],
    [pub.dataset, "Dataset"],
  ].filter(([url]) => !!url && String(url).trim());
  const citeBtn = `<button class="action-btn" type="button" data-cite="${e(makeBibtex(pub))}">Cite</button>`;
  const links = items
    .map(
      ([url, label]) =>
        `<a href="${e(url)}" target="_blank" rel="noopener">${e(label)}</a>`,
    )
    .join("");
  return `<div class="pub-actions">${links}${citeBtn}</div>`;
};
const normalizeChartData = (value) => {
  if (!value) return null;
  let chart = value;
  if (typeof chart === "string") {
    try {
      chart = JSON.parse(chart);
    } catch (x) {
      return null;
    }
  }
  if (!chart || typeof chart !== "object") return null;
  const labels = Array.isArray(chart.labels) ? chart.labels : [];
  const values = Array.isArray(chart.values) ? chart.values : [];
  if (!labels.length && !values.length) return null;
  return {
    type: chart.type || "bar",
    title: chart.title || "Results",
    labels: labels.length ? labels : values.map((_, i) => `Item ${i + 1}`),
    values: values.length ? values.map((v) => Number(v) || 0) : [0],
    series:
      Array.isArray(chart.series) && chart.series.length
        ? chart.series
        : ["Value"],
  };
};
const renderChartHtml = (spec) => {
  const chart = normalizeChartData(spec);
  if (!chart) return "";
  return `<div class="chart-panel"><div class="sub">${e(chart.title)}</div><canvas class="chart-canvas" data-chart='${e(JSON.stringify(chart))}' width="640" height="240"></canvas></div>`;
};
const drawChartToCanvas = (canvas, rawChart) => {
  if (!canvas || !rawChart) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const style = getComputedStyle(document.documentElement);
  const fg = style.getPropertyValue("--fg").trim() || "#111";
  const acc = style.getPropertyValue("--acc").trim() || "#b509ac";
  const line = style.getPropertyValue("--line").trim() || "#e5e5e5";
  const chart = normalizeChartData(rawChart);
  if (!chart) return;
  const values = chart.values.map((n) => Number(n) || 0);
  const max = Math.max(...values, 1);
  const pad = { t: 20, r: 18, b: 36, l: 36 };
  const w = canvas.width || 640;
  const h = canvas.height || 240;
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (innerH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.l, y);
    ctx.lineTo(w - pad.r, y);
    ctx.stroke();
  }
  if (chart.type === "line") {
    ctx.beginPath();
    values.forEach((value, index) => {
      const x = pad.l + (index / Math.max(values.length - 1, 1)) * innerW;
      const y = pad.t + innerH - (value / max) * innerH;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = acc;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    values.forEach((value, index) => {
      const x = pad.l + (index / Math.max(values.length - 1, 1)) * innerW;
      const y = pad.t + innerH - (value / max) * innerH;
      ctx.beginPath();
      ctx.fillStyle = acc;
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    const barW = (innerW / Math.max(values.length, 1)) * 0.72;
    values.forEach((value, index) => {
      const x = pad.l + (innerW / Math.max(values.length, 1)) * index + 8;
      const hVal = (value / max) * innerH;
      const y = pad.t + innerH - hVal;
      ctx.fillStyle = acc;
      ctx.fillRect(x, y, barW, hVal);
    });
  }
  ctx.fillStyle = fg;
  ctx.font = "11px sans-serif";
  chart.labels.forEach((label, index) => {
    const x =
      pad.l +
      (innerW / Math.max(chart.labels.length, 1)) * index +
      innerW / Math.max(chart.labels.length, 1) / 2;
    ctx.fillText(String(label).slice(0, 10), x - 14, h - 12);
  });
};
const openBibtexModal = (bibtex) => {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-box">
      <div class="cite-actions">
        <h3 style="margin:0">BibTeX</h3>
        <button class="b g" type="button" data-close-bib>Close</button>
      </div>
      <textarea readonly>${e(bibtex || "")}</textarea>
      <div class="cite-actions" style="margin-top:12px">
        <button class="b" type="button" data-copy-bib>Copy BibTeX</button>
        <span class="copy-status" data-copy-status>Ready to copy</span>
      </div>
    </div>
  `;
  const status = modal.querySelector("[data-copy-status]");
  modal.querySelector("[data-close-bib]").onclick = () => modal.remove();
  modal.querySelector("[data-copy-bib]").onclick = async () => {
    try {
      await navigator.clipboard.writeText(bibtex || "");
      status.textContent = "Copied!";
    } catch (x) {
      status.textContent = "Copy failed — select the text manually.";
    }
  };
  modal.onclick = (event) => {
    if (event.target === modal) modal.remove();
  };
  document.body.appendChild(modal);
};
const bindFeatureInteractions = () => {
  document.querySelectorAll("[data-open-assistant]").forEach((button) => {
    button.onclick = openAssistant;
  });
  document.querySelectorAll("[data-cite]").forEach((button) => {
    button.onclick = () => openBibtexModal(button.dataset.cite || "");
  });
  document.querySelectorAll("canvas[data-chart]").forEach((canvas) => {
    const chart = JSON.parse(canvas.dataset.chart || "null");
    drawChartToCanvas(canvas, chart);
  });
  document.querySelectorAll("[data-tokenize]").forEach((button) => {
    button.onclick = () => {
      const box = button.closest(".demo-box");
      const field = box?.querySelector("[data-demo-token-input]");
      const output = box?.querySelector("[data-demo-token-output]");
      if (!field || !output) return;
      const tokens = field.value.match(/[\p{L}\p{N}]+/gu) || [];
      output.innerHTML = tokens
        .map((token) => `<span class="token">[${e(token)}]</span>`)
        .join(" ");
    };
  });
  document.querySelectorAll("[data-similarity]").forEach((button) => {
    button.onclick = () => {
      const box = button.closest(".demo-box");
      const aField = box?.querySelector("[data-demo-sim-a]");
      const bField = box?.querySelector("[data-demo-sim-b]");
      const output = box?.querySelector("[data-demo-sim-output]");
      if (!aField || !bField || !output) return;
      const tokenize = (value) =>
        value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
      const countTerms = (tokens) =>
        tokens.reduce((counts, token) => {
          counts.set(token, (counts.get(token) || 0) + 1);
          return counts;
        }, new Map());
      const left = countTerms(tokenize(aField.value));
      const right = countTerms(tokenize(bField.value));
      let dot = 0;
      let leftMagnitude = 0;
      let rightMagnitude = 0;
      for (const term of new Set([...left.keys(), ...right.keys()])) {
        const leftCount = left.get(term) || 0;
        const rightCount = right.get(term) || 0;
        dot += leftCount * rightCount;
        leftMagnitude += leftCount ** 2;
        rightMagnitude += rightCount ** 2;
      }
      const denominator = Math.sqrt(leftMagnitude * rightMagnitude);
      if (!denominator) {
        output.textContent = "Enter at least one word in both texts.";
        return;
      }
      const score = (dot / denominator) * 100;
      output.textContent = `Cosine similarity: ${score.toFixed(1)}% (word overlap, not semantic similarity)`;
    };
  });
};
const syncOptionalNav = () => {
  const nav = document.getElementById("nl");
  if (!nav) return;
  const links = [
    { label: "about", href: "#about" },
    { label: "publications", href: "#publications" },
    { label: "blog", href: "#blog" },
    { label: "cv", href: "#cv" },
    { label: "teaching", href: "#teaching" },
    ...(D.reading && D.reading.enabled
      ? [{ label: "reading", href: "#reading" }]
      : []),
    ...(D.projects && D.projects.enabled && D.projects.items.length
      ? [{ label: "projects", href: "#projects" }]
      : []),
    ...(D.experiments && D.experiments.enabled
      ? [{ label: "experiments", href: "#experiments" }]
      : []),
    ...(D.demos && D.demos.enabled
      ? [{ label: "playground", href: "#playground" }]
      : []),
  ];
  nav.innerHTML = links
    .map((link) => `<a class="l" href="${e(link.href)}">${e(link.label)}</a>`)
    .join("");
};
const renderCurrentlySection = () => {
  const items = ((D.currently && D.currently.items) || []).filter(
    (item) => item && (item.label || item.value),
  );
  if (!D.currently || !D.currently.enabled || !items.length) return "";
  return `<div class="currently-panel"><h2>${SV(IC.star)} Currently</h2><div class="currently-grid">${items
    .map(
      (item) =>
        `<div class="currently-item"><span class="label">${e(item.label || "Current")}</span><div>${e(item.value || "")}</div></div>`,
    )
    .join("")}</div></div>`;
};
const renderAssistantSection = () => {
  if (!D.assistant || !D.assistant.enabled) return "";
  return `<div class="feature-card"><div class="feature-copy"><strong>${e(D.assistant.title || "Ask about my work")}</strong><span>${e(D.assistant.description || "Ask about my background, research, publications, or teaching.")}</span></div><button class="feature-link" type="button" data-open-assistant>${e(D.assistant.prompt || "Ask about my research →")}</button></div>`;
};
const GITHUB_MARK = `<svg class="github-mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.23 1.84 1.23 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.28-1.23 3.28-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.47 5.92.43.38.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .3Z"/></svg>`;
const DEMOS_REPO_URL = "https://github.com/smahmuddz/smahmuddz.github.io";
const renderDemoMark = (kind) => {
  const name = String(kind || "").toLowerCase();
  const icon = name.includes("token")
    ? '<path d="M4 6h3m3 0h3m3 0h4M4 12h4m3 0h3m3 0h3M4 18h2m4 0h3m3 0h4"/><path d="M8 4v4m4 2v4m4 2v4"/>'
    : name.includes("attention") || name.includes("visual")
      ? '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/><path d="M10 7h4M7 10v4m10-4v4m-7 3h4"/>'
      : '<path d="M4 20V5m0 15h17M6 17l5-6 4 3 5-8"/><path d="M16 6h4v4"/>';
  return `<span class="demo-logo" aria-hidden="true">${SV(icon)}</span>`;
};
const renderGitHubSection = () => {
  if (!D.github || !D.github.enabled || !D.github.username) return "";
  const username = String(D.github.username).replace(/^@/, "");
  const repoBadge = D.github.repoCount
    ? `<div class="meta">${e(D.github.repoCount)} public repos</div>`
    : "";
  const activity = D.github.activityNote
    ? `<div class="sub" style="margin:0">${e(D.github.activityNote)}</div>`
    : `<div class="sub" style="margin:0">Public work and recent activity.</div>`;
  return `<div class="github-panel"><div class="github-logo" aria-hidden="true">${GITHUB_MARK}</div><div><strong>@${e(username)}</strong>${repoBadge}${activity}<a href="https://github.com/${encodeURIComponent(username)}" target="_blank" rel="noopener">${GITHUB_MARK}<span>Open GitHub profile</span></a></div></div>`;
};
const renderProjectCards = (items) =>
  `<div class="project-grid">${items
    .map(
      (project) =>
        `<article class="project-card"><h3>${e(project.title || "Project")}</h3><p>${e(project.description || "")}</p>${
          project.technologies
            ? `<div class="project-tech">${project.technologies
                .split(/,\s*/)
                .map(
                  (technology) => `<span class="tag">${e(technology)}</span>`,
                )
                .join("")}</div>`
            : ""
        }<div class="project-actions">${project.repoUrl ? `<a class="action-btn" href="${e(project.repoUrl)}" target="_blank" rel="noopener">${GITHUB_MARK}<span>GitHub repository</span></a>` : ""}${project.liveUrl ? `<a class="action-btn" href="${e(project.liveUrl)}" target="_blank" rel="noopener">Live project</a>` : ""}</div></article>`,
    )
    .join("")}</div>`;
const renderProjectsSection = (fullPage = false) => {
  const items = ((D.projects && D.projects.items) || []).filter(
    (project) => project && (project.title || project.description),
  );
  if (!D.projects || !D.projects.enabled || !items.length) {
    return fullPage
      ? `<h1 class="t">projects</h1><div class="sub">No projects are currently listed.</div>`
      : "";
  }
  return fullPage
    ? `<h1 class="t">projects</h1><div class="sub">Selected software and research projects.</div>${renderProjectCards(items)}`
    : `${H("code", "selected projects")}${renderProjectCards(items)}<p class="project-more"><a href="#projects">All projects →</a></p>`;
};
const renderBookCards = (items) =>
  items
    .map(
      (item) =>
        `<article class="reading-item book-item"><div class="book-cover-wrap">${item.cover ? `<img class="book-cover" src="${e(item.cover)}" alt="Cover of ${e(item.title || "book")}" loading="lazy" onerror="this.hidden=true">` : `<div class="book-cover-placeholder">${e(item.title || "Book")}</div>`}</div><div class="book-info"><div class="meta">${e(item.category || "Reading")}${item.date ? ` · ${e(item.date)}` : ""}</div><strong>${e(item.title || "Untitled")}</strong>${item.author ? `<div class="book-author">${e(item.author)}</div>` : ""}${item.personalRating != null ? `<div class="book-rating" aria-label="${e(item.ratingLabel || "Rating")}: ${e(item.personalRating)} out of 5"><span>${e(item.personalRating)} / 5</span><span class="meta">${e(item.ratingLabel || "Personal rating")}</span></div>` : ""}${item.note ? `<div class="book-note">${e(item.note)}</div>` : ""}${item.status ? `<div class="meta">${e(item.status)}</div>` : ""}${item.url ? `<a href="${e(item.url)}" target="_blank" rel="noopener">Book details</a>` : ""}</div></article>`,
    )
    .join("");
const renderReadingList = () => {
  const items = ((D.reading && D.reading.items) || []).filter(
    (item) => item && (item.title || item.author || item.note),
  );
  if (!D.reading || !D.reading.enabled || !items.length) return "";
  return `<div class="reading-panel"><h2>${SV(IC.book)} Reading list</h2><div class="reading-grid">${renderBookCards(items)}</div></div>`;
};
const renderExperimentsSection = () => {
  const items = ((D.experiments && D.experiments.items) || []).filter(
    (item) => item && (item.title || item.question || item.description),
  );
  if (!D.experiments || !D.experiments.enabled || !items.length) return "";
  return `<div class="experiment-panel"><h2>${SV(IC.code)} Experiments</h2><div class="experiment-grid">${items
    .map(
      (item) =>
        `<div class="experiment-item"><span class="meta">${e(item.dataset || "Experiment")}</span><strong>${e(item.title || "Untitled experiment")}</strong>${item.question ? `<div>${e(item.question)}</div>` : ""}</div>`,
    )
    .join("")}</div></div>`;
};
const renderDemoCards = () => {
  const items = ((D.demos && D.demos.items) || []).filter(
    (demo) =>
      demo && demo.enabled !== false && (demo.title || demo.description),
  );
  if (!D.demos || !D.demos.enabled || !items.length) return "";
  return `<div class="demo-panel"><div class="demo-panel-heading"><h2>${SV(IC.code)} Interactive demos</h2><a class="demo-source" href="${DEMOS_REPO_URL}" target="_blank" rel="noopener">${GITHUB_MARK}<span>Source</span></a></div><div class="experimental-demo">${items
    .map(
      (demo) =>
        `<div class="demo-box"><div class="demo-card-title">${renderDemoMark(demo.kind || demo.title)}<strong>${e(demo.title || "Demo")}</strong></div><div class="sub" style="margin:0">${e(demo.description || "Educational demo")}</div><div class="demo-cta"><a href="#playground" class="bt">Open</a></div></div>`,
    )
    .join("")}</div></div>`;
};
const renderPubCard = (p) => {
  const slug = getPubSlug(p);
  return `<div class="pub"><div class="ab"><span>${e(p.abbr || "P")}</span></div><div><div class="tt">${e(p.title)}</div><div class="au">${e(p.authors).replace(e(D.name), "<u>" + e(D.name) + "</u>")}</div><div class="au"><em>${e(p.venue)}</em>${p.year ? ", " + e(p.year) : ""}</div>${renderPublicationActions(p)}<div style="margin-top:8px"><a href="#publications/${e(slug)}">Open details →</a></div></div></div>`;
};
const publicationPage = (pub) => {
  const fields = [
    ["Authors", pub.authors],
    ["Publication venue", pub.venue],
    ["Year", pub.year],
    ["Abstract", pub.abstract],
    ["Keywords", pub.keywords],
    ["Key findings", pub.findings],
    ["Methodology", pub.methodology],
    ["Results", pub.results],
    ["Code", pub.code],
    ["Dataset", pub.dataset],
    ["DOI", pub.doi],
    ["Citation", pub.citation],
  ].filter(([, value]) => !!String(value || "").trim());
  const tags = (pub.keywords || pub.topics || "")
    .split(/,|\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((t) => `<span class="tag">${e(t)}</span>`)
    .join("");
  const results = renderChartHtml(
    pub.resultsData || pub.chart || pub.results || null,
  );
  return `<div class="pub-detail"><a href="#publications">← publications</a><h1 class="t" style="margin-top:14px">${e(pub.title || "Untitled publication")}</h1><div class="meta">${e(pub.venue || "")}${pub.year ? ` · ${e(pub.year)}` : ""}</div>${renderPublicationActions(pub)}${tags ? `<div class="facts">${tags}</div>` : ""}${fields.map(([label, value]) => `<div class="section"><h3>${e(label)}</h3><div>${md(String(value))}</div></div>`).join("")}${results ? `<div class="section"><h3>Results</h3>${results}</div>` : ""}</div>`;
};
const renderPublicationList = () => {
  if (!Array.isArray(D.pubs) || !D.pubs.length) {
    return `<h1 class="t">publications</h1><div class="sub">No publications have been added yet.</div>`;
  }
  return `<h1 class="t">publications</h1><div class="sub">Peer-reviewed papers, listed by year.</div>${rows(D.pubs, renderPubCard)}${D.scholar ? `<p style="margin-top:20px"><a href="${e(D.scholar)}" target="_blank" rel="noopener">See Google Scholar profile →</a></p>` : ""}`;
};
const renderDemoPlayground = () => {
  const items = ((D.demos && D.demos.items) || []).filter(
    (demo) =>
      demo && demo.enabled !== false && (demo.title || demo.description),
  );
  if (!D.demos || !D.demos.enabled || !items.length) {
    return `<h1 class="t">research playground</h1><div class="sub">No interactive demos are configured yet.</div>`;
  }
  return `<div class="playground-heading"><div><h1 class="t">research playground</h1><div class="sub">Lightweight educational demos for NLP and related ideas.</div></div><a class="demo-source" href="${DEMOS_REPO_URL}" target="_blank" rel="noopener">${GITHUB_MARK}<span>GitHub source</span></a></div><div class="experimental-demo">${items
    .map((demo) => {
      const title = e(demo.title || "Demo");
      const kind = String(demo.kind || demo.title || "")
        .toLowerCase()
        .replace(/[_\s]+/g, "-");
      const description = demo.description
        ? `<p class="demo-description">${e(demo.description)}</p>`
        : "";
      if (kind.includes("token")) {
        return `<div class="demo-box"><div class="demo-card-title">${renderDemoMark(kind)}<h3>${title}</h3></div>${description}<textarea data-demo-token-input rows="2">${e(demo.sampleText || "I love NLP")}</textarea><button class="b" type="button" data-tokenize>Tokenize</button><div class="token-box" data-demo-token-output aria-live="polite"></div></div>`;
      }
      if (kind.includes("attention") || kind.includes("visual")) {
        const words = (
          Array.isArray(demo.words) && demo.words.length
            ? demo.words
            : ["I", "love", "NLP", "research"]
        )
          .slice(0, 5)
          .map(String);
        const weights = words.map((word, row) =>
          words.map((key, column) => {
            const value = Number(demo.weights?.[row]?.[column] ?? 0);
            return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
          }),
        );
        const matrix = `<div class="attention-matrix" style="grid-template-columns:minmax(46px,.9fr) repeat(${words.length},minmax(0,1fr))"><span class="attention-axis">Query / key</span>${words.map((word) => `<span class="attention-axis">${e(word)}</span>`).join("")}${words.map((word, row) => `<span class="attention-axis">${e(word)}</span>${weights[row].map((weight, column) => `<span class="attention-cell" aria-label="${e(word)} to ${e(words[column])}: ${weight.toFixed(2)}" title="${e(word)} to ${e(words[column])}" style="--weight-color:color-mix(in srgb,var(--acc) ${Math.round(weight * 100)}%,var(--card))">${weight.toFixed(2)}</span>`).join("")}`).join("")}</div>`;
        return `<div class="demo-box"><div class="demo-card-title">${renderDemoMark(kind)}<h3>${title}</h3></div>${description}<div class="attention-wrap">${matrix}<div class="sub">Rows are queries; columns are the tokens receiving attention.</div></div></div>`;
      }
      if (kind.includes("similarity") || kind.includes("cosine")) {
        return `<div class="demo-box"><div class="demo-card-title">${renderDemoMark(kind)}<h3>${title}</h3></div>${description}<label class="demo-field-label">Text A<input data-demo-sim-a value="${e(demo.textA || "language model")}"></label><label class="demo-field-label">Text B<input data-demo-sim-b value="${e(demo.textB || "AI model")}"></label><button class="b" type="button" data-similarity>Compare</button><div class="similarity-score" data-demo-sim-output aria-live="polite"></div>`;
      }
      return `<div class="demo-box"><div class="demo-card-title">${renderDemoMark(kind)}<h3>${title}</h3></div>${description}<p class="sub">This demo type is not interactive yet.</p></div>`;
    })
    .join("")}</div>`;
};
const renderReadingPage = () => {
  const items = ((D.reading && D.reading.items) || []).filter(
    (item) => item && (item.title || item.author || item.note),
  );
  if (!D.reading || !D.reading.enabled || !items.length) {
    return `<h1 class="t">reading</h1><div class="sub">No reading list entries are currently visible.</div>`;
  }
  return `<h1 class="t">reading</h1><div class="sub">Source material and recent reads.</div><div class="reading-grid reading-page-grid">${renderBookCards(items)}</div>`;
};
const assistantDocuments = () =>
  [
    { title: "Profile", content: `${D.name}. ${D.tagline}. ${D.bio}` },
    { title: "Research interests", content: D.interests || "" },
    {
      title: "Projects",
      content: ((D.projects && D.projects.items) || [])
        .map(
          (project) =>
            `${project.title}. ${project.description}. ${project.technologies || ""}`,
        )
        .join(". "),
    },
    {
      title: "Education",
      content: (D.education || [])
        .map((x) => `${x.title}, ${x.place}, ${x.period}`)
        .join(". "),
    },
    {
      title: "Experience",
      content: (D.experience || [])
        .map((x) => `${x.title}, ${x.place}, ${x.period}. ${x.desc || ""}`)
        .join(". "),
    },
    {
      title: "Publications",
      content: (D.pubs || [])
        .map(
          (x) =>
            `${x.title}. ${x.authors}. ${x.venue}, ${x.year}. ${x.abstract || ""}`,
        )
        .join(". "),
    },
    {
      title: "Teaching and training",
      content: [...(D.teaching || []), ...(D.training || [])]
        .map((x) => `${x.course || x.title}, ${x.place}, ${x.period}`)
        .join(". "),
    },
    {
      title: "Skills",
      content: (D.skills || []).map((x) => `${x.cat}: ${x.items}`).join(". "),
    },
    {
      title: "Writing",
      content: (D.posts || [])
        .filter((x) => x.status !== "draft")
        .map(
          (x) =>
            `${x.title}. ${x.tags || ""}. ${String(x.body || "").slice(0, 1200)}`,
        )
        .join(". "),
    },
    {
      title: "Contact",
      content: `Email: ${D.email || "not listed"}. GitHub: @${D.github.username || ""}.`,
    },
  ].filter((document) => document.content.trim());
const answerAssistantLocally = (question) => {
  const stopWords = new Set([
    "about",
    "are",
    "can",
    "could",
    "does",
    "for",
    "from",
    "give",
    "have",
    "how",
    "into",
    "is",
    "me",
    "my",
    "please",
    "tell",
    "that",
    "the",
    "their",
    "them",
    "this",
    "what",
    "when",
    "where",
    "which",
    "who",
    "why",
    "with",
    "you",
  ]);
  const terms = (question.toLowerCase().match(/[a-z0-9]+/g) || []).filter(
    (term) => term.length > 2 && !stopWords.has(term),
  );
  const documents = assistantDocuments();
  if (!terms.length || /\b(who|background|about|bio)\b/i.test(question)) {
    return `${documents[0].content}\n\nSource: ${documents[0].title}`;
  }
  const ranked = documents
    .map((document) => {
      const title = document.title.toLowerCase();
      const text = `${title} ${document.content}`.toLowerCase();
      const score = terms.reduce((total, term) => {
        const root = term.replace(/s$/, "");
        const matches =
          text.match(new RegExp(`\\b${root}[a-z]*\\b`, "g")) || [];
        return (
          total + Math.min(matches.length, 4) + (title.includes(root) ? 10 : 0)
        );
      }, 0);
      return { ...document, score };
    })
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score);
  const bestScore = ranked[0]?.score || 0;
  const relevant = ranked
    .filter((document) => document.score >= Math.max(2, bestScore * 0.45))
    .slice(0, 2);
  if (!relevant.length) {
    return "I couldn't find that in the public information on this site. Try asking about the profile, research interests, publications, education, experience, teaching, skills, or writing.";
  }
  return `${relevant
    .map(
      (document) =>
        `${document.title}: ${document.content
          .replace(/[#>*_]/g, "")
          .replace(/\s+/g, " ")
          .slice(0, 500)}`,
    )
    .join(
      "\n\n",
    )}\n\nSources: ${relevant.map((document) => document.title).join(", ")}`;
};
const openAssistant = () => {
  const modal = document.createElement("div");
  modal.className = "modal assistant-modal";
  modal.innerHTML = `<section class="modal-box assistant-box" role="dialog" aria-modal="true" aria-labelledby="assistant-title"><div class="cite-actions"><h3 id="assistant-title">${e(D.assistant.title || "Ask about my work")}</h3><button class="b g" type="button" data-assistant-close>Close</button></div><p class="assistant-intro">Answers are grounded in the public information on this site.</p><div class="assistant-messages" data-assistant-messages aria-live="polite"><div class="assistant-message assistant-reply">Ask about my background, research, publications, education, teaching, or writing.</div></div><form class="assistant-form" data-assistant-form><input name="question" autocomplete="off" placeholder="Ask a question about my work" aria-label="Your question" required><button class="b" type="submit">Ask</button></form></section>`;
  document.body.appendChild(modal);
  const input = modal.querySelector('[name="question"]');
  const messages = modal.querySelector("[data-assistant-messages]");
  const form = modal.querySelector("[data-assistant-form]");
  const onKeydown = (event) => {
    if (event.key === "Escape") close();
  };
  const close = () => {
    modal.removeEventListener("keydown", onKeydown);
    modal.remove();
  };
  modal.querySelector("[data-assistant-close]").onclick = close;
  modal.onclick = (event) => {
    if (event.target === modal) close();
  };
  modal.addEventListener("keydown", onKeydown);
  form.onsubmit = async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    const userMessage = document.createElement("div");
    userMessage.className = "assistant-message assistant-question";
    userMessage.textContent = question;
    messages.appendChild(userMessage);
    input.value = "";
    input.disabled = true;
    const submit = form.querySelector("button");
    submit.disabled = true;
    const reply = document.createElement("div");
    reply.className = "assistant-message assistant-reply";
    reply.textContent = "Looking through the site content...";
    messages.appendChild(reply);
    messages.scrollTop = messages.scrollHeight;
    try {
      let answer;
      const endpoint = String(D.assistant.endpoint || "").trim();
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, context: assistantDocuments() }),
        });
        if (!response.ok)
          throw new Error(`Assistant endpoint returned ${response.status}`);
        const result = await response.json();
        answer =
          result.answer ||
          result.output ||
          result.choices?.[0]?.message?.content;
        if (!answer) throw new Error("Assistant endpoint returned no answer");
      }
      reply.textContent = answer || answerAssistantLocally(question);
    } catch (error) {
      reply.textContent = `The live assistant is unavailable, so here is an answer from the site content instead:\n\n${answerAssistantLocally(question)}`;
    } finally {
      input.disabled = false;
      submit.disabled = false;
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  };
  input.focus();
};
const renderExperimentList = () => {
  const items = ((D.experiments && D.experiments.items) || []).filter(
    (item) => item && (item.title || item.question || item.description),
  );
  if (!D.experiments || !D.experiments.enabled || !items.length) {
    return `<h1 class="t">experiments</h1><div class="sub">No experiments are currently published.</div>`;
  }
  return `<h1 class="t">experiments</h1><div class="sub">Research experiments and comparative analyses.</div>${items.map((item) => `<div class="card"><div class="sub" style="margin:0">${e(item.dataset || "Experiment")}</div><a href="#experiments/${e(slugify(item.title || item.question || "experiment"))}" style="font-size:1.15rem;font-weight:500">${e(item.title || "Untitled experiment")}</a>${item.question ? `<div style="color:var(--mut)">${e(item.question)}</div>` : ""}</div>`).join("")}`;
};
const safePathValue = (obj, path, fallback) => {
  return (
    path
      .split(".")
      .reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
        obj,
      ) ?? fallback
  );
};
const setPathValue = (obj, path, value) => {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
};
const optionalAdminHtml = () => {
  const toggles = [
    ["assistant.enabled", "AI research assistant"],
    ["currently.enabled", "Currently section"],
    ["github.enabled", "GitHub activity"],
    ["projects.enabled", "Projects section"],
    ["reading.enabled", "Reading list"],
    ["experiments.enabled", "Experiments"],
    ["demos.enabled", "Interactive demos"],
  ];
  return `
    <div class="it">
      ${toggles.map(([path, label]) => `<div><label>${label}</label><input type="checkbox" data-opt="${path}" ${safePathValue(D, path, false) ? "checked" : ""}></div>`).join("")}
      <div class="full"><label>Assistant title</label><input data-opt-field="assistant.title" value="${e(D.assistant.title || "")}"></div>
      <div class="full"><label>Assistant prompt</label><input data-opt-field="assistant.prompt" value="${e(D.assistant.prompt || "")}"></div>
      <div class="full"><label>Assistant endpoint (optional POST JSON; return an answer field)</label><input data-opt-field="assistant.endpoint" value="${e(D.assistant.endpoint || "")}"></div>
      <div class="full"><label>Assistant status text</label><textarea data-opt-field="assistant.description" rows="2">${e(D.assistant.description || "")}</textarea></div>
      <div class="full"><label>GitHub username</label><input data-opt-field="github.username" value="${e(D.github.username || "")}"></div>
      <div class="full"><label>GitHub repo count</label><input data-opt-field="github.repoCount" value="${e(D.github.repoCount || "")}"></div>
      <div class="full"><label>GitHub activity note</label><textarea data-opt-field="github.activityNote" rows="2">${e(D.github.activityNote || "")}</textarea></div>
      <div class="full"><label>Projects (JSON array)</label><textarea data-opt-json="projects.items" rows="7">${e(JSON.stringify(D.projects.items || [], null, 2))}</textarea></div>
      <div class="full"><label>Currently items (JSON array)</label><textarea data-opt-json="currently.items" rows="5">${e(JSON.stringify(D.currently.items || [], null, 2))}</textarea></div>
      <div class="full"><label>Reading list items (JSON array)</label><textarea data-opt-json="reading.items" rows="5">${e(JSON.stringify(D.reading.items || [], null, 2))}</textarea></div>
      <div class="full"><label>Experiments items (JSON array)</label><textarea data-opt-json="experiments.items" rows="5">${e(JSON.stringify(D.experiments.items || [], null, 2))}</textarea></div>
      <div class="full"><label>Interactive demos JSON (kind, enabled, title, description, sampleText, textA, textB, words, weights)</label><textarea data-opt-json="demos.items" rows="9">${e(JSON.stringify(D.demos.items || [], null, 2))}</textarea></div>
    </div>
  `;
};

/* ---- PDF preview (shared by publications + blog editors) ---- */
const pane = (val, attrs) =>
  `<div class="pdfp"><label>PDF (path/URL, or upload a compiled PDF)</label><div class="pdfc"><input type="text" ${attrs} value="${e(val)}" placeholder="papers/my-paper.pdf"><input type="file" accept="application/pdf" data-pdfup><button class="b g" type="button" data-pdfr>Reload</button></div><div class="pdfv"></div></div>`;
async function showPdf(box, u) {
  if (!u) {
    box.innerHTML =
      '<div class="empty">No PDF yet. Enter a path/URL or upload the compiled PDF to preview it here.</div>';
    return;
  }
  let s = u;
  try {
    s = u.startsWith("data:")
      ? URL.createObjectURL(await (await fetch(u)).blob())
      : u + (u.includes("?") ? "&" : "?") + "t=" + Date.now();
  } catch (x) {}
  box.innerHTML = `<iframe src="${e(s)}" title="PDF preview"></iframe>`;
}
function bindPdf(root) {
  root.querySelectorAll(".pdfp").forEach((p) => {
    const inp = p.querySelector("input[type=text]"),
      box = p.querySelector(".pdfv");
    let t;
    const go = () => showPdf(box, inp.value.trim());
    inp.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(go, 500);
    });
    p.querySelector("[data-pdfr]").onclick = go;
    p.querySelector("[data-pdfup]").onchange = (ev) => {
      const f = ev.target.files[0];
      if (!f) return;
      if (f.size > 3e6)
        return alert(
          "PDF over 3 MB: upload it next to index.html and enter its path instead.",
        );
      const r = new FileReader();
      r.onload = () => {
        inp.value = r.result;
        inp.dispatchEvent(new Event("input"));
      };
      r.readAsDataURL(f);
    };
    go();
  });
}

const R = {
  about: () => {
    const n = D.name.split(" ");
    return `<div class="about"><div class="prof">${D.photo ? `<img src="${e(D.photo)}" alt="${e(D.name)}">` : ""}<div class="soc">${socials()}</div></div><div style="flex:1;min-width:0"><h1 class="t"><b>${e(n[0])}</b> ${e(n.slice(1).join(" "))}</h1><div class="sub">${e(D.tagline)}</div>${bio()}</div></div>
${renderAssistantSection()}${renderCurrentlySection()}${H("star", "research interests")}<div>${(
      D.interests || ""
    )
      .split(/,\s*/)
      .map((t) => `<span class="tag">${e(t)}</span>`)
      .join(
        "",
      )}</div>${H("cap", "affiliations")}<div class="aff">${affs()}</div>${H("news", "news")}${rows(D.news, (n) => `<div class="row"><div class="d">${e(n.date)}</div><div class="x">${e(n.text)}</div></div>`)}${renderGitHubSection()}${renderProjectsSection()}${renderReadingList()}${renderExperimentsSection()}${renderDemoCards()}${H("book", "selected publications")}${rows(D.pubs.slice(0, 3), renderPubCard)}`;
  },
  publications: (slug) => {
    const pub = slug ? D.pubs.find((p) => getPubSlug(p) === slug) : null;
    if (pub) return publicationPage(pub);
    return renderPublicationList();
  },
  experiments: (slug) => {
    const items = ((D.experiments && D.experiments.items) || []).filter(
      (item) => item && (item.title || item.question || item.description),
    );
    const found = slug
      ? items.find(
          (item) =>
            slugify(item.title || item.question || "experiment") === slug,
        )
      : null;
    if (found) {
      return `<div class="pub-detail"><a href="#experiments">← experiments</a><h1 class="t" style="margin-top:14px">${e(found.title || "Untitled experiment")}</h1>${[
        ["Research question", found.question],
        ["Description", found.description],
        ["Dataset", found.dataset],
        ["Model / algorithm", found.model],
        ["Method", found.method],
        ["Results", found.results],
        ["Findings", found.findings],
        ["Notes", found.notes],
        ["Code", found.code],
      ]
        .filter(([, value]) => !!String(value || "").trim())
        .map(
          ([label, value]) =>
            `<div class="section"><h3>${e(label)}</h3><div>${md(String(value))}</div></div>`,
        )
        .join(
          "",
        )}${renderChartHtml(found.resultsData || found.chart || found.results || null) ? `<div class="section"><h3>Results</h3>${renderChartHtml(found.resultsData || found.chart || found.results || null)}</div>` : ""}</div>`;
    }
    return renderExperimentList();
  },
  reading: () => renderReadingPage(),
  projects: () => renderProjectsSection(true),
  playground: () => renderDemoPlayground(),
  cv: () => `<h1 class="t">cv</h1><div class="sub np"><a href="#" onclick="print();return false">Download / print as PDF</a></div>
${H("cap", "Education")}${rows(D.education, (x) => `<div class="row"><div class="d">${e(x.period)}</div>${lg(x)}<div class="x"><b>${e(x.title)}</b><br>${e(x.place)}</div></div>`)}
${H("job", "Experience")}${rows(D.experience, (x) => `<div class="row"><div class="d">${e(x.period)}</div>${lg(x)}<div class="x"><b>${e(x.title)}</b>, ${e(x.place)}${x.desc ? `<br><span style="color:var(--mut)">${e(x.desc)}</span>` : ""}</div></div>`)}
${H("award", "Awards, certifications &amp; affiliations")}${rows(D.awards, (x) => `<div class="row"><div class="d">${e(x.year)}</div>${lg(x)}<div class="x">${e(x.title)}${x.by ? `<br><span style="color:var(--mut)">${e(x.by)}</span>` : ""}</div></div>`)}
${H("code", "Skills")}${rows(
    D.skills,
    (x) =>
      `<div class="row"><div class="d">${e(x.cat)}</div><div class="x">${e(
        x.items,
      )
        .split(/,\s*/)
        .map((t) => `<span class="tag">${t}</span>`)
        .join("")}</div></div>`,
  )}`,
  teaching: () =>
    `<h1 class="t">teaching</h1><div class="sub">Courses I have assisted with or taught.</div>${rows(D.teaching, (x) => `<div class="row"><div class="d">${e(x.period)}</div>${lg(x)}<div class="x"><b>${e(x.course)}</b><br>${e(x.place)}</div></div>`)}${H("book", "workshops &amp; training")}${rows(D.training, (x) => `<div class="row"><div class="d">${e(x.period)}</div>${lg(x)}<div class="x"><b>${e(x.title)}</b><br>${e(x.place)}</div></div>`)}`,
  siteTab: () => {
    const T = [
      "name",
      "tagline",
      "interests",
      "email",
      "orcid",
      "scholar",
      "linkedin",
    ];
    const fld = (s, it, i, f) =>
      `<div class="${TA.includes(f) ? "full" : ""}"><label>${f}</label>${TA.includes(f) ? `<textarea rows="2" data-s="${s}" data-i="${i}" data-f="${f}">${e(it[f])}</textarea>` : `<input data-s="${s}" data-i="${i}" data-f="${f}" value="${e(it[f])}">`}</div>`;
    return `<div class="ad"><h1 class="t">admin</h1><div class="sub">Edit everything, then press Save. Changes are stored in this browser; use Export to back up or move your data.</div>
<div class="bar"><button class="b" id="sv">Save</button><button class="b g" id="ex">Export JSON</button><button class="b g" onclick="$('#im').click()">Import JSON</button><input type="file" id="im" accept=".json" hidden><button class="b r" id="rs">Restore defaults</button> <span id="ms" style="font-size:.85rem;color:var(--mut)"></span></div>
<h2>Profile</h2><div class="it">${T.map((k) => `<div><label>${k}</label><input data-k="${k}" value="${e(D[k])}"></div>`).join("")}<div class="full"><label>photo</label><input type="file" id="ph" accept="image/*"></div><div class="full"><label>bio (blank line = new paragraph)</label><textarea data-k="bio" rows="7">${e(D.bio)}</textarea></div></div>
${Object.keys(S)
  .map(
    (s) =>
      `<h2>${s}</h2>${D[s]
        .map((it, i) => {
          const ctl = `<div class="full"><button class="b g" data-a="up" data-s="${s}" data-i="${i}">↑</button><button class="b g" data-a="dn" data-s="${s}" data-i="${i}">↓</button><button class="b r" data-a="rm" data-s="${s}" data-i="${i}">Remove</button></div>`;
          if (s == "pubs")
            return `<div class="it pd"><div class="ed"><div class="fg">${S[s]
              .filter((f) => f != "pdf")
              .map((f) => fld(s, it, i, f))
              .join(
                "",
              )}</div>${pane(it.pdf, `data-s="${s}" data-i="${i}" data-f="pdf"`)}</div>${ctl}</div>`;
          return `<div class="it">${S[s].map((f) => fld(s, it, i, f)).join("")}${LS.includes(s) ? `<div class="full"><label>logo (optional image)</label><input type="file" accept="image/*" data-lg data-s="${s}" data-i="${i}"></div>` : ""}${ctl}</div>`;
        })
        .join(
          "",
        )}<button class="b" data-a="add" data-s="${s}">+ Add to ${s}</button>`,
  )
  .join("")}${optionalAdminHtml()}</div>`;
  },
};
function save(m) {
  try {
    localStorage.setItem(KEY, JSON.stringify(D));
    m = "Saved ✓";
  } catch (x) {
    m = "Storage unavailable — use Export (large PDFs/photos may exceed quota)";
  }
  const s = $("#ms");
  if (s) s.textContent = m;
}
function bindOptionalAdmin() {
  document.querySelectorAll("[data-opt]").forEach((el) => {
    el.onchange = () => {
      setPathValue(D, el.dataset.opt, el.checked);
      save();
      draw();
    };
  });
  document.querySelectorAll("[data-opt-field]").forEach((el) => {
    el.oninput = () => {
      setPathValue(D, el.dataset.optField, el.value);
      save();
      draw();
    };
  });
  document.querySelectorAll("[data-opt-json]").forEach((el) => {
    el.onchange = () => {
      try {
        const parsed = JSON.parse(el.value);
        setPathValue(
          D,
          el.dataset.optJson,
          Array.isArray(parsed) ? parsed : [],
        );
        save();
        draw();
      } catch (x) {
        el.style.borderColor = "#c33";
      }
    };
  });
}
function bind() {
  document.querySelectorAll("[data-lg]").forEach(
    (el) =>
      (el.onchange = (ev) => {
        const r = new FileReader();
        r.onload = () => {
          const im = new Image();
          im.onload = () => {
            const c = document.createElement("canvas"),
              k = Math.min(1, 96 / im.width);
            c.width = im.width * k;
            c.height = im.height * k;
            c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
            D[el.dataset.s][el.dataset.i].logo = c.toDataURL("image/png");
            save();
          };
          im.src = r.result;
        };
        r.readAsDataURL(ev.target.files[0]);
      }),
  );
  document.querySelectorAll(".ad [data-k],.ad [data-f]").forEach(
    (el) =>
      (el.oninput = () => {
        const d = el.dataset;
        d.k ? (D[d.k] = el.value) : (D[d.s][d.i][d.f] = el.value);
        save();
      }),
  );
  document.querySelectorAll("[data-a]").forEach(
    (b) =>
      (b.onclick = () => {
        const { a, s, i } = b.dataset,
          L = D[s],
          n = +i;
        if (a == "add") L.push(Object.fromEntries(S[s].map((f) => [f, ""])));
        if (a == "rm") L.splice(n, 1);
        if (a == "up" && n > 0) [L[n - 1], L[n]] = [L[n], L[n - 1]];
        if (a == "dn" && n < L.length - 1) [L[n + 1], L[n]] = [L[n], L[n + 1]];
        save();
        const y = scrollY;
        draw();
        scrollTo(0, y);
      }),
  );
  $("#sv").onclick = () => save();
  $("#rs").onclick = () => {
    if (
      confirm("Restore all content to defaults? This removes your saved edits.")
    ) {
      try {
        localStorage.removeItem(KEY);
        localStorage.removeItem(DELETED_POSTS_KEY);
      } catch (x) {}
      D = JSON.parse(JSON.stringify(DEF));
      draw();
    }
  };
  $("#ex").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(D, null, 2)], { type: "application/json" }),
    );
    a.download = "site-data.json";
    a.click();
  };
  $("#im").onchange = (ev) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        D = Object.assign({}, DEF, JSON.parse(r.result));
        ensureOptionalSections();
        save();
        draw();
      } catch (x) {
        alert("Invalid JSON");
      }
    };
    r.readAsText(ev.target.files[0]);
  };
  $("#ph").onchange = (ev) => {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas"),
          k = Math.min(1, 420 / im.width);
        c.width = im.width * k;
        c.height = im.height * k;
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        D.photo = c.toDataURL("image/jpeg", 0.82);
        save();
      };
      im.src = r.result;
    };
    r.readAsDataURL(ev.target.files[0]);
  };
  bindPdf($("#app"));
  bindOptionalAdmin();
}
/* ---- auth: hash comes from config.js (window.CFG.ADMIN_PW_HASH); Password tab can override locally ---- */
const PW = (window.CFG || {}).ADMIN_PW_HASH;
const sh = async (s) =>
  [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    ),
  ]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
const gp = () => {
  try {
    return localStorage.getItem("sma_pw");
  } catch (x) {}
};
let authed = false,
  atab = "site",
  cur = null;
try {
  authed = sessionStorage.getItem("sma_auth") == "1";
} catch (x) {}
const tx = () => {
  if (!window.MathJax?.typesetPromise) return;
  MathJax.startup.promise
    .then(() => MathJax.typesetPromise([$("#app")]))
    .catch(() => {});
};
function md(s) {
  const C = [],
    M = [],
    P = (a, x) => {
      a.push(x);
      return "\u0000" + (a == C ? "c" : "m") + (a.length - 1) + "\u0000";
    };
  s = s
    .replace(/```[\w]*\n([\s\S]*?)```/g, (m, x) =>
      P(C, "<pre><code>" + e(x) + "</code></pre>"),
    )
    .replace(/`([^`\n]+)`/g, (m, x) => P(C, "<code>" + e(x) + "</code>"));
  s = s
    .replace(/\$\$([\s\S]+?)\$\$/g, (m, x) => P(M, "\\[" + e(x) + "\\]"))
    .replace(/\$([^\n$]+?)\$/g, (m, x) => P(M, "\\(" + e(x) + "\\)"));
  s = e(s);
  const il = (t) =>
    t
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.+?)\*/g, "<i>$1</i>")
      .replace(
        /\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>',
      );
  s = s
    .split(/\n{2,}/)
    .map((b) => {
      b = b.trim();
      let m;
      if (/^\u0000c\d+\u0000$/.test(b)) return b;
      if ((m = b.match(/^(#{1,3})\s+(.*)/)))
        return `<h${m[1].length + 1}>${il(m[2])}</h${m[1].length + 1}>`;
      if (/^([-*]|\d+\.)\s/.test(b)) {
        const o = /^\d/.test(b) ? "ol" : "ul";
        return (
          `<${o}>` +
          b
            .split("\n")
            .map((l) => `<li>${il(l.replace(/^([-*]|\d+\.)\s+/, ""))}</li>`)
            .join("") +
          `</${o}>`
        );
      }
      if (b.startsWith("&gt;"))
        return `<blockquote>${il(b.replace(/^&gt;\s?/gm, ""))}</blockquote>`;
      return b ? `<p>${il(b).replace(/\n/g, "<br>")}</p>` : "";
    })
    .join("");
  return s.replace(
    /\u0000([cm])(\d+)\u0000/g,
    (m, k, i) => (k == "c" ? C : M)[i],
  );
}
const tg = (p) =>
  (p.tags || "")
    .split(",")
    .filter((t) => t.trim())
    .map((t) => `<span class="tag">${e(t.trim())}</span>`)
    .join("");
R.blog = (slug) => {
  const p = slug && D.posts.find((x) => x.slug == slug);
  if (p)
    return `<div class="post"><a href="#blog">← all posts</a><h1 class="t" style="margin-top:14px">${e(p.title)}</h1><div class="sub">${e(p.date)} ${tg(p)}${p.pdf && !p.pdf.startsWith("data:") ? ` <a class="bt" href="${e(p.pdf)}" target="_blank" rel="noopener">PDF</a>` : ""}</div>${md(p.body)}</div>`;
  const L = D.posts
    .filter((x) => x.status != "draft")
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    `<h1 class="t">blog</h1><div class="sub">Notes on research, teaching and code.</div>` +
    (L.map(
      (p) =>
        `<div class="card"><div class="sub" style="margin:0">${e(p.date)} ${tg(p)}</div><a href="#blog/${e(p.slug)}" style="font-size:1.25rem;font-weight:500">${e(p.title)}</a><div style="color:var(--mut)">${e(p.body.replace(/[$`*#\\]/g, "").slice(0, 160))}…</div></div>`,
    ).join("") || "<p>No posts yet.</p>")
  );
};
R.login = () =>
  `<div class="ad" style="max-width:360px;margin:40px auto"><h1 class="t">admin</h1><div class="sub">Enter password to continue.</div><input type="password" id="pw" placeholder="Password"><button class="b" id="lg" style="margin-top:10px">Log in</button> <span id="ms" style="color:#c33;font-size:.85rem"></span></div>`;
R.admin = () => {
  if (!authed) return R.login();
  const T = [
    ["site", "Site content"],
    ["blog", "Blog posts"],
    ["sec", "Password"],
  ];
  return (
    `<div class="bar" style="position:static">${T.map((t) => `<button class="b${atab == t[0] ? "" : " g"}" data-t="${t[0]}">${t[1]}</button>`).join("")}<button class="b r" id="lo">Log out</button></div>` +
    R[{ blog: "blogTab", sec: "secTab" }[atab] || "siteTab"]()
  );
};
R.secTab = () =>
  `<div class="ad"><h2>Change password</h2><div class="sub">The default hash lives in <code>config.js</code> (<code>ADMIN_PW_HASH</code>). Generate a new hash below and paste it there to apply on your live site. (Generating also overrides it in this browser only.)</div><label>new password</label><input type="password" id="np"><button class="b" id="sp">Generate</button><div id="ho" style="word-break:break-all;margin-top:10px;font-family:monospace;font-size:.8rem"></div></div>`;
R.blogTab = () => {
  const p = D.posts[cur],
    I = (k, l, t = "") =>
      `<div><label>${l}</label><input ${t} data-p="${k}" value="${e(p[k])}"></div>`;
  if (p)
    return `<div class="ad"><h2>Edit post</h2>
<div class="ed"><div><div class="it">${I("title", "title")}${I("slug", "slug")}${I("date", "date", 'type="date"')}${I("tags", "tags (comma separated)")}<div><label>status</label><select data-p="status"><option${p.status == "draft" ? "" : " selected"}>published</option><option${p.status == "draft" ? " selected" : ""}>draft</option></select></div></div>
<label>Markdown + LaTeX: $x^2$ inline, $$ ... $$ block</label><textarea id="bd" rows="16" data-p="body">${e(p.body)}</textarea><button class="b g" id="i1">$ inline $</button><button class="b g" id="i2">$$ block $$</button>
<label>preview</label><div id="pv" class="post pv">${md(p.body)}</div></div>
${pane(p.pdf, 'data-p="pdf"')}</div>
<button class="b" id="ps">Save post + write posts.json</button><button class="b g" id="pb">Back to list</button><button class="b g" id="pe">Export posts.json</button><button class="b r" id="pd">Delete</button> <span id="ms" style="font-size:.85rem;color:var(--mut)"></span></div>`;
  return `<div class="ad"><h2>Blog posts</h2><div class="sub">Posts and drafts are saved in this browser. Save post writes published posts directly to posts.json when using the local server; drafts stay local. Export downloads the published posts.</div><button class="b" id="pn">+ New post</button><button class="b g" id="pe">Export posts.json</button><span id="ms" style="font-size:.85rem;color:var(--mut)"></span>${D.posts.map((x, i) => `<div class="card"><b>${e(x.title)}</b> <span class="sub">· ${e(x.date)} · ${e(x.status || "published")}</span> <button class="b g" data-e="${i}">Edit</button></div>`).join("")}</div>`;
};
const postsJson = () =>
  JSON.stringify(
    D.posts.filter((p) => p.status != "draft"),
    null,
    2,
  );
function downloadPosts() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([postsJson()], { type: "application/json" }),
  );
  a.download = "posts.json";
  a.click();
}
async function writePostsFile() {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: postsJson(),
  });
  if (!response.ok) throw new Error(`Post save failed (${response.status}).`);
  return "written";
}
function bbind() {
  const P = () => D.posts[cur];
  $("#pe").onclick = downloadPosts;
  document.querySelectorAll("[data-e]").forEach(
    (b) =>
      (b.onclick = () => {
        cur = +b.dataset.e;
        draw();
      }),
  );
  if (!P()) {
    $("#pn").onclick = () => {
      D.posts.unshift({
        slug: "post-" + Date.now().toString(36),
        title: "Untitled",
        date: new Date().toISOString().slice(0, 10),
        tags: "",
        status: "draft",
        body: "",
        pdf: "",
      });
      save();
      cur = 0;
      draw();
    };
    return;
  }
  document.querySelectorAll("[data-p]").forEach(
    (el) =>
      (el.oninput = () => {
        P()[el.dataset.p] = el.value;
        if (el.id == "bd") {
          $("#pv").innerHTML = md(el.value);
          tx();
        }
        save();
      }),
  );
  $("#ps").onclick = async () => {
    const p = P();
    p.slug = (p.slug || p.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    save();
    if (p.status == "draft") {
      $("#ms").textContent =
        "Draft saved in this browser; publish it to update posts.json.";
      return;
    }
    try {
      const result = await writePostsFile();
      $("#ms").textContent =
        result == "written"
          ? "Saved and wrote posts.json."
          : "Saved; posts.json was downloaded.";
    } catch (x) {
      $("#ms").textContent =
        "Saved in this browser, but posts.json could not be written. Open the site with node server.js or use Export posts.json.";
    }
  };
  $("#pb").onclick = () => {
    cur = null;
    draw();
  };
  $("#pd").onclick = () => {
    if (confirm("Delete this post?")) {
      markPostDeleted(P().slug);
      D.posts.splice(cur, 1);
      save();
      cur = null;
      draw();
    }
  };
  const ins = (a, b) => {
    const t = $("#bd"),
      s = t.selectionStart,
      f = t.selectionEnd,
      v = t.value;
    t.value = v.slice(0, s) + a + v.slice(s, f) + b + v.slice(f);
    t.focus();
    t.oninput();
  };
  $("#i1").onclick = () => ins("$", "$");
  $("#i2").onclick = () => ins("\n$$\n", "\n$$\n");
  bindPdf($("#app"));
  tx();
}
function abind() {
  if (!authed) {
    const go = async () => {
      if ((await sh($("#pw").value)) == (gp() || PW)) {
        authed = true;
        try {
          sessionStorage.setItem("sma_auth", "1");
        } catch (x) {}
        draw();
      } else $("#ms").textContent = "Wrong password";
    };
    $("#lg").onclick = go;
    $("#pw").onkeydown = (k) => k.key == "Enter" && go();
    return;
  }
  document.querySelectorAll("[data-t]").forEach(
    (b) =>
      (b.onclick = () => {
        atab = b.dataset.t;
        cur = null;
        draw();
      }),
  );
  $("#lo").onclick = () => {
    authed = false;
    try {
      sessionStorage.removeItem("sma_auth");
    } catch (x) {}
    draw();
  };
  if (atab == "site") bind();
  if (atab == "blog") bbind();
  if (atab == "sec")
    $("#sp").onclick = async () => {
      if (!$("#np").value) return;
      const h = await sh($("#np").value);
      try {
        localStorage.setItem("sma_pw", h);
      } catch (x) {}
      $("#ho").textContent = h;
    };
}
async function loadExt() {
  try {
    const b = location.pathname
      .replace(/admin\/?(index\.html)?$/, "")
      .replace(/[^\/]*\.html$/, "");
    const r = await fetch(b + "posts.json");
    if (!r.ok) return;
    let n = 0;
    const deleted = new Set(deletedPosts());
    (await r.json()).forEach((p) => {
      if (!deleted.has(p.slug) && !D.posts.some((x) => x.slug == p.slug)) {
        D.posts.push(p);
        n++;
      }
    });
    if (n) draw();
  } catch (x) {}
}
function draw() {
  const hp = (location.hash || "").slice(1).split("/"),
    isA = /\/admin\/?(index\.html)?$/.test(location.pathname),
    p = hp[0] || (isA ? "admin" : "about"),
    pg = R[p] ? p : "about";
  syncOptionalNav();
  $("#app").innerHTML = R[pg](hp[1]);
  document.title = D.name + (pg == "about" ? "" : " | " + pg);
  $("#brand").innerHTML =
    `<b>${e(D.name.split(" ")[0])}</b> ${e(D.name.split(" ").slice(1).join(" "))}`;
  const footerName = $("#fn"),
    footerYear = $("#fy");
  if (footerName) footerName.textContent = D.name;
  if (footerYear) footerYear.textContent = new Date().getFullYear();
  document
    .querySelectorAll("nav a.l")
    .forEach((a) => a.classList.toggle("on", a.hash == "#" + pg));
  $("nav").classList.remove("open");
  $("#mb").setAttribute("aria-expanded", "false");
  if (pg == "admin") {
    abind();
    const passwordInput = !authed ? $("#pw") : atab == "sec" ? $("#np") : null;
    passwordInput?.focus();
  } else scrollTo(0, 0);
  bindFeatureInteractions();
  tx();
}
addEventListener("hashchange", draw);
$("#mb").onclick = () => {
  const o = $("nav").classList.toggle("open");
  $("#mb").setAttribute("aria-expanded", o);
};
/* theme: light by default; user choice persisted */
$("#tg").onclick = () => {
  const r = document.documentElement,
    t = r.dataset.theme == "dark" ? "light" : "dark";
  r.dataset.theme = t;
  try {
    localStorage.setItem("sma_theme", t);
  } catch (x) {}
};
draw();
addEventListener("load", tx);
loadExt();
