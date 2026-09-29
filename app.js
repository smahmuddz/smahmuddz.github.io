let D;
try {
  D = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || "{}"));
} catch (x) {
  D = JSON.parse(JSON.stringify(DEF));
}
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
const rows = (a, f) => a.map(f).join("");
const pubHtml = (p) =>
  `<div class="pub"><div class="ab"><span>${e(p.abbr)}</span></div><div><div class="tt">${e(p.title)}</div><div class="au">${e(p.authors).replace(e(D.name), "<u>" + e(D.name) + "</u>")}</div><div class="au"><em>${e(p.venue)}</em>${p.year ? ", " + e(p.year) : ""}</div>${p.doi ? `<a class="bt" href="${e(p.doi)}" target="_blank" rel="noopener">DOI</a>` : ""}${p.pdf && !p.pdf.startsWith("data:") ? `<a class="bt" href="${e(p.pdf)}" target="_blank" rel="noopener">PDF</a>` : ""}</div></div>`;

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
${H("star", "research interests")}<div>${(D.interests || "")
      .split(/,\s*/)
      .map((t) => `<span class="tag">${e(t)}</span>`)
      .join(
        "",
      )}</div>${H("cap", "affiliations")}<div class="aff">${affs()}</div>${H("news", "news")}${rows(D.news, (n) => `<div class="row"><div class="d">${e(n.date)}</div><div class="x">${e(n.text)}</div></div>`)}
${H("book", "selected publications")}${rows(D.pubs.slice(0, 3), pubHtml)}`;
  },
  publications: () =>
    `<h1 class="t">publications</h1><div class="sub">Peer-reviewed papers, listed by year.</div>${rows(D.pubs, pubHtml)}${D.scholar ? `<p style="margin-top:20px"><a href="${e(D.scholar)}" target="_blank" rel="noopener">See Google Scholar profile →</a></p>` : ""}`,
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
  .join("")}</div>`;
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
