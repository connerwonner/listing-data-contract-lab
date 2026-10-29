import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { voiceResponse } from "../src/lib/voice";
import type { Property } from "../src/contract/validator";

const props = JSON.parse(readFileSync(new URL("../data/seed/properties.json", import.meta.url), "utf8")) as Property[];

describe("voiceResponse", () => {
  it("speaks half baths and sorted sponsors", () => {
    const t = voiceResponse(props[0]);
    expect(t).toContain("4 bedrooms");
    expect(t).toContain("2 and a half baths");
    expect(t).toContain("849,000 dollars");
    expect(t.indexOf("Bridgewater Lending")).toBeLessThan(t.indexOf("Northwind Title"));
  });
  it("handles studios, units, and no sponsors", () => {
    const t = voiceResponse({ ...props[1], bedrooms: 0, bathrooms: 1, local_sponsors: [] });
    expect(t).toContain("a studio");
    expect(t).toContain("unit 5B");
    expect(t).not.toContain("Local help");
  });
});
