# Step 12: Normalization problems and the amenities decision

Both ChatGPT and Gemini were asked to critique the contract (prompt and notes in `docs/ai-collaboration-log.md`). This page records the problems that were found and what we decided.

## Decision: amenities

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Free text (`string[]`) | Zero friction, any feed works | "Pool", "pool", "Swimming Pool", "in-ground pool" all differ; can't filter or count; AI output drifts | Rejected |
| **Controlled values (`enum`)** | Filterable, consistent labels, validator catches drift, tiny payload | Adding a value is a schema change | **Chosen for v1** |
| Join table (`Amenity`, `PropertyAmenity`) | Scales to hundreds of values, per-amenity attributes (e.g. pool: heated), data-driven vocabulary | More tables and queries, over-built for 16 values | Deferred |

**Trigger to migrate to a join table:** more than about 30 amenity values, the need for per-amenity attributes, or a vocabulary that product (not engineering) must edit without a deploy. The enum values are already stable snake_case keys, so they become `amenity_id` primary keys with no data migration.

## Other normalization findings

| # | Finding | Risk | Decision |
|---|---|---|---|
| 1 | `local_sponsors` repeats `name` and `category` from Sponsor | Embedded copy can go stale | Accepted as a read model. `checkReferentialIntegrity` and tests fail if it disagrees |
| 2 | `city`, `state` are functionally dependent on `zip_code` | Inconsistent triples (e.g. 97201 + TX) | Not enforced in v1: needs a ZIP reference table. Listed as a follow-up |
| 3 | `bathrooms` as a decimal (2.5) mixes full and half baths | Floating-point oddities; RESO uses separate counts | Kept for UI simplicity; `multipleOf: 0.5` constrains it. Mapped to full/half in `reso-mapping.md` |
| 4 | `state` is a pattern, not an enum of 51 codes | `ZZ` would pass | Accepted for v1; swap to an enum when a jurisdiction list is needed |
| 5 | `price` as a JSON number | Floats and currency symbols | Integer whole USD; currency is implicit USD and documented |
| 6 | `unit` inside street address vs separate field | Duplicate parsing | Separate optional `unit`; `street_address` must not include it |
| 7 | `listing_status` vocabulary differs between MLSs | Mapping loss | Four-value enum, mapped to RESO `StandardStatus` |
| 8 | Placement rank duplicated on Property and PropertySponsor | Two sources of truth | PropertySponsor is authoritative; equality enforced by integrity check |
