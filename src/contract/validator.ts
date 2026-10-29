import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import commonSchema from "../../schemas/common.schema.json";
import propertySchema from "../../schemas/property.schema.json";
import sponsorSchema from "../../schemas/sponsor.schema.json";
import propertySponsorSchema from "../../schemas/property-sponsor.schema.json";
import type { Property, Sponsor, PropertySponsor } from "./types.generated";

export type { Property, Sponsor, PropertySponsor, SponsorSummary } from "./types.generated";

/** One human-readable problem found by the validator. */
export interface ContractIssue {
  /** JSON-pointer-ish location, e.g. "/zip_code" or "/amenities/1". "/" means the whole record. */
  path: string;
  /** The JSON Schema keyword that failed (required, pattern, enum, additionalProperties...). */
  keyword: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; issues: ContractIssue[] };

// strict: true makes Ajv throw on typos in the schema itself (e.g. "minumum").
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(commonSchema);

const compiled = {
  property: ajv.compile<Property>(propertySchema),
  sponsor: ajv.compile<Sponsor>(sponsorSchema),
  propertySponsor: ajv.compile<PropertySponsor>(propertySponsorSchema),
};

function toIssue(e: ErrorObject): ContractIssue {
  // Point at the offending field, not its parent, for "required" and "additionalProperties".
  let path = e.instancePath || "";
  if (e.keyword === "required") path += `/${e.params.missingProperty}`;
  if (e.keyword === "additionalProperties") path += `/${e.params.additionalProperty}`;
  return { path: path || "/", keyword: e.keyword, message: e.message ?? "invalid" };
}

function run<T>(fn: ValidateFunction<T>, input: unknown): ValidationResult<T> {
  if (fn(input)) return { ok: true, data: input };
  return { ok: false, issues: (fn.errors ?? []).map(toIssue) };
}

export const validateProperty = (input: unknown) => run(compiled.property, input);
export const validateSponsor = (input: unknown) => run(compiled.sponsor, input);
export const validatePropertySponsor = (input: unknown) => run(compiled.propertySponsor, input);

export interface RejectedRecord {
  index: number;
  /** Best-effort ID for logs; never trusted. */
  id: string | null;
  issues: ContractIssue[];
}

/**
 * The only door between untrusted data (API, AI output, files) and the UI.
 * Valid records pass through; invalid ones are reported, never rendered, never "fixed".
 */
export function parseListings(input: unknown): { valid: Property[]; rejected: RejectedRecord[] } {
  if (!Array.isArray(input)) {
    return {
      valid: [],
      rejected: [{ index: -1, id: null, issues: [{ path: "/", keyword: "type", message: "must be an array of listings" }] }],
    };
  }
  const valid: Property[] = [];
  const rejected: RejectedRecord[] = [];
  input.forEach((item, index) => {
    const res = validateProperty(item);
    if (res.ok) valid.push(res.data);
    else {
      const maybeId = (item as { property_id?: unknown } | null)?.property_id;
      rejected.push({ index, id: typeof maybeId === "string" ? maybeId : null, issues: res.issues });
    }
  });
  return { valid, rejected };
}

/**
 * Rules JSON Schema cannot express because they span multiple records.
 * Returns a list of problems; empty list means the dataset is coherent.
 */
export function checkReferentialIntegrity(
  properties: Property[],
  sponsors: Sponsor[],
  links: PropertySponsor[],
): string[] {
  const problems: string[] = [];
  const sponsorById = new Map(sponsors.map((s) => [s.sponsor_id, s]));
  const propertyIds = new Set(properties.map((p) => p.property_id));
  if (propertyIds.size !== properties.length) problems.push("duplicate property_id in properties");
  if (sponsorById.size !== sponsors.length) problems.push("duplicate sponsor_id in sponsors");

  const linkKeys = new Set<string>();
  for (const l of links) {
    const key = `${l.property_id}|${l.sponsor_id}`;
    if (linkKeys.has(key)) problems.push(`duplicate link ${key}`);
    linkKeys.add(key);
    if (!propertyIds.has(l.property_id)) problems.push(`link ${key}: unknown property_id`);
    if (!sponsorById.has(l.sponsor_id)) problems.push(`link ${key}: unknown sponsor_id`);
  }

  for (const p of properties) {
    const ranks = new Set<number>();
    for (const ls of p.local_sponsors) {
      const where = `${p.property_id}/${ls.sponsor_id}`;
      const s = sponsorById.get(ls.sponsor_id);
      if (!s) { problems.push(`${where}: sponsor does not exist`); continue; }
      if (s.name !== ls.name) problems.push(`${where}: embedded name "${ls.name}" != sponsor "${s.name}"`);
      if (s.category !== ls.category) problems.push(`${where}: embedded category differs from sponsor`);
      if (!s.active) problems.push(`${where}: sponsor is inactive`);
      if (!s.service_zip_codes.includes(p.zip_code)) problems.push(`${where}: sponsor does not serve ZIP ${p.zip_code}`);
      if (ranks.has(ls.placement_rank)) problems.push(`${where}: duplicate placement_rank ${ls.placement_rank}`);
      ranks.add(ls.placement_rank);
      const link = links.find((l) => l.property_id === p.property_id && l.sponsor_id === ls.sponsor_id);
      if (!link) problems.push(`${where}: no PropertySponsor row`);
      else if (link.placement_rank !== ls.placement_rank) problems.push(`${where}: rank differs from PropertySponsor row`);
    }
  }
  return problems;
}
