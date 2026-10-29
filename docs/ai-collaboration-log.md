# AI collaboration log

> **Status: representative and simulated.** The entries below show the format and the kind of findings expected, and every "verification" and "commit" line refers to real work in this repo. The transcripts themselves were **not** captured from live ChatGPT or Gemini sessions. To complete the lab with real evidence, run the prompts below in each tool, then replace the **Output** summaries with what you actually received. Keep the Verification lines. Never paste secrets or private data into any tool.

## Prompt pattern (used for both tools)

```text
Given these fictional listing requirements, propose a strict JSON Schema.
Identify ambiguous business rules before writing the schema.
Then provide valid and intentionally invalid examples and explain what a validator should reject.

Requirements: a Property needs property_id, address fields, price, bedrooms, bathrooms,
square_feet, amenities, zip_code and local_sponsors. Sponsors are separate entities linked
through a join. The UI has a property card, a detail page, a sponsor picker and a voice response.
Use draft 2020-12, additionalProperties false, non-negative numbers, enums where sensible.
```

## Entry 1: ChatGPT, schema proposal and ambiguities

| | |
|---|---|
| **Date** | 2026-10-29 |
| **Prompt** | The pattern above |
| **Useful output** | Asked whether `price` can be 0 or "contact agent"; flagged ZIP as a string to preserve leading zeros; suggested integer dollars; suggested `uniqueItems` on amenities; proposed an invalid fixture where `bedrooms` is `3.5` |
| **Rejected output** | Suggested `unevaluatedProperties: false` with `allOf` composition. Rejected: more complex than `additionalProperties: false` and no composition needed here. Also suggested embedding the full Sponsor object in each Property. Rejected: duplicates phone/website on every card |
| **Verification** | Added the ambiguities to `docs/requirements-facts.md` (table, 10 rows); fixtures `fractional-bedrooms` and `bad-zip` fail with the expected keyword (`npm test`) |
| **Commit** | `feat(schema): add Property, Sponsor, PropertySponsor JSON Schemas` |

## Entry 2: Gemini, critique of the draft schema

| | |
|---|---|
| **Date** | 2026-10-29 |
| **Prompt** | The pattern above plus the draft `property.schema.json` |
| **Useful output** | Pointed out that `local_sponsors` duplicates `name` and `category` from Sponsor and can go stale; noted `bathrooms: 2.5` doesn't map cleanly to RESO full/half counts; recommended a flattened schema for AI Studio's response schema panel |
| **Rejected output** | Recommended a `format: "postal-code"`. Rejected: not a standard JSON Schema format and Ajv strict mode would throw; used `pattern` instead. Suggested making `local_sponsors` optional. Rejected: the requirement says it is required, and an empty array already models "none" |
| **Verification** | Wrote `checkReferentialIntegrity` and two tests that mutate seed data to prove it catches stale or unknown sponsors; added `scripts/bundle-schema.ts`; CI guards the generated file |
| **Commit** | `feat(validator): cross-record integrity checks and AI Studio schema bundle` |

## Entry 3: Both tools, normalization problems (Step 12)

| | |
|---|---|
| **Prompt** | "Here is the schema and seed data. List normalization problems and decide whether amenities should be free text, controlled values, or a join table." |
| **Useful output** | Both recommended starting with controlled values and moving to a join table later; both noted city/state/ZIP are functionally dependent; Gemini added that `listing_status` vocabularies differ by MLS |
| **Rejected output** | One suggestion to go straight to a join table now. Rejected for 16 values, with a written migration trigger instead |
| **Verification** | Decision recorded in `docs/normalization-review.md` and `docs/adr/001-data-contract.md`; fixture `amenity-not-in-vocabulary` proves the enum rejects `"Swimming Pool"` |
| **Commit** | `docs: normalization review, RESO mapping, ADR 001` |

## Entry 4: AI Studio, data generation (Steps 5–8)

See `docs/ai-studio-prompt.md` for prompts, captured validator errors, and the layer-by-layer fixes. Run 001: 4 of 5 rejected. Run 002: 5 of 5 valid.
**Verification:** `npm run validate:generated`, `tests/contract.test.ts` ("AI Studio generation runs").
**Commit:** `feat(data): seed data and AI Studio runs 001/002 (synthetic)`

## What I'd tell a teammate

AI is good at *surfacing questions* (what does 0 bedrooms mean?) and bad at *knowing your validator's rules* (it proposed a non-standard `format`). The validator, not the model, decides what is correct.
