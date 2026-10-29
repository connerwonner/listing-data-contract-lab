/**
 * Produces self-contained schemas (no $ref/$id) for pasting into AI Studio's
 * "Structured output" panel, which does not resolve cross-file references.
 * Output: schemas/dist/property.ai-studio.schema.json and property-batch.ai-studio.schema.json
 */
import $RefParser from "@apidevtools/json-schema-ref-parser";
import { writeFileSync } from "node:fs";

const flat = (await $RefParser.dereference("schemas/property.schema.json")) as Record<string, unknown>;
delete flat.$schema;
delete flat.$id;
delete flat.$defs;

writeFileSync("schemas/dist/property.ai-studio.schema.json", JSON.stringify(flat, null, 2) + "\n");
writeFileSync(
  "schemas/dist/property-batch.ai-studio.schema.json",
  JSON.stringify({ type: "array", minItems: 5, maxItems: 5, items: flat }, null, 2) + "\n",
);
console.log("wrote schemas/dist/*.ai-studio.schema.json");
