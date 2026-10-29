import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import {
  checkReferentialIntegrity, parseListings, validateProperty, validatePropertySponsor, validateSponsor,
  type Property, type PropertySponsor, type Sponsor,
} from "../src/contract/validator";

const read = <T>(p: string) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), "utf8")) as T;
const properties = read<Property[]>("data/seed/properties.json");
const sponsors = read<Sponsor[]>("data/seed/sponsors.json");
const links = read<PropertySponsor[]>("data/seed/property_sponsors.json");

describe("valid records", () => {
  it("accepts a valid property", () => {
    const res = validateProperty(properties[0]);
    expect(res.ok).toBe(true);
  });
  it.each(properties.map((p) => [p.property_id, p] as const))("seed property %s passes", (_id, p) => {
    expect(validateProperty(p).ok).toBe(true);
  });
  it("all seed sponsors and links pass", () => {
    expect(sponsors.every((s) => validateSponsor(s).ok)).toBe(true);
    expect(links.every((l) => validatePropertySponsor(l).ok)).toBe(true);
  });
  it("seed data is referentially coherent", () => {
    expect(checkReferentialIntegrity(properties, sponsors, links)).toEqual([]);
  });
});

describe("invalid fixtures fail for the expected reason", () => {
  const dir = new URL("./fixtures/invalid/", import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  it("has at least the four required invalid cases", () => {
    for (const must of ["missing-id", "negative-price", "bad-zip", "unknown-field"]) expect(files).toContain(`${must}.json`);
  });
  it.each(files)("%s", (file) => {
    const fx = JSON.parse(readFileSync(new URL(file, dir), "utf8")) as { expect: { keyword: string; path: string }; record: unknown };
    const res = validateProperty(fx.record);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      // Exactly the expected failure, and nothing else: guards against fixtures failing by accident.
      expect(res.issues.map((i) => ({ keyword: i.keyword, path: i.path }))).toEqual([fx.expect]);
    }
  });
});

describe("integrity rules the schema cannot express", () => {
  it("flags a sponsor that does not serve the property's ZIP", () => {
    const moved = properties.map((p, i) => (i === 0 ? { ...p, zip_code: "10001" } : p));
    expect(checkReferentialIntegrity(moved, sponsors, links).join("\n")).toMatch(/does not serve ZIP 10001/);
  });
  it("flags an unknown sponsor", () => {
    const broken = structuredClone(properties);
    broken[0].local_sponsors[0].sponsor_id = "SPN-999";
    expect(checkReferentialIntegrity(broken, sponsors, links).join("\n")).toMatch(/sponsor does not exist/);
  });
});

describe("parseListings: the UI boundary fails safely", () => {
  it("separates valid from rejected and never throws", () => {
    const { valid, rejected } = parseListings([properties[0], { property_id: "PROP-9999" }, null, "nonsense"]);
    expect(valid).toHaveLength(1);
    expect(rejected.map((r) => r.index)).toEqual([1, 2, 3]);
    expect(rejected[0].id).toBe("PROP-9999");
    expect(rejected[1].id).toBeNull();
  });
  it("rejects a non-array payload", () => {
    expect(parseListings({ not: "an array" }).valid).toEqual([]);
    expect(parseListings(undefined).rejected).toHaveLength(1);
  });
});

describe("AI Studio generation runs (simulated, see data/generated/README.md)", () => {
  it("run 001 contains the documented errors", () => {
    const { valid, rejected } = parseListings(read("data/generated/ai-studio-run-001.raw.json"));
    expect(valid).toHaveLength(1);
    const found = rejected.flatMap((r) => r.issues.map((i) => `${i.keyword}:${i.path}`)).sort();
    expect(found).toEqual(["additionalProperties:/lot_size_sqft", "enum:/amenities/0", "pattern:/zip_code", "type:/bedrooms", "type:/price"]);
  });
  it("run 002 passes after prompt and schema fixes", () => {
    const { valid, rejected } = parseListings(read("data/generated/ai-studio-run-002.raw.json"));
    expect(rejected).toEqual([]);
    expect(valid).toHaveLength(5);
  });
});
