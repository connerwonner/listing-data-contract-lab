# ADR 001: Explicit, validated data contract for listings

- **Status:** Accepted
- **Date:** 2026-10-29
- **Deciders:** Project author (with AI critique from ChatGPT and Gemini, see `docs/ai-collaboration-log.md`)

## Context

The app shows a property card, a detail page, a sponsor picker and a voice response. Data arrives from seed files today and will arrive from AI-generated drafts and, later, a real feed and database. Without an explicit contract, each surface makes its own assumptions (is `price` a number or `"$612,000"`? is ZIP a number?) and bad data surfaces as a broken card, or worse, a wrong spoken answer.

AI-generated data made the problem concrete: in the first AI Studio run, 4 of 5 records broke the contract in five different ways (`docs/validation/generated.validator-output.txt`).

## Decision

1. **JSON Schema (draft 2020-12) is the single source of truth.** Files live in `schemas/`: `common`, `property`, `sponsor`, `property-sponsor`.
2. **Three entities, not one.** Property, Sponsor and PropertySponsor (composite PK) are separate. `Property.local_sponsors` is an explicitly denormalized read model, kept honest by `checkReferentialIntegrity`.
3. **Strict by default.** `additionalProperties: false` everywhere, required fields listed explicitly, non-negative / positive numeric bounds, patterns for IDs and ZIP (string, 5 digits), enums for `property_type`, `listing_status`, sponsor `category` and amenities, minimum string lengths, `maxItems: 3` on sponsors.
4. **Runtime validation with Ajv in strict mode** (`src/contract/validator.ts`). The only way data reaches the UI is `parseListings()`, which returns `{ valid, rejected }`. Invalid records are listed in a "hidden listings" panel and never rendered.
5. **TypeScript types are generated** from the schemas (`npm run gen:types` → `src/contract/types.generated.ts`). CI re-generates and fails on any diff, so types and runtime rules cannot drift.
6. **Cross-record rules live in code**, because JSON Schema can't express them: sponsor exists, serves the property's ZIP, is active, ranks are unique and equal the join row.
7. **Amenities are a controlled enum** in v1 (rationale and migration trigger in `docs/normalization-review.md`).
8. **AI output is never repaired locally.** Errors are captured, then fixed in the prompt, the response schema, or the validator rules (`docs/ai-studio-prompt.md`).
9. A flattened copy of the schema (`schemas/dist/*.ai-studio.schema.json`, via `npm run schema:bundle`) is what gets pasted into AI Studio, because it can't resolve `$ref` across files.

## Alternatives considered

| Alternative | Why not |
|---|---|
| **Zod as the single source** | Excellent TypeScript ergonomics, but AI Studio and other tools consume JSON Schema directly. Using Zod would need a converter in the other direction and Zod-to-JSON-Schema loses constructs. JSON Schema is language-neutral, so the same contract can later validate a Python or Go service |
| Hand-written TS types + separate schema | Guaranteed drift. This is the failure mode the lab warns about |
| TS types only (no runtime check) | Types vanish at runtime; AI and API data is untyped, so nothing would be checked where it matters |
| Free-text amenities | Unfilterable and inconsistent (see run 001: `"Hardwood Floors"`) |
| Amenity join table now | Correct at scale, over-built for 16 values; revisit at ~30 values |
| Embed full Sponsor objects in Property | Bloats every card and duplicates phone/website; the summary is enough for the surfaces |
| Silently coerce bad data (`"$398,000"` → 398000) | Hides upstream bugs and trains the prompt to stay sloppy |
| `additionalProperties: true` | Lets hallucinated fields into the database |

## Consequences

**Positive**
- Every record the UI sees is guaranteed to have the fields it reads; the voice response can't say "undefined bedrooms".
- Failures are specific (`/zip_code pattern`) and testable. Each invalid fixture asserts exactly one expected failure.
- The same schema drives validation, TypeScript types and AI structured output.

**Negative / costs**
- Adding an amenity, sponsor category or property type is a schema change (and a regenerated type), on purpose.
- Strictness means a feed with one extra column fails until the contract is updated. Mitigation: rejected records are reported, not crashing the page.
- `city`/`state`/`zip_code` consistency is **not** enforced (needs a ZIP reference table).
- Some structured-output implementations support only part of JSON Schema (e.g. ignore `pattern`, `multipleOf`). The local validator remains the authority; the model-side schema is a best-effort guide.
- The AI Studio schema is a generated copy; if someone edits it by hand it will drift. CI guards this with `schema:bundle` + `git diff --exit-code`.

**Follow-ups**
- ZIP reference table; state enum.
- Amenity and PropertyAmenity tables when the trigger in `normalization-review.md` is hit.
- Database constraints mirroring the schema (CHECK, FK, composite PK on `property_sponsor`).
