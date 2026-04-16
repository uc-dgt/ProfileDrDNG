import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://deenanathgupta.in";
const ROOT = process.cwd();
const QUIZ_ROOT = path.join(ROOT, "quiz");
const EXCLUDED_STATIC_PAGES = new Set(["quiz.html", "tfquiz.html", "fbquiz.html"]);

const priorityMap = {
  "index.html": "1.0",
  "quizzes.html": "0.9",
  "quiz.html": "0.8",
  "tfquiz.html": "0.8",
  "fbquiz.html": "0.8",
};

const changefreqMap = {
  "index.html": "weekly",
  "quizzes.html": "weekly",
  "quiz.html": "monthly",
  "tfquiz.html": "monthly",
  "fbquiz.html": "monthly",
};

function toUrl(fileName) {
  if (fileName === "index.html") {
    return `${SITE_URL}/`;
  }
  return `${SITE_URL}/${fileName}`;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildUrlEntryFromValues({ loc, lastmod, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

function buildUrlEntry(fileName) {
  const filePath = path.join(ROOT, fileName);
  const stats = fs.statSync(filePath);

  const loc = toUrl(fileName);
  const lastmod = formatDate(stats.mtime);
  const changefreq = changefreqMap[fileName] ?? "monthly";
  const priority = priorityMap[fileName] ?? "0.7";

  return buildUrlEntryFromValues({
    loc,
    lastmod,
    changefreq,
    priority,
  });
}

function walkQuizJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkQuizJsonFiles(absolutePath));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".json")) {
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

function pageForQuizJson(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.includes("_fb_quiz") || lower.includes("-fb-quiz")) {
    return "fbquiz.html";
  }
  if (lower.includes("_tf_quiz") || lower.includes("-tf-quiz")) {
    return "tfquiz.html";
  }
  return "quiz.html";
}

function slugFromQuizJson(absoluteJsonPath) {
  const relative = path.relative(QUIZ_ROOT, absoluteJsonPath);
  const normalized = relative.replaceAll("\\", "/");
  const withoutExt = normalized.slice(0, -".json".length);

  // Keep frontend route format in sync with quizzes.html route scheme.
  return withoutExt.replaceAll("_", "-");
}

function buildDynamicQuizEntries() {
  const jsonFiles = walkQuizJsonFiles(QUIZ_ROOT);
  const entries = [];

  for (const absolutePath of jsonFiles) {
    const stats = fs.statSync(absolutePath);
    const fileName = path.basename(absolutePath);
    const quizPage = pageForQuizJson(fileName);
    const quizSlug = slugFromQuizJson(absolutePath);
    const encodedSlug = encodeURIComponent(quizSlug);

    const loc = `${SITE_URL}/${quizPage}?q=${encodedSlug}`;
    const lastmod = formatDate(stats.mtime);

    entries.push(
      buildUrlEntryFromValues({
        loc,
        lastmod,
        changefreq: "monthly",
        priority: "0.7",
      })
    );
  }

  return entries;
}

function collectHtmlFiles() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".html"))
    .filter((name) => !name.startsWith("_"))
    .filter((name) => !EXCLUDED_STATIC_PAGES.has(name))
    .sort((a, b) => {
      if (a === "index.html") return -1;
      if (b === "index.html") return 1;
      return a.localeCompare(b);
    });
}

function generateSitemap() {
  const files = collectHtmlFiles();
  const staticEntries = files.map(buildUrlEntry);
  const dynamicQuizEntries = buildDynamicQuizEntries();
  const urlEntries = [...staticEntries, ...dynamicQuizEntries].join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    "</urlset>",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml, "utf8");
  console.log(
    `sitemap.xml generated with ${staticEntries.length + dynamicQuizEntries.length} URLs ` +
      `(${staticEntries.length} static + ${dynamicQuizEntries.length} dynamic quiz URLs).`
  );
}

generateSitemap();
