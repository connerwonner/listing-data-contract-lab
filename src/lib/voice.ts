import type { Property } from "./../contract/validator";
import { categoryLabel, propertyTypeLabel } from "./format";

const spokenBaths = (n: number) => (Number.isInteger(n) ? `${n}` : n === 0.5 ? "a half" : `${Math.floor(n)} and a half`);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Builds the text a voice assistant would speak for a listing.
 * Takes a validated Property only, so every field it reads is guaranteed to exist.
 */
export function voiceResponse(p: Property): string {
  const beds = p.bedrooms === 0 ? "a studio" : plural(p.bedrooms, "bedroom");
  const baths = `${spokenBaths(p.bathrooms)} ${p.bathrooms === 1 ? "bath" : "baths"}`;
  const price = `${new Intl.NumberFormat("en-US").format(p.price)} dollars`;
  const home = propertyTypeLabel(p.property_type).toLowerCase();
  let text = `${p.street_address}${p.unit ? `, unit ${p.unit}` : ""} in ${p.city}, ${p.state}. A ${home} with ${beds}, ${baths}, and ${new Intl.NumberFormat("en-US").format(p.square_feet)} square feet, listed at ${price}.`;
  const sponsors = [...p.local_sponsors].sort((a, b) => a.placement_rank - b.placement_rank);
  if (sponsors.length > 0) {
    text += ` Local help nearby: ${sponsors.map((s) => `${s.name} for ${categoryLabel(s.category).toLowerCase()}`).join(", ")}.`;
  }
  return text;
}
