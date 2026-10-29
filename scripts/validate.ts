/**
 * Validator CLI.
 *   npm run validate                      -> validates data/seed/* (+ referential integrity). Exit 1 on any problem.
 *   npm run validate:generated            -> validates AI Studio runs, prints every error, exit 0 (--report).
 *   tsx scripts/validate.ts <file.json>   -> validates any array of Property records.
 * Errors are CAPTURED AND REPORTED. This script never edits or repairs data.
 */
import { readFileSync } from "node:fs";
import {
  checkReferentialIntegrity, parseListings, validateProperty, validatePropertySponsor, validateSponsor,
  type Property, type PropertySponsor, type Sponsor,
} from "../src/contract/validator";

const args = process.argv.slice(2);
const report = args.includes("--report");
const files = args.filter((a) => !a.startsWith("--"));
const read = (p: string): unknown => JSON.parse(readFileSync(p, "utf8"));
let failures = 0;

function checkAll<T>(label: string, input: unknown, fn: (x: unknown) => ReturnType<typeof validateProperty> | ReturnType<typeof validateSponsor> | ReturnType<typeof validatePropertySponsor>): T[] {
  const ok: T[] = [];
  (input as unknown[]).forEach((rec, i) => {
    const res = fn(rec);
    if (res.ok) ok.push(res.data as T);
    else {
      failures++;
      console.log(`  FAIL ${label}[${i}]`);
      res.issues.forEach((x) => console.log(`       ${x.path.padEnd(22)} ${x.keyword.padEnd(20)} ${x.message}`));
    }
  });
  return ok;
}

if (files.length === 0) {
  console.log("Validating seed data (synthetic)");
  const props = read("data/seed/properties.json") as unknown[];
  const sponsors = read("data/seed/sponsors.json") as unknown[];
  const links = read("data/seed/property_sponsors.json") as unknown[];
  const p = checkAll<Property>("property", props, validateProperty);
  const s = checkAll<Sponsor>("sponsor", sponsors, validateSponsor);
  const l = checkAll<PropertySponsor>("property_sponsor", links, validatePropertySponsor);
  console.log(`  properties ${p.length}/${props.length} valid, sponsors ${s.length}/${sponsors.length} valid, links ${l.length}/${links.length} valid`);
  const problems = checkReferentialIntegrity(p, s, l);
  problems.forEach((x) => { failures++; console.log(`  FAIL integrity: ${x}`); });
  console.log(problems.length === 0 ? "  referential integrity: OK" : `  referential integrity: ${problems.length} problem(s)`);
} else {
  for (const f of files) {
    const { valid, rejected } = parseListings(read(f));
    console.log(`\n${f}\n  ${valid.length} valid, ${rejected.length} rejected`);
    for (const r of rejected) {
      failures++;
      console.log(`  REJECTED index=${r.index} id=${r.id ?? "(none)"}`);
      r.issues.forEach((x) => console.log(`       ${x.path.padEnd(22)} ${x.keyword.padEnd(20)} ${x.message}`));
    }
  }
}

console.log(failures === 0 ? "\nRESULT: PASS" : `\nRESULT: ${failures} problem(s) found`);
process.exit(report ? 0 : failures === 0 ? 0 : 1);
