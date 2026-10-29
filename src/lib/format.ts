import type { Property } from "../contract/validator";

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const formatNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

const humanize = (s: string) => s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
export const amenityLabel = humanize;
export const categoryLabel = (c: string) => (c === "title_escrow" ? "Title & escrow" : humanize(c));
export const propertyTypeLabel = (t: Property["property_type"]) => (t === "single_family" ? "Single-family home" : humanize(t));
export const statusLabel = (s: Property["listing_status"]) => humanize(s);

export const fullAddress = (p: Property) =>
  `${p.street_address}${p.unit ? `, Unit ${p.unit}` : ""}, ${p.city}, ${p.state} ${p.zip_code}`;
