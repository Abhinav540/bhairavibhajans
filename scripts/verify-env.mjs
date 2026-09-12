#!/usr/bin/env node
/**
 * Local env-var verification script.
 * Run: npm run verify:env
 * NEVER prints secret values — only booleans, formats, and masked hosts.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const REQUIRED_BUILD = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const REQUIRED_SERVER = ["SUPABASE_SERVICE_ROLE_KEY"];
const OPTIONAL = ["ADMIN_ALLOWED_EMAIL", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];

function loadEnvLocal() {
  const file = join(process.cwd(), ".env.local");
  if (!existsSync(file)) return {};
  const env = {};
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[m[1]] = val;
  }
  return env;
}

const env = { ...process.env, ...loadEnvLocal() };
const has = (k) => Boolean((env[k] ?? "").trim());
const result = (label, ok, hint) => {
  console.log(`${ok ? "  OK " : "FAIL"}  ${label}${hint ? "  (" + hint + ")" : ""}`);
  return ok;
};

let ok = true;
console.log("\n=== Bhairavi Bhajans — env verification ===\n");

console.log("[required at build time — NEXT_PUBLIC)");
for (const k of REQUIRED_BUILD) ok = result(k, has(k), "baked into the client bundle by Next.js") && ok;

console.log("\n[required server-side]");
for (const k of REQUIRED_SERVER) ok = result(k, has(k), "used by the admin API / auth checks") && ok;

console.log("\n[optional]");
for (const k of OPTIONAL) result(k, has(k), "may be required for specific features");

if (has("NEXT_PUBLIC_SUPABASE_URL")) {
  try {
    const u = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
    ok = result("NEXT_PUBLIC_SUPABASE_URL format", u.protocol === "https:" && /\.supabase\.co$/.test(u.hostname), "host: " + u.hostname) && ok;
  } catch {
    ok = result("NEXT_PUBLIC_SUPABASE_URL format", false, "not a valid URL") && ok;
  }
}

console.log(ok ? "\nResult: OK\n" : "\nResult: FAIL — set the missing vars and redeploy.\n");
process.exit(ok ? 0 : 1);
