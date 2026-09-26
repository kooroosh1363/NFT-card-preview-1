import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../assets/style.css", import.meta.url), "utf8");

const failures = [];

const requirePattern = (pattern, message) => {
  if (!pattern.test(html)) failures.push(message);
};

requirePattern(/<main\b/i, "index.html must include a main landmark.");
requirePattern(/<article\b/i, "index.html must include semantic article markup.");
requirePattern(/<dialog\b/i, "index.html must include the native artwork dialog.");
requirePattern(/aria-live="polite"/i, "Countdown must expose a polite live region.");
requirePattern(/<script[^>]+type="module"/i, "App must load as an ES module.");
requirePattern(/<template\b/i, "Data-driven card template is missing.");

if (/href=["']#["']/i.test(html)) failures.push("Placeholder href=# links are not allowed.");
if (/lorem ipsum/i.test(html)) failures.push("Placeholder lorem ipsum text is not allowed.");
if (/fonts\.googleapis\.com/i.test(css)) failures.push("External Google Fonts are not allowed.");
if (/outline\s*:\s*none/i.test(css)) failures.push("Focus outlines must not be globally disabled.");

if (failures.length > 0) {
  for (const failure of failures) console.error(`[fail] ${failure}`);
  process.exit(1);
}

console.log("[pass] Static accessibility and hygiene checks.");
