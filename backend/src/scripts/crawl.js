import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import ProblemDetail from "../models/ProblemDetail.model.js";

// ─── Config ───────────────────────────────────────────────────────────────────

const MONGO_URI        = process.env.MONGO_URI        || "mongodb+srv://abhijeet62008:5nHhIz12uMQJrb9e@remote-interview.ydeneb1.mongodb.net/?appName=remote-interview";
const BASE_URL         = process.env.BASE_URL         || "http://localhost:3000";
const LOG_FILE         = path.resolve("./similar-questions-log.json");

const CONCURRENCY      = Number(process.env.CONCURRENCY)      || 8;
const REQUEST_DELAY_MS = Number(process.env.REQUEST_DELAY_MS) || 120;
const LOG_FLUSH_EVERY  = Number(process.env.LOG_FLUSH_EVERY)  || 25;
const MAX_RETRIES      = 3;
const RETRY_BASE_MS    = 500;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Log (Windows-safe atomic write) ─────────────────────────────────────────

async function ensureLog() {
  try { await fs.access(LOG_FILE); } catch {
    await fs.writeFile(LOG_FILE, JSON.stringify({
      completed: {}, failed: {},
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, null, 2), "utf-8");
  }
}

async function readLog() {
  await ensureLog();
  return JSON.parse(await fs.readFile(LOG_FILE, "utf-8"));
}

async function writeLog(log) {
  log.updatedAt = new Date().toISOString();
  const data = JSON.stringify(log, null, 2);
  const tmp  = LOG_FILE + ".tmp";
  try {
    await fs.writeFile(tmp, data, "utf-8");
    try { await fs.unlink(LOG_FILE); } catch { /* first run */ }
    await fs.rename(tmp, LOG_FILE);
  } catch {
    await fs.writeFile(LOG_FILE, data, "utf-8");
    try { await fs.unlink(tmp); } catch { /* ignore */ }
  }
}

// ─── Parse similarQuestions ───────────────────────────────────────────────────
// The API returns it as a JSON string — parse and extract only what we need.

function parseSimilarQuestions(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((q) => ({
      title:      q.title      || "",
      titleSlug:  q.titleSlug  || "",
      difficulty: q.difficulty || "",
    }));
  } catch {
    return [];
  }
}

// ─── Fetch with retry + backoff ───────────────────────────────────────────────

async function fetchBySlug(titleSlug, attempt = 1) {
  const url = `${BASE_URL}/select/raw?titleSlug=${encodeURIComponent(titleSlug)}`;

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    if (attempt <= MAX_RETRIES) {
      await sleep(RETRY_BASE_MS * 2 ** (attempt - 1));
      return fetchBySlug(titleSlug, attempt + 1);
    }
    throw err;
  }

  if (response.status === 429) {
    const wait = Number(response.headers.get("retry-after") || 0) * 1000 || RETRY_BASE_MS * 2 ** attempt;
    if (attempt <= MAX_RETRIES + 2) {
      process.stderr.write(`\n  [429] ${titleSlug} — waiting ${wait}ms\n`);
      await sleep(wait);
      return fetchBySlug(titleSlug, attempt + 1);
    }
  }

  if (response.status === 403 || response.status === 401) throw new Error(`HTTP ${response.status} (paid)`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data = await response.json();
  if (!data?.question) throw new Error("Invalid payload");

  return data.question;
}

// ─── Concurrency pool ─────────────────────────────────────────────────────────

async function pool(tasks, concurrency) {
  const iter    = tasks[Symbol.iterator]();
  const workers = Array.from({ length: concurrency }, async () => {
    for (;;) {
      const { value: task, done } = iter.next();
      if (done) break;
      await task();
    }
  });
  await Promise.all(workers);
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function progress(done, total, saved, failed, skipped) {
  const pct    = total ? Math.round((done / total) * 100) : 0;
  const filled = Math.round(pct / 2);
  const bar    = "█".repeat(filled) + "░".repeat(50 - filled);
  process.stdout.write(
    `\r[${bar}] ${pct}% | ${done}/${total} | ✓ ${saved} patched | ✗ ${failed} failed | ~ ${skipped} skipped`
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected\n");

  const log = await readLog();

  // Fetch all ProblemDetail docs that don't yet have similarQuestions
  // (or have it as undefined/null — field doesn't exist in schema yet, we use updateOne)
  const allDocs = await ProblemDetail
    .find({}, { titleSlug: 1, isPaidOnly: 1, _id: 1 })
    .sort({ questionFrontendId: 1 })
    .lean();

  console.log(`Total ProblemDetail docs : ${allDocs.length}`);

  // Docs already patched (in DB) — check via a field presence query
  const alreadyPatched = new Set(
    (await ProblemDetail
      .find({ similarQuestions: { $exists: true } }, { titleSlug: 1, _id: 0 })
      .lean()
    ).map((d) => d.titleSlug)
  );

  const pending = allDocs.filter(({ titleSlug, isPaidOnly }) => {
    if (!titleSlug)               return false;
    if (isPaidOnly)               return false; // skip paid — no data available
    if (log.completed[titleSlug]) return false;
    if (alreadyPatched.has(titleSlug)) {
      // Mark in log so future runs don't query DB again
      log.completed[titleSlug] = { status: "already_patched", at: new Date().toISOString() };
      return false;
    }
    return true;
  });

  const total       = allDocs.length;
  const skippedInit = total - pending.length;

  console.log(`Already patched / paid : ${skippedInit}`);
  console.log(`To process             : ${pending.length}`);
  console.log(`Concurrency            : ${CONCURRENCY}\n`);

  await writeLog(log); // flush bulk pre-check

  let done    = skippedInit;
  let saved   = 0;
  let failed  = 0;
  let skipped = skippedInit;
  let flushCounter = 0;

  const flush = async () => { await writeLog(log); flushCounter = 0; };

  const tasks = pending.map(({ _id, titleSlug }) => async () => {
    try {
      const raw               = await fetchBySlug(titleSlug);
      const similarQuestions  = parseSimilarQuestions(raw.similarQuestions);

      // Patch only the similarQuestions field — leave everything else untouched
      await ProblemDetail.updateOne(
        { _id },
        { $set: { similarQuestions } }
      );

      log.completed[titleSlug] = { status: "patched", count: similarQuestions.length, at: new Date().toISOString() };
      delete log.failed[titleSlug];
      saved++;
    } catch (err) {
      const isPaid = /403|401|paid/i.test(err.message);
      if (isPaid) {
        log.completed[titleSlug] = { status: "skipped_paid", at: new Date().toISOString() };
        delete log.failed[titleSlug];
        skipped++;
      } else {
        log.failed[titleSlug] = { status: "failed", message: err.message, at: new Date().toISOString() };
        failed++;
        process.stderr.write(`\n[FAILED] ${titleSlug} — ${err.message}\n`);
      }
    }

    done++;
    flushCounter++;
    progress(done, total, saved, failed, skipped);
    if (flushCounter >= LOG_FLUSH_EVERY) await flush();
    await sleep(REQUEST_DELAY_MS);
  });

  progress(done, total, saved, failed, skipped);
  await pool(tasks, CONCURRENCY);
  await flush();

  console.log("\n\n─── Done ───────────────────────────────────");
  console.log({ total, pending: pending.length, patched: saved, failed, skipped });

  if (failed > 0) {
    console.log(`\nFailed slugs are in ${LOG_FILE} under "failed". Re-run to retry.`);
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("\nFatal:", err);
  await mongoose.disconnect();
  process.exit(1);
});