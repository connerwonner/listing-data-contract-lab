# PR: Explicit data contract for listings (Week 3)

## Summary
Adds a JSON Schema data contract (Property, Sponsor, PropertySponsor), an Ajv validator, 5 synthetic seed listings, tests, generated TypeScript types, and a UI that renders **validated data only**. Invalid records are rejected and reported, never rendered.

## Sample validator output
```text
$ npm run validate
Validating seed data (synthetic)
  properties 5/5 valid, sponsors 7/7 valid, links 14/14 valid
  referential integrity: OK

RESULT: PASS
```

```text
$ npm run validate:generated   (AI Studio run 001, saved unedited)
  1 valid, 4 rejected
  /price           type                 must be integer
  /zip_code        pattern              must match pattern "^[0-9]{5}$"
  /lot_size_sqft   additionalProperties must NOT have additional properties
  /bedrooms        type                 must be integer
  /amenities/0     enum                 must be equal to one of the allowed values
data/generated/ai-studio-run-002.raw.json: 5 valid, 0 rejected
```

## Verification
- [x] `npm run lint`, `npm test` (26 passing), `npm run build`
- [x] All seed records pass; each invalid fixture fails for its expected keyword and path
- [x] No real client or personal data anywhere
- [x] UI consumes `parseListings().valid` only

See `docs/adr/001-data-contract.md` for the decision and alternatives.
